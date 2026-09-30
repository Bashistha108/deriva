package com.deriva.application.simulation;

import com.deriva.domain.market.*;
import com.deriva.domain.market.values.*;
import com.deriva.persistence.market.*;
import com.deriva.domain.simulation.*;
import com.deriva.persistence.simulation.*;
import com.deriva.persistence.system.SystemSettingRepository;
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
    private final SystemSettingRepository systemSettingRepository;
    private final InstrumentSimulationParameterRepository simulationParameterRepository;

    private final SimpMessagingTemplate messagingTemplate;

    // In-memory state
    private final Map<Long, InstrumentSimulationParameter> simParamsMap = new ConcurrentHashMap<>();
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

    private int priceUpdateMinMs = 1000;
    private int priceUpdateRangeMs = 9000;
    private int databaseFlushMs = 60000;
    private long lastSettingsReload = 0;
    private long lastFlushTime = 0;

    private boolean isPaused = false;

    public void setPaused(boolean paused) {
        this.isPaused = paused;
        com.deriva.domain.system.SystemSetting setting = systemSettingRepository.findById("SIMULATION_PAUSED")
                .orElse(new com.deriva.domain.system.SystemSetting("SIMULATION_PAUSED", "false"));
        setting.setValue(String.valueOf(paused));
        systemSettingRepository.save(setting);
    }

    public boolean isPaused() {
        return isPaused;
    }

    public SimulationClockService(
            InstrumentRepository instrumentRepository,
            OptionContractRepository optionContractRepository,
            MarketPriceSnapshotRepository marketPriceSnapshotRepository,
            OptionMarketSnapshotRepository optionMarketSnapshotRepository,
            SimulationRunRepository simulationRunRepository,
            MarketSessionRepository marketSessionRepository,
            MarketTickRepository marketTickRepository,
            SystemSettingRepository systemSettingRepository,
            InstrumentSimulationParameterRepository simulationParameterRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
        this.marketPriceSnapshotRepository = marketPriceSnapshotRepository;
        this.optionMarketSnapshotRepository = optionMarketSnapshotRepository;
        this.simulationRunRepository = simulationRunRepository;
        this.marketSessionRepository = marketSessionRepository;
        this.marketTickRepository = marketTickRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.simulationParameterRepository = simulationParameterRepository;
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

        // Load simulation parameters into memory
        for (InstrumentSimulationParameter param : simulationParameterRepository.findAll()) {
            simParamsMap.put(param.getInstrumentId(), param);
        }

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
            int[] dteOffsets = { 0, 1, 7, 15, 30, 45, 60, 90 };
            List<OptionContract> newContracts = new ArrayList<>();
            for (Instrument instrument : instrumentRepository.findAll()) {
                if (!instrument.isActive())
                    continue;
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
            InstrumentSimulationParameter param = simParamsMap.get(contract.getUnderlyingInstrumentId());
            long avgVol = param != null ? param.getAverageVolume() : 100000L;
            long baseOI = Math.max(1000, avgVol / 100);
            oiMap.put(contract.getId(), baseOI + random.nextInt((int) Math.max(1, baseOI / 2)));
            volMap.put(contract.getId(), (long) random.nextInt((int) Math.max(1, baseOI / 10)));
        }
    }

    @Scheduled(fixedRate = 1000)
    public void advanceTick() {
        if (currentPrices.isEmpty() || runId == null)
            return;

        long now = System.currentTimeMillis();

        // Reload settings every 10 seconds
        if (now - lastSettingsReload > 10000) {
            try {
                priceUpdateMinMs = Integer.parseInt(systemSettingRepository.findById("SIMULATION_PRICE_UPDATE_MIN_MS")
                        .map(s -> s.getValue()).orElse("1000"));
                priceUpdateRangeMs = Integer.parseInt(systemSettingRepository
                        .findById("SIMULATION_PRICE_UPDATE_RANGE_MS").map(s -> s.getValue()).orElse("9000"));
                databaseFlushMs = Integer.parseInt(systemSettingRepository.findById("SIMULATION_DATABASE_FLUSH_MS")
                        .map(s -> s.getValue()).orElse("60000"));
                isPaused = Boolean.parseBoolean(
                        systemSettingRepository.findById("SIMULATION_PAUSED").map(s -> s.getValue()).orElse("false"));
            } catch (Exception e) {
            }
            lastSettingsReload = now;
        }

        if (isPaused)
            return;

        boolean anyUpdates = false;

        List<Instrument> instruments = instrumentRepository.findAll();

        // Settings for Black-Scholes
        double T = 30.0 / 256.0;
        double r = 0.04;

        Map<String, BigDecimal> broadcastUpdates = new HashMap<>();

        for (Instrument instrument : instruments) {
            if (!instrument.isActive())
                continue;
            String symbol = instrument.getSymbol();

            Long nextUpdate = nextUpdateTimes.getOrDefault(symbol, 0L);
            if (now < nextUpdate) {
                continue; // Not time to update this stock yet
            }

            anyUpdates = true;
            // Schedule next update based on settings
            nextUpdateTimes.put(symbol, now + priceUpdateMinMs + random.nextInt(Math.max(1, priceUpdateRangeMs)));

            try {
                BigDecimal bdOldPrice = currentPrices.get(symbol);
                if (bdOldPrice == null)
                    continue;
                double oldPrice = bdOldPrice.doubleValue();

                BigDecimal roundedPrice;
                double newPrice;

                if (instrument.getInstrumentType() == InstrumentType.STOCK) {
                    InstrumentSimulationParameter param = simParamsMap.get(instrument.getId());
                    double paramVol = param != null ? param.getBaseVolatility().doubleValue() : 0.15;
                    double paramDrift = param != null ? param.getDrift().doubleValue() : 0.00002;
                    double jumpProb = param != null ? param.getJumpProbability().doubleValue() : 0.02;
                    double jumpSize = param != null ? param.getJumpSizeFactor().doubleValue() : 2.0;

                    // GBM simulation
                    double vol = paramVol * 0.01;
                    double drift = paramDrift * 0.001;
                    double z = random.nextGaussian();
                    double jump = 0;
                    if (random.nextDouble() < jumpProb) {
                        jump = vol * (jumpSize + random.nextDouble()) * (random.nextBoolean() ? 1.0 : -1.0);
                    }
                    double returnPct = drift + (vol * z) + jump;
                    newPrice = Math.max(1.0, oldPrice * (1.0 + returnPct));
                    roundedPrice = BigDecimal.valueOf(newPrice).setScale(4, RoundingMode.HALF_UP);
                } else {
                    // ETF/Index price is sum of stock prices at the moment
                    Long sectorId = instrument.getSector() != null ? instrument.getSector().getId() : null;
                    BigDecimal sum = BigDecimal.ZERO;
                    for (Instrument s : instruments) {
                        if (s.isActive() && s.getInstrumentType() == InstrumentType.STOCK) {
                            Long sSectorId = s.getSector() != null ? s.getSector().getId() : null;
                            if (sectorId == null || sectorId.equals(sSectorId)) {
                                sum = sum.add(currentPrices.getOrDefault(s.getSymbol(), s.getInitialPrice()));
                            }
                        }
                    }
                    if (sectorId == null) {
                        // Broad market (e.g. SPY)
                        sum = sum.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                    } else {
                        // Sector ETFs
                        sum = sum.divide(BigDecimal.valueOf(10), 4, RoundingMode.HALF_UP);
                    }
                    roundedPrice = sum.setScale(4, RoundingMode.HALF_UP);
                    newPrice = roundedPrice.doubleValue();
                }

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
                        .findByUnderlyingInstrumentIdAndExpirationDateGreaterThanEqual(instrument.getId(),
                                LocalDate.now());

                for (OptionContract contract : contracts) {
                    double strike = contract.getStrikePrice().doubleValue();
                    double dist = Math.abs(strike - newPrice) / newPrice;

                    Long currentOI = oiMap.getOrDefault(contract.getId(), 1000L);
                    Long currentVol = volMap.getOrDefault(contract.getId(), 0L);

                    InstrumentSimulationParameter param = simParamsMap.get(instrument.getId());
                    long addedVol = random.nextInt((int) Math.max(2, (param != null ? param.getAverageVolume() : 100000L) / 50000));
                    currentVol += addedVol;
                    if (currentVol > currentOI) {
                        currentOI = currentVol + random.nextInt(100);
                    }

                    oiMap.put(contract.getId(), currentOI);
                    volMap.put(contract.getId(), currentVol);

                    double paramVol = param != null ? param.getBaseVolatility().doubleValue() : 0.20;
                    double baseV = paramVol + (dist * 0.5);
                    double demandFactor = 1.0 + Math.min(0.5, ((double) currentVol / Math.max(1, currentOI)) * 0.2);
                    double v = baseV * demandFactor;

                    long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(),
                            contract.getExpirationDate());
                    double actualT = Math.max(1.0, daysBetween) / 365.0;

                    Price priceObj = Price.of(newPrice);
                    Strike strikeObj = Strike.of(strike);
                    DaysToExpiration dteObj = DaysToExpiration.ofYears(actualT);
                    Percent rateObj = Percent.ofDecimal(r);
                    Volatility volObj = Volatility.ofDecimal(v);

                    BigDecimal price = BlackScholesModel.calculatePrice(contract.getOptionType(), priceObj, strikeObj,
                            dteObj, rateObj, volObj);
                    OptionGreeks greeks = BlackScholesModel.calculateGreeks(contract.getOptionType(), priceObj,
                            strikeObj, dteObj, rateObj, volObj);

                    OptionMarketSnapshot os = new OptionMarketSnapshot();
                    os.setOptionContractId(contract.getId());
                    os.setMarketSessionId(sessionId);
                    os.setTimestamp(LocalDateTime.now());
                    os.setUnderlyingPrice(roundedPrice);
                    os.setTheoreticalPrice(price);
                    
                    BigDecimal bid = price.multiply(BigDecimal.valueOf(0.98)).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal ask = price.multiply(BigDecimal.valueOf(1.02)).setScale(2, RoundingMode.HALF_UP);
                    
                    if (ask.compareTo(BigDecimal.valueOf(0.01)) < 0) {
                        ask = BigDecimal.valueOf(0.01);
                    }
                    if (bid.compareTo(BigDecimal.ZERO) < 0) {
                        bid = BigDecimal.ZERO;
                    }
                    if (ask.subtract(bid).compareTo(BigDecimal.valueOf(0.01)) < 0) {
                        ask = bid.add(BigDecimal.valueOf(0.01));
                    }
                    
                    os.setBidPrice(bid);
                    os.setAskPrice(ask);
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

    @Scheduled(fixedRate = 1000)
    public void flushToDatabase() {
        long now = System.currentTimeMillis();
        if (now - lastFlushTime < databaseFlushMs) {
            return;
        }

        if (pendingStockSnaps.isEmpty() && pendingOptionSnaps.isEmpty())
            return;

        lastFlushTime = now;

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

    public OptionMarketSnapshot getLiveOptionSnapshot(Long contractId) {
        return pendingOptionSnaps.get(contractId);
    }
}
