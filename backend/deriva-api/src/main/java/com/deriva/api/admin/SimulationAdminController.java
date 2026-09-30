package com.deriva.api.admin;

import com.deriva.application.simulation.SimulationClockService;
import com.deriva.domain.market.InstrumentSimulationParameter;
import com.deriva.persistence.market.InstrumentSimulationParameterRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/simulation/parameters")
public class SimulationAdminController {

    private final InstrumentSimulationParameterRepository repository;
    private final SimulationClockService simulationClockService;

    public SimulationAdminController(InstrumentSimulationParameterRepository repository, SimulationClockService simulationClockService) {
        this.repository = repository;
        this.simulationClockService = simulationClockService;
    }

    public static class ParamDTO {
        public Long instrumentId;
        public String symbol;
        public BigDecimal baseVolatility;
        
        public ParamDTO(InstrumentSimulationParameter param) {
            this.instrumentId = param.getInstrumentId();
            if (param.getInstrument() != null) {
                this.symbol = param.getInstrument().getSymbol();
            }
            this.baseVolatility = param.getBaseVolatility();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ParamDTO>> getAll() {
        return ResponseEntity.ok(
            repository.findAll().stream()
                .map(ParamDTO::new)
                .collect(Collectors.toList())
        );
    }

    @PutMapping("/{instrumentId}/volatility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParamDTO> updateVolatility(
            @PathVariable Long instrumentId,
            @RequestBody Map<String, BigDecimal> request) {
        
        InstrumentSimulationParameter param = repository.findById(instrumentId).orElse(null);
        if (param == null) return ResponseEntity.notFound().build();
        
        if (request.containsKey("baseVolatility")) {
            param.setBaseVolatility(request.get("baseVolatility"));
        }
        
        param = repository.save(param);
        
        // Notify simulation service immediately
        simulationClockService.updateSimulationParameter(param);
        
        return ResponseEntity.ok(new ParamDTO(param));
    }
}
