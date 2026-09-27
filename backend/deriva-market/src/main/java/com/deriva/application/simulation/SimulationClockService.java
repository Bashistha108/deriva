package com.deriva.application.simulation;

import com.deriva.domain.market.*;
import com.deriva.persistence.market.*;
import com.deriva.domain.simulation.*;
import com.deriva.persistence.simulation.*;
import com.deriva.domain.options.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SimulationClockService {

    private final InstrumentRepository instrumentRepository;
    private final OptionContractRepository optionContractRepository;
    private final MarketPriceSnapshotRepository marketPriceSnapshotRepository;
    private final OptionMarketSnapshotRepository optionMarketSnapshotRepository;
    private final SimulationRunRepository simulationRunRepository;
    private final MarketSessionRepository marketSessionRepository;
    private final MarketTickRepository marketTickRepository;
    
    private final SimpMessagingTemplate messagingTemplate;
    
    // In-memory state
    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>();
    private final Map<Long, Long> oiMap = new ConcurrentHashMap<>();
    private final Map<Long, Long> volMap = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private UUID runId;
    private Long sessionId;
    private long seqNum = 1;

    private final Map<String, Long> nextUpdateTimes = new ConcurrentHashMap<>();
    private final Map<Long, MarketPriceSnapshot> pendingStockSnaps = new ConcurrentHashMap<>();
    private final Map<Long, OptionMarketSnapshot> pendingOptionSnaps = new ConcurrentHashMap<>();

    public SimulationClockService(
            InstrumentRepository instrumentRepository, 
            OptionContractRepository optionContractRepository,
            MarketPriceSnapshotRepository marketPriceSnapshotRepository,
            OptionMarketSnapshotRepository optionMarketSnapshotRepository,
            SimulationRunRepository simulationRunRepository,
            MarketSessionRepository marketSessionRepository,
            MarketTickRepository marketTickRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
        this.marketPriceSnapshotRepository = marketPriceSnapshotRepository;
        this.optionMarketSnapshotRepository = optionMarketSnapshotRepository;
        this.simulationRunRepository = simulationRunRepository;
        this.marketSessionRepository = marketSessionRepository;
        this.marketTickRepository = marketTickRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void init() {
        // Initialize Simulation Run
        SimulationRun run = new SimulationRun();
        run.setId(UUID.randomUUID());
        run.setSeed(42L);
        run.setStatus(SimulationRunStatus.RUNNING);
        run.setStartedAt(LocalDateTime.now());
        run.setCreatedAt(LocalDateTime.now());
        run = simulationRunRepository.save(run);
        this.runId = run.getId();

        // Initialize Market Session
        MarketSession session = new MarketSession();
        session.setSimulationRunId(this.runId);
        session.setTradingDate(LocalDate.now());
        session.setOpensAt(LocalDateTime.now());
        session.setClosesAt(LocalDateTime.now().plusHours(8));
        session.setStatus(MarketSessionStatus.OPEN);
        session.setCreatedAt(LocalDateTime.now());
        session = marketSessionRepository.save(session);
        this.sessionId = session.getId();

        // Load initial prices
        long now = System.currentTimeMillis();
        for (Instrument instrument : instrumentRepository.findAll()) {
            if (instrument.isActive()) {
                currentPrices.put(instrument.getSymbol(), instrument.getInitialPrice());
                // Random initial update time between now and 5 seconds
                nextUpdateTimes.put(instrument.getSymbol(), now + random.nextInt(5000));
            }
        }
        
        // Initialize OI and Vol mappings for all contracts, and seed contracts if empty
        List<OptionContract> allContracts = optionContractRepository.findAll();
        if (allContracts.isEmpty()) {
            System.out.println("No OptionContracts found. Generating options chain for all instruments...");
            int[] dteOffsets = {7, 15, 30, 45, 60, 90};
            List<OptionContract> newContracts = new ArrayList<>();
            for (Instrument instrument : instrumentRepository.findAll()) {
                if (!instrument.isActive()) continue;
                double basePrice = instrument.getInitialPrice().doubleValue();
                double strikeStep = Math.max(1.0, Math.round(basePrice * 0.02)); // 2% step
                double minStrike = Math.max(strikeStep, Math.round(basePrice * 0.8 / strikeStep) * strikeStep);
                double maxStrike = Math.round(basePrice * 1.2 / strikeStep) * strikeStep;
                
                for (int dte : dteOffsets) {
                    LocalDate expiry = LocalDate.now().plusDays(dte);
                    for (double strike = minStrike; strike <= maxStrike; strike += strikeStep) {
                        for (OptionType type : OptionType.values()) {
                            OptionContract contract = new OptionContract();
                            contract.setUnderlyingInstrumentId(instrument.getId());
                            contract.setStrikePrice(BigDecimal.valueOf(strike).setScale(2, RoundingMode.HALF_UP));
                            contract.setExpirationDate(expiry);
                            contract.setOptionType(type);
                            contract.setContractMultiplier(100);
                            contract.setStatus(OptionContractStatus.ACTIVE);
                            contract.setCreatedAt(LocalDateTime.now());
                            newContracts.add(contract);
                        }
                    }
                }
            }
            allContracts = optionContractRepository.saveAll(newContracts);
            System.out.println("Generated " + allContracts.size() + " option contracts.");
        }

        for (OptionContract contract : allContracts) {
            oiMap.put(contract.getId(), (long) (1000 + random.nextInt(5000)));
            volMap.put(contract.getId(), (long) random.nextInt(500));
        }
    }

    @Scheduled(fixedRate = 1000)
    public void advanceTick() {
        if (currentPrices.isEmpty() || runId == null) return;

        long now = System.currentTimeMillis();
        boolean anyUpdates = false;
        
        List<Instrument> instruments = instrumentRepository.findAll();
        
        // Settings for Black-Scholes
        double T = 30.0 / 365.0; 
        double r = 0.04;
        
        Map<String, BigDecimal> broadcastUpdates = new HashMap<>();

        for (Instrument instrument : instruments) {
            if (!instrument.isActive()) continue;
            String symbol = instrument.getSymbol();
            
            Long nextUpdate = nextUpdateTimes.getOrDefault(symbol, 0L);
            if (now < nextUpdate) {
                continue; // Not time to update this stock yet
            }
            
            anyUpdates = true;
            // Schedule next update between 1s and 10s from now
            nextUpdateTimes.put(symbol, now + 1000 + random.nextInt(9000));
            
            try {
                BigDecimal bdOldPrice = currentPrices.get(symbol);
                if (bdOldPrice == null) continue;
                double oldPrice = bdOldPrice.doubleValue();
                
                // GBM simulation
                double vol = 0.001;
                double drift = 0.00002;
                double z = random.nextGaussian();
                double jump = 0;
                if (random.nextDouble() < 0.02) {
                    jump = vol * (2.0 + random.nextDouble()) * (random.nextBoolean() ? 1.0 : -1.0);
                }
                double returnPct = drift + (vol * z) + jump;
                double newPrice = Math.max(1.0, oldPrice * (1.0 + returnPct));
                BigDecimal roundedPrice = BigDecimal.valueOf(newPrice).setScale(4, RoundingMode.HALF_UP);
                
                currentPrices.put(symbol, roundedPrice);
                broadcastUpdates.put(symbol, roundedPrice);

                // Save Stock Snapshot in memory
                MarketPriceSnapshot ms = new MarketPriceSnapshot();
                ms.setSimulationRunId(runId);
                ms.setInstrumentId(instrument.getId());
                ms.setMarketSessionId(sessionId);
                ms.setTimestamp(LocalDateTime.now());
                ms.setPrice(roundedPrice);
                ms.setPreviousPrice(bdOldPrice);
                ms.setChange(roundedPrice.subtract(bdOldPrice));
                ms.setVolume((long) random.nextInt(1000));
                pendingStockSnaps.put(instrument.getId(), ms);

                // Compute and Save Option Snapshots in memory
                List<OptionContract> contracts = optionContractRepository
                    .findByUnderlyingInstrumentIdAndExpirationDateGreaterThanEqual(instrument.getId(), LocalDate.now());
                
                for (OptionContract contract : contracts) {
                    double strike = contract.getStrikePrice().doubleValue();
                    double dist = Math.abs(strike - newPrice) / newPrice;
                    double v = 0.20 + (dist * 0.5); 
                    
                    BigDecimal price = BlackScholesModel.calculatePrice(contract.getOptionType(), newPrice, strike, T, r, v);
                    OptionGreeks greeks = BlackScholesModel.calculateGreeks(contract.getOptionType(), newPrice, strike, T, r, v);
                    
                    Long currentOI = oiMap.getOrDefault(contract.getId(), 1000L);
                    Long currentVol = volMap.getOrDefault(contract.getId(), 0L);
                    
                    long addedVol = random.nextInt(20);
                    currentVol += addedVol;
                    if (currentVol > currentOI) {
                        currentOI = currentVol + random.nextInt(100);
                    }
                    
                    oiMap.put(contract.getId(), currentOI);
                    volMap.put(contract.getId(), currentVol);

                    OptionMarketSnapshot os = new OptionMarketSnapshot();
                    os.setOptionContractId(contract.getId());
                    os.setMarketSessionId(sessionId);
                    os.setTimestamp(LocalDateTime.now());
                    os.setUnderlyingPrice(roundedPrice);
                    os.setTheoreticalPrice(price);
                    os.setBidPrice(price.multiply(BigDecimal.valueOf(0.98)).setScale(2, RoundingMode.HALF_UP));
                    os.setAskPrice(price.multiply(BigDecimal.valueOf(1.02)).setScale(2, RoundingMode.HALF_UP));
                    os.setMidPrice(price);
                    os.setImpliedVolatility(BigDecimal.valueOf(v).setScale(6, RoundingMode.HALF_UP));
                    os.setDelta(greeks.getDelta());
                    os.setGamma(greeks.getGamma());
                    os.setTheta(greeks.getTheta());
                    os.setVega(greeks.getVega());
                    os.setRho(greeks.getRho());
                    os.setVolume(currentVol);
                    os.setOpenInterest(currentOI);
                    
                pendingOptionSnaps.put(contract.getId(), os);
            }
        } catch (Exception e) {
            System.err.println("Error simulating tick for " + symbol + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    if (anyUpdates && !broadcastUpdates.isEmpty()) {
            messagingTemplate.convertAndSend("/topic/market", broadcastUpdates);
        }
    }

    @Scheduled(fixedRate = 60000)
    public void flushToDatabase() {
        if (pendingStockSnaps.isEmpty() && pendingOptionSnaps.isEmpty()) return;

        // Create Market Tick for this minute's flush
        MarketTick tick = new MarketTick();
        tick.setSimulationRunId(this.runId);
        tick.setSimulatedTimestamp(LocalDateTime.now());
        tick.setSequenceNumber(seqNum++);
        tick.setCalculationStartedAt(LocalDateTime.now());
        tick.setStatus("COMPLETED");
        tick = marketTickRepository.save(tick);
        final Long tickId = tick.getId();

        List<MarketPriceSnapshot> stockSnaps = new ArrayList<>(pendingStockSnaps.values());
        for (MarketPriceSnapshot snap : stockSnaps) {
            snap.setMarketTickId(tickId);
        }
        
        List<OptionMarketSnapshot> optionSnaps = new ArrayList<>(pendingOptionSnaps.values());
        for (OptionMarketSnapshot snap : optionSnaps) {
            snap.setMarketTickId(tickId);
        }

        marketPriceSnapshotRepository.saveAll(stockSnaps);
        optionMarketSnapshotRepository.saveAll(optionSnaps);
    }

    public Map<String, BigDecimal> getCurrentPrices() {
        return new ConcurrentHashMap<>(currentPrices);
    }
}
