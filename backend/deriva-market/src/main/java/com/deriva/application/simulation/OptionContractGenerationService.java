package com.deriva.application.simulation;

import com.deriva.persistence.market.InstrumentRepository;
import com.deriva.persistence.market.OptionContractRepository;
import com.deriva.domain.market.values.Strike;
import org.springframework.stereotype.Service;

@Service
public class OptionContractGenerationService {

    private final InstrumentRepository instrumentRepository;
    private final OptionContractRepository optionContractRepository;

    public OptionContractGenerationService(InstrumentRepository instrumentRepository, OptionContractRepository optionContractRepository) {
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
    }

    @jakarta.annotation.PostConstruct
    public void generateContracts() {
        if (optionContractRepository.count() > 0) {
            return; // Already generated
        }
        
        java.time.LocalDate exp1 = java.time.LocalDate.now().plusDays(30);
        java.time.LocalDate exp2 = java.time.LocalDate.now().plusDays(60);

        for (com.deriva.domain.market.Instrument instrument : instrumentRepository.findAll()) {
            if (!instrument.isActive()) continue;
            
            double price = instrument.getInitialPrice().doubleValue();
            double rounded = Math.round(price / 5.0) * 5.0;
            
            for (int i = -6; i <= 6; i++) {
                double strike = rounded + (i * 5.0);
                Strike strikeObj = Strike.of(strike);
                
                // CALL 30D
                createContract(instrument.getId(), strikeObj, exp1, com.deriva.domain.market.OptionType.CALL);
                // PUT 30D
                createContract(instrument.getId(), strikeObj, exp1, com.deriva.domain.market.OptionType.PUT);
                
                // CALL 60D
                createContract(instrument.getId(), strikeObj, exp2, com.deriva.domain.market.OptionType.CALL);
                // PUT 60D
                createContract(instrument.getId(), strikeObj, exp2, com.deriva.domain.market.OptionType.PUT);
            }
        }
    }
    
    private void createContract(Long instrumentId, Strike strike, java.time.LocalDate exp, com.deriva.domain.market.OptionType type) {
        com.deriva.domain.market.OptionContract contract = new com.deriva.domain.market.OptionContract();
        contract.setUnderlyingInstrumentId(instrumentId);
        contract.setOptionType(type);
        contract.setStrikePrice(java.math.BigDecimal.valueOf(strike.toDouble()));
        contract.setExpirationDate(exp);
        contract.setContractMultiplier(100);
        contract.setStatus(com.deriva.domain.market.OptionContractStatus.ACTIVE);
        contract.setCreatedAt(java.time.LocalDateTime.now());
        optionContractRepository.save(contract);
    }
}
