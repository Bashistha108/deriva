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

    public PortfolioService(PositionRepository positionRepository, PositionSnapshotRepository positionSnapshotRepository, PortfolioSnapshotRepository portfolioSnapshotRepository) {
        this.positionRepository = positionRepository;
        this.positionSnapshotRepository = positionSnapshotRepository;
        this.portfolioSnapshotRepository = portfolioSnapshotRepository;
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
            int newQuantity = pos.getQuantity() + quantity;
            if (newQuantity == 0) {
                // Closed position
                java.math.BigDecimal closedQuantity = java.math.BigDecimal.valueOf(Math.abs(quantity));
                java.math.BigDecimal entryValue = pos.getAverageEntryPrice().multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(100));
                java.math.BigDecimal exitValue = executionPrice.multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(100));
                java.math.BigDecimal pnl = pos.getQuantity() > 0 ? exitValue.subtract(entryValue) : entryValue.subtract(exitValue);
                pos.setRealizedPnl(pos.getRealizedPnl().add(pnl));
                pos.setQuantity(0);
                pos.setAverageEntryPrice(java.math.BigDecimal.ZERO);
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
                java.math.BigDecimal entryValue = pos.getAverageEntryPrice().multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(100));
                java.math.BigDecimal exitValue = executionPrice.multiply(closedQuantity).multiply(java.math.BigDecimal.valueOf(100));
                java.math.BigDecimal pnl = pos.getQuantity() > 0 ? exitValue.subtract(entryValue) : entryValue.subtract(exitValue);
                pos.setRealizedPnl(pos.getRealizedPnl().add(pnl));
                pos.setQuantity(newQuantity);
            }
            pos.setUpdatedAt(java.time.LocalDateTime.now());
        }
        positionRepository.save(pos);
    }

    public void generatePortfolioSnapshots() {
        // Logic to run per-tick to value open positions against current market snapshots 
        // to generate Unrealized P&L and Portfolio Greeks
    }
}
