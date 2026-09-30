package com.deriva.api.portfolio;

import com.deriva.application.portfolio.CashAccountService;
import com.deriva.application.security.CustomUserDetails;
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
import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final CashAccountService cashAccountService;
    private final PositionRepository positionRepository;
    private final InstrumentRepository instrumentRepository;
    private final OptionContractRepository optionContractRepository;

    public PortfolioController(CashAccountService cashAccountService, 
                               PositionRepository positionRepository,
                               InstrumentRepository instrumentRepository,
                               OptionContractRepository optionContractRepository) {
        this.cashAccountService = cashAccountService;
        this.positionRepository = positionRepository;
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
    }

    @GetMapping("/positions")
    public ResponseEntity<List<PositionDTO>> getPositions(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        List<Position> positions = positionRepository.findByUserId(user.getId());
        
        List<PositionDTO> dtos = positions.stream().map(pos -> {
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
}
