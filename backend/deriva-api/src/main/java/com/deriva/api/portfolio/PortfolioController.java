package com.deriva.api.portfolio;

import com.deriva.application.portfolio.CashAccountService;
import com.deriva.application.security.CustomUserDetails;
import com.deriva.application.simulation.SimulationClockService;
import com.deriva.domain.portfolio.CashAccount;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.deriva.persistence.portfolio.PositionRepository;
import com.deriva.persistence.market.InstrumentRepository;
import com.deriva.persistence.market.OptionContractRepository;
import com.deriva.domain.portfolio.Position;
import com.deriva.domain.market.Instrument;
import com.deriva.domain.market.OptionContract;
import com.deriva.domain.market.OptionMarketSnapshot;
import java.util.List;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final CashAccountService cashAccountService;
    private final PositionRepository positionRepository;
    private final InstrumentRepository instrumentRepository;
    private final OptionContractRepository optionContractRepository;
    private final SimulationClockService simulationClockService;
    private final com.deriva.persistence.portfolio.PortfolioSnapshotRepository portfolioSnapshotRepository;

    public PortfolioController(CashAccountService cashAccountService, 
                               PositionRepository positionRepository,
                               InstrumentRepository instrumentRepository,
                               OptionContractRepository optionContractRepository,
                               SimulationClockService simulationClockService,
                               com.deriva.persistence.portfolio.PortfolioSnapshotRepository portfolioSnapshotRepository) {
        this.cashAccountService = cashAccountService;
        this.positionRepository = positionRepository;
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
        this.simulationClockService = simulationClockService;
        this.portfolioSnapshotRepository = portfolioSnapshotRepository;
    }

    @GetMapping("/positions")
    public ResponseEntity<List<PositionDTO>> getPositions(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        List<Position> positions = positionRepository.findByUserId(user.getId());
        
        List<PositionDTO> dtos = positions.stream()
            .filter(pos -> pos.getQuantity() != 0)
            .map(pos -> {
            PositionDTO dto = new PositionDTO();
            dto.setId(pos.getId());
            dto.setInstrumentId(pos.getInstrumentId());
            dto.setOptionContractId(pos.getOptionContractId());
            dto.setQuantity(pos.getQuantity());
            dto.setAverageEntryPrice(pos.getAverageEntryPrice());
            dto.setRealizedPnl(pos.getRealizedPnl());
            
            if (pos.getInstrumentId() != null) {
                Instrument inst = instrumentRepository.findById(pos.getInstrumentId()).orElse(null);
                if (inst != null) {
                    dto.setSymbol(inst.getSymbol());
                    dto.setName(inst.getName());
                    dto.setType("STOCK");
                    dto.setContractMultiplier(1);
                    
                    BigDecimal currentPrice = simulationClockService.getCurrentPrices().getOrDefault(inst.getSymbol(), inst.getInitialPrice());
                    dto.setCurrentPrice(currentPrice);
                    dto.setDelta(BigDecimal.ONE);
                    dto.setGamma(BigDecimal.ZERO);
                    dto.setTheta(BigDecimal.ZERO);
                    dto.setVega(BigDecimal.ZERO);
                    
                    if (currentPrice != null && dto.getAverageEntryPrice() != null) {
                        BigDecimal unrealized = currentPrice.subtract(dto.getAverageEntryPrice())
                                .multiply(BigDecimal.valueOf(dto.getQuantity()));
                        dto.setUnrealizedPnl(unrealized);
                    }
                }
            } else if (pos.getOptionContractId() != null) {
                OptionContract opt = optionContractRepository.findById(pos.getOptionContractId()).orElse(null);
                if (opt != null) {
                    Instrument underlying = instrumentRepository.findById(opt.getUnderlyingInstrumentId()).orElse(null);
                    if (underlying != null) {
                        dto.setSymbol(underlying.getSymbol());
                        dto.setName(underlying.getName());
                    }
                    dto.setType("OPTION");
                    dto.setExpirationDate(opt.getExpirationDate());
                    dto.setStrikePrice(opt.getStrikePrice());
                    dto.setOptionType(opt.getOptionType());
                    dto.setContractMultiplier(opt.getContractMultiplier());
                    
                    OptionMarketSnapshot snap = simulationClockService.getLiveOptionSnapshot(opt.getId());
                    if (snap != null) {
                        // Use mid price or bid/ask depending on short/long? Using mid for simplicity
                        BigDecimal currentPrice = snap.getMidPrice();
                        dto.setCurrentPrice(currentPrice);
                        dto.setDelta(snap.getDelta());
                        dto.setGamma(snap.getGamma());
                        dto.setTheta(snap.getTheta());
                        dto.setVega(snap.getVega());
                        
                        if (currentPrice != null && dto.getAverageEntryPrice() != null) {
                            BigDecimal unrealized = currentPrice.subtract(dto.getAverageEntryPrice())
                                    .multiply(BigDecimal.valueOf(dto.getQuantity()))
                                    .multiply(BigDecimal.valueOf(opt.getContractMultiplier()));
                            dto.setUnrealizedPnl(unrealized);
                        }
                    }
                }
            }
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/cash")
    public ResponseEntity<CashAccount> getCashAccount(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        
        Optional<CashAccount> account = cashAccountService.getAccount(user.getId());
        return account.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/cash/balance")
    public ResponseEntity<Void> setBalance(@AuthenticationPrincipal CustomUserDetails user, @RequestBody Map<String, BigDecimal> payload) {
        if (user == null) return ResponseEntity.status(401).build();
        
        BigDecimal amount = payload.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build();
        }
        
        cashAccountService.setBalance(user.getId(), amount);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<com.deriva.domain.portfolio.PortfolioSnapshot>> getPortfolioHistory(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        List<com.deriva.domain.portfolio.PortfolioSnapshot> history = portfolioSnapshotRepository.findAll().stream()
            .filter(s -> s.getUserId().equals(user.getId()))
            .sorted(java.util.Comparator.comparing(com.deriva.domain.portfolio.PortfolioSnapshot::getTimestamp))
            .toList();
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/closed-positions")
    public ResponseEntity<List<PositionDTO>> getClosedPositions(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        List<Position> positions = positionRepository.findByUserId(user.getId());
        
        List<PositionDTO> dtos = positions.stream()
            .filter(pos -> pos.getQuantity() == 0 && pos.getRealizedPnl().compareTo(BigDecimal.ZERO) != 0)
            .map(pos -> {
            PositionDTO dto = new PositionDTO();
            dto.setId(pos.getId());
            dto.setInstrumentId(pos.getInstrumentId());
            dto.setOptionContractId(pos.getOptionContractId());
            dto.setQuantity(0);
            dto.setAverageEntryPrice(pos.getAverageEntryPrice());
            dto.setRealizedPnl(pos.getRealizedPnl());
            
            if (pos.getInstrumentId() != null) {
                Instrument inst = instrumentRepository.findById(pos.getInstrumentId()).orElse(null);
                if (inst != null) {
                    dto.setSymbol(inst.getSymbol());
                    dto.setName(inst.getName());
                    dto.setType("STOCK");
                    dto.setContractMultiplier(1);
                }
            } else if (pos.getOptionContractId() != null) {
                OptionContract opt = optionContractRepository.findById(pos.getOptionContractId()).orElse(null);
                if (opt != null) {
                    Instrument underlying = instrumentRepository.findById(opt.getUnderlyingInstrumentId()).orElse(null);
                    if (underlying != null) {
                        dto.setSymbol(underlying.getSymbol());
                        dto.setName(underlying.getName());
                    }
                    dto.setType("OPTION");
                    dto.setExpirationDate(opt.getExpirationDate());
                    dto.setStrikePrice(opt.getStrikePrice());
                    dto.setOptionType(opt.getOptionType());
                    dto.setContractMultiplier(opt.getContractMultiplier());
                }
            }
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
}
