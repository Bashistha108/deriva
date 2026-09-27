package com.deriva.application.learning;

import com.deriva.domain.learning.Strategy;
import com.deriva.persistence.learning.StrategyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StrategyService {

    private final StrategyRepository strategyRepository;

    public StrategyService(StrategyRepository strategyRepository) {
        this.strategyRepository = strategyRepository;
    }

    public List<Strategy> getAllStrategies() {
        return strategyRepository.findAll();
    }
}
