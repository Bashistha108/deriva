package com.deriva.api.market;

import com.deriva.application.simulation.MarketDataService;
import com.deriva.domain.market.MarketPriceSnapshot;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {

    private final MarketDataService marketDataService;
    private final com.deriva.application.simulation.SimulationClockService simulationClockService;
    private final com.deriva.persistence.market.InstrumentRepository instrumentRepository;
    private final com.deriva.persistence.market.OptionContractRepository optionContractRepository;
    private final com.deriva.persistence.market.OptionMarketSnapshotRepository optionMarketSnapshotRepository;

    public MarketDataController(
            MarketDataService marketDataService, 
            com.deriva.application.simulation.SimulationClockService simulationClockService,
            com.deriva.persistence.market.InstrumentRepository instrumentRepository,
            com.deriva.persistence.market.OptionContractRepository optionContractRepository,
            com.deriva.persistence.market.OptionMarketSnapshotRepository optionMarketSnapshotRepository) {
        this.marketDataService = marketDataService;
        this.simulationClockService = simulationClockService;
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
        this.optionMarketSnapshotRepository = optionMarketSnapshotRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<java.util.Map<String, java.math.BigDecimal>> getCurrentPrices() {
        return ResponseEntity.ok(simulationClockService.getCurrentPrices());
    }

    @GetMapping("/options/{symbol}")
    public ResponseEntity<java.util.Map<String, java.util.List<com.deriva.api.dto.OptionsChainRowDTO>>> getOptionsChain(@PathVariable String symbol) {
        com.deriva.domain.market.Instrument instrument = instrumentRepository.findAll().stream()
                .filter(i -> i.getSymbol().equalsIgnoreCase(symbol))
                .findFirst().orElse(null);
        if (instrument == null) {
            return ResponseEntity.notFound().build();
        }

        java.util.List<com.deriva.domain.market.OptionContract> contracts = optionContractRepository
                .findByUnderlyingInstrumentIdAndExpirationDateGreaterThanEqual(instrument.getId(), java.time.LocalDate.now());

        // Map of ExpirationDate -> (Map of Strike -> Row)
        java.util.Map<String, java.util.Map<Double, com.deriva.api.dto.OptionsChainRowDTO>> grouped = new java.util.HashMap<>();

        for (com.deriva.domain.market.OptionContract contract : contracts) {
            String expDate = contract.getExpirationDate().toString();
            
            com.deriva.domain.market.OptionMarketSnapshot snap = simulationClockService.getLiveOptionSnapshot(contract.getId());
            if (snap == null) {
                java.util.List<com.deriva.domain.market.OptionMarketSnapshot> snaps = optionMarketSnapshotRepository
                        .findTop100ByOptionContractIdOrderByTimestampDesc(contract.getId());
                if (snaps.isEmpty()) continue;
                snap = snaps.get(0);
            }
            double strike = contract.getStrikePrice().doubleValue();
            
            java.util.Map<Double, com.deriva.api.dto.OptionsChainRowDTO> rows = grouped.computeIfAbsent(expDate, k -> new java.util.HashMap<>());
            
            com.deriva.api.dto.OptionsChainRowDTO row = rows.computeIfAbsent(strike, k -> {
                com.deriva.api.dto.OptionsChainRowDTO r = new com.deriva.api.dto.OptionsChainRowDTO();
                r.setStrike(strike);
                return r;
            });
            
            if (contract.getOptionType() == com.deriva.domain.market.OptionType.CALL) {
                row.setCallBid(snap.getBidPrice());
                row.setCallAsk(snap.getAskPrice());
                row.setCallDelta(snap.getDelta());
                row.setCallGamma(snap.getGamma());
                row.setCallTheta(snap.getTheta());
                row.setCallVega(snap.getVega());
                row.setCallVol(snap.getVolume().intValue());
                row.setCallOI(snap.getOpenInterest().intValue());
                row.setCallIV(snap.getImpliedVolatility() != null ? String.format("%.1f%%", snap.getImpliedVolatility().doubleValue() * 100) : "0%");
            } else {
                row.setPutBid(snap.getBidPrice());
                row.setPutAsk(snap.getAskPrice());
                row.setPutDelta(snap.getDelta());
                row.setPutGamma(snap.getGamma());
                row.setPutTheta(snap.getTheta());
                row.setPutVega(snap.getVega());
                row.setPutVol(snap.getVolume().intValue());
                row.setPutOI(snap.getOpenInterest().intValue());
                row.setPutIV(snap.getImpliedVolatility() != null ? String.format("%.1f%%", snap.getImpliedVolatility().doubleValue() * 100) : "0%");
            }
        }
        
        java.util.Map<String, java.util.List<com.deriva.api.dto.OptionsChainRowDTO>> result = new java.util.HashMap<>();
        for (java.util.Map.Entry<String, java.util.Map<Double, com.deriva.api.dto.OptionsChainRowDTO>> entry : grouped.entrySet()) {
            java.util.List<com.deriva.api.dto.OptionsChainRowDTO> list = new java.util.ArrayList<>(entry.getValue().values());
            list.sort(java.util.Comparator.comparingDouble(com.deriva.api.dto.OptionsChainRowDTO::getStrike));
            result.put(entry.getKey(), list);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{instrumentId}/history")
    public ResponseEntity<List<MarketPriceSnapshot>> getHistory(
            @PathVariable Long instrumentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        List<MarketPriceSnapshot> history = marketDataService.getHistoricalPrices(instrumentId, start, end);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/simulation/pause")
    public ResponseEntity<Void> pauseSimulation() {
        simulationClockService.setPaused(true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/simulation/resume")
    public ResponseEntity<Void> resumeSimulation() {
        simulationClockService.setPaused(false);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/simulation/status")
    public ResponseEntity<java.util.Map<String, String>> getSimulationStatus() {
        return ResponseEntity.ok(java.util.Map.of("status", simulationClockService.isPaused() ? "PAUSED" : "RUNNING"));
    }
}
