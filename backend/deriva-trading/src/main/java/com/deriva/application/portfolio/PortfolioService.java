package com.deriva.application.portfolio;

import com.deriva.persistence.portfolio.PositionRepository;
import com.deriva.persistence.portfolio.PositionSnapshotRepository;
import com.deriva.persistence.portfolio.PortfolioSnapshotRepository;
import org.springframework.stereotype.Service;

@Service
public class PortfolioService {

    private final PositionRepository positionRepository;
    private final PositionSnapshotRepository positionSnapshotRepository;
    private final PortfolioSnapshotRepository portfolioSnapshotRepository;
    private final com.deriva.persistence.portfolio.CashAccountRepository cashAccountRepository;
    private final com.deriva.application.simulation.SimulationClockService simulationClockService;
    private final com.deriva.persistence.market.InstrumentRepository instrumentRepository;

    public PortfolioService(PositionRepository positionRepository, 
                            PositionSnapshotRepository positionSnapshotRepository, 
                            PortfolioSnapshotRepository portfolioSnapshotRepository,
                            com.deriva.persistence.portfolio.CashAccountRepository cashAccountRepository,
                            com.deriva.application.simulation.SimulationClockService simulationClockService,
                            com.deriva.persistence.market.InstrumentRepository instrumentRepository) {
        this.positionRepository = positionRepository;
        this.positionSnapshotRepository = positionSnapshotRepository;
        this.portfolioSnapshotRepository = portfolioSnapshotRepository;
        this.cashAccountRepository = cashAccountRepository;
        this.simulationClockService = simulationClockService;
        this.instrumentRepository = instrumentRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public void updatePosition(java.util.UUID userId, Long instrumentId, Long optionContractId, int quantity, java.math.BigDecimal executionPrice) {
        java.util.List<com.deriva.domain.portfolio.Position> positions = positionRepository.findByUserId(userId);
        
        Long actualInstrumentId = optionContractId != null ? null : instrumentId;
        
        com.deriva.domain.portfolio.Position pos = positions.stream()
            .filter(p -> (actualInstrumentId == null ? p.getInstrumentId() == null : actualInstrumentId.equals(p.getInstrumentId())) && 
                         (optionContractId == null ? p.getOptionContractId() == null : optionContractId.equals(p.getOptionContractId())))
            .findFirst()
            .orElse(null);

        if (pos == null) {
            pos = new com.deriva.domain.portfolio.Position();
            pos.setUserId(userId);
            pos.setInstrumentId(actualInstrumentId);
            pos.setOptionContractId(optionContractId);
            pos.setQuantity(quantity);
            pos.setAverageEntryPrice(executionPrice);
            pos.setRealizedPnl(java.math.BigDecimal.ZERO);
            pos.setVersion(0);
            pos.setOpenedAt(java.time.LocalDateTime.now());
            pos.setUpdatedAt(java.time.LocalDateTime.now());
        } else {
            if (pos.getQuantity() == 0) {
                // Re-opening a previously closed position
                pos.setQuantity(quantity);
                pos.setAverageEntryPrice(executionPrice);
                // Keep the accumulated realizedPnl intact!
            } else {
                int newQuantity = pos.getQuantity() + quantity;
                int multiplier = optionContractId != null ? 100 : 1;
                
                if (newQuantity == 0) {
                    // Closed position
                    java.math.BigDecimal closedQuantity = java.math.BigDecimal.valueOf(Math.abs(quantity));
                    java.math.BigDecimal entryValue = pos.getAverageEntryPrice().multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(multiplier));
                    java.math.BigDecimal exitValue = executionPrice.multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(multiplier));
                    java.math.BigDecimal pnl = pos.getQuantity() > 0 ? exitValue.subtract(entryValue) : entryValue.subtract(exitValue);
                    pos.setRealizedPnl(pos.getRealizedPnl().add(pnl));
                    pos.setQuantity(0);
                    // Do not reset averageEntryPrice to 0 so we can show it in history
                } else if (Math.signum(pos.getQuantity()) == Math.signum(quantity)) {
                    // Adding to position
                    java.math.BigDecimal oldCost = pos.getAverageEntryPrice().multiply(java.math.BigDecimal.valueOf(Math.abs(pos.getQuantity())));
                    java.math.BigDecimal newCost = executionPrice.multiply(java.math.BigDecimal.valueOf(Math.abs(quantity)));
                    java.math.BigDecimal avgCost = oldCost.add(newCost).divide(java.math.BigDecimal.valueOf(Math.abs(newQuantity)), 4, java.math.RoundingMode.HALF_UP);
                    pos.setQuantity(newQuantity);
                    pos.setAverageEntryPrice(avgCost);
                } else {
                    // Reducing position
                    java.math.BigDecimal closedQuantity = java.math.BigDecimal.valueOf(Math.abs(quantity));
                    java.math.BigDecimal entryValue = pos.getAverageEntryPrice().multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(multiplier));
                    java.math.BigDecimal exitValue = executionPrice.multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(multiplier));
                    java.math.BigDecimal pnl = pos.getQuantity() > 0 ? exitValue.subtract(entryValue) : entryValue.subtract(exitValue);
                    pos.setRealizedPnl(pos.getRealizedPnl().add(pnl));
                    pos.setQuantity(newQuantity);
                }
            }
            pos.setUpdatedAt(java.time.LocalDateTime.now());
        }
        positionRepository.save(pos);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void generatePortfolioSnapshots() {
        java.util.List<com.deriva.domain.portfolio.CashAccount> accounts = cashAccountRepository.findAll();
        for (com.deriva.domain.portfolio.CashAccount account : accounts) {
            java.util.List<com.deriva.domain.portfolio.Position> positions = positionRepository.findByUserId(account.getUserId());
            
            java.math.BigDecimal portfolioValue = java.math.BigDecimal.ZERO;
            java.math.BigDecimal unrealizedPnl = java.math.BigDecimal.ZERO;
            java.math.BigDecimal realizedPnl = java.math.BigDecimal.ZERO;
            
            for (com.deriva.domain.portfolio.Position pos : positions) {
                if (pos.getQuantity() == 0) {
                    realizedPnl = realizedPnl.add(pos.getRealizedPnl());
                    continue;
                }
                
                java.math.BigDecimal currentPrice = java.math.BigDecimal.ZERO;
                int multiplier = 1;
                
                if (pos.getOptionContractId() != null) {
                    com.deriva.domain.market.OptionMarketSnapshot snap = simulationClockService.getLiveOptionSnapshot(pos.getOptionContractId());
                    if (snap != null && snap.getMidPrice() != null) {
                        currentPrice = snap.getMidPrice();
                    }
                    multiplier = 100;
                } else if (pos.getInstrumentId() != null) {
                    com.deriva.domain.market.Instrument inst = instrumentRepository.findById(pos.getInstrumentId()).orElse(null);
                    if (inst != null) {
                        currentPrice = simulationClockService.getCurrentPrices().getOrDefault(inst.getSymbol(), inst.getInitialPrice());
                    }
                    multiplier = 1;
                }
                
                java.math.BigDecimal notional = currentPrice.multiply(java.math.BigDecimal.valueOf(Math.abs(pos.getQuantity()))).multiply(java.math.BigDecimal.valueOf(multiplier));
                if (pos.getQuantity() < 0) {
                    notional = notional.negate();
                }
                portfolioValue = portfolioValue.add(notional);
                
                java.math.BigDecimal entryValue = pos.getAverageEntryPrice().multiply(java.math.BigDecimal.valueOf(Math.abs(pos.getQuantity()))).multiply(java.math.BigDecimal.valueOf(multiplier));
                java.math.BigDecimal uPnl = pos.getQuantity() > 0 ? notional.subtract(entryValue) : entryValue.subtract(notional); // Wait, if short, uPnl is entry - current. `notional` here is negative, so entry - abs(notional). Actually just entryValue - abs(notional) is better.
                // Let's re-calculate uPnl properly:
                java.math.BigDecimal absNotional = currentPrice.multiply(java.math.BigDecimal.valueOf(Math.abs(pos.getQuantity()))).multiply(java.math.BigDecimal.valueOf(multiplier));
                uPnl = pos.getQuantity() > 0 ? absNotional.subtract(entryValue) : entryValue.subtract(absNotional);
                
                unrealizedPnl = unrealizedPnl.add(uPnl);
                realizedPnl = realizedPnl.add(pos.getRealizedPnl());
            }
            
            com.deriva.domain.portfolio.PortfolioSnapshot snap = new com.deriva.domain.portfolio.PortfolioSnapshot();
            snap.setUserId(account.getUserId());
            snap.setMarketTickId(1L);
            snap.setTimestamp(java.time.LocalDateTime.now());
            snap.setCashBalance(account.getBalance());
            snap.setReservedCash(account.getReservedBalance());
            snap.setAvailableCash(account.getBalance().subtract(account.getReservedBalance()));
            snap.setPortfolioValue(portfolioValue);
            snap.setTotalEquity(account.getBalance().add(portfolioValue));
            snap.setRealizedPnl(realizedPnl);
            snap.setUnrealizedPnl(unrealizedPnl);
            snap.setDelta(java.math.BigDecimal.ZERO);
            snap.setGamma(java.math.BigDecimal.ZERO);
            snap.setTheta(java.math.BigDecimal.ZERO);
            snap.setVega(java.math.BigDecimal.ZERO);
            snap.setRho(java.math.BigDecimal.ZERO);
            
            portfolioSnapshotRepository.save(snap);
        }
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void seedHistoricalSnapshots() {
        if (portfolioSnapshotRepository.count() > 0) return;
        
        java.util.List<com.deriva.domain.portfolio.CashAccount> accounts = cashAccountRepository.findAll();
        for (com.deriva.domain.portfolio.CashAccount account : accounts) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            java.math.BigDecimal baseValue = new java.math.BigDecimal("100000.00");
            java.util.Random rand = new java.util.Random();
            
            // Seed last 7 days of daily snapshots
            for (int i = 7; i >= 1; i--) {
                com.deriva.domain.portfolio.PortfolioSnapshot snap = new com.deriva.domain.portfolio.PortfolioSnapshot();
                snap.setUserId(account.getUserId());
                snap.setMarketTickId(0L);
                snap.setTimestamp(now.minusDays(i));
                snap.setCashBalance(baseValue);
                snap.setReservedCash(java.math.BigDecimal.ZERO);
                snap.setAvailableCash(baseValue);
                snap.setPortfolioValue(java.math.BigDecimal.ZERO);
                
                // Add some slight random walk for realism in the chart (e.g. +/- $500 per day)
                double change = (rand.nextDouble() - 0.5) * 1000;
                baseValue = baseValue.add(java.math.BigDecimal.valueOf(change));
                
                snap.setTotalEquity(baseValue);
                snap.setRealizedPnl(java.math.BigDecimal.ZERO);
                snap.setUnrealizedPnl(java.math.BigDecimal.ZERO);
                snap.setDelta(java.math.BigDecimal.ZERO);
                snap.setGamma(java.math.BigDecimal.ZERO);
                snap.setTheta(java.math.BigDecimal.ZERO);
                snap.setVega(java.math.BigDecimal.ZERO);
                snap.setRho(java.math.BigDecimal.ZERO);
                portfolioSnapshotRepository.save(snap);
            }
        }
    }
}
