package com.deriva.api.admin;

import com.deriva.application.security.SecurityConfig;
import com.deriva.application.simulation.SimulationClockService;
import com.deriva.domain.market.InstrumentSimulationParameter;
import com.deriva.persistence.market.InstrumentSimulationParameterRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SimulationAdminController.class)
@ContextConfiguration(classes = {
        SecurityConfig.class,
        SimulationAdminController.class})
public class SimulationAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InstrumentSimulationParameterRepository repository;

    @MockBean
    private SimulationClockService simulationClockService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void getAll_shouldReturnAllSimulationParamters() throws Exception {
        InstrumentSimulationParameter param = new InstrumentSimulationParameter();
        InstrumentSimulationParameter param2 = new InstrumentSimulationParameter();

        param.setInstrumentId(1L);
        param.setBaseVolatility(BigDecimal.valueOf(1.0));

        param2.setInstrumentId(2L);
        param2.setBaseVolatility(BigDecimal.valueOf(0.40));

        when(repository.findAll())
                .thenReturn(List.of(param, param2));

        mockMvc.perform(get("/api/admin/simulation/parameters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].instrumentId").value(1))
                .andExpect(jsonPath("$[1].instrumentId").value(2))
                .andExpect(jsonPath("$[0].baseVolatility").value(1.0))
                .andExpect(jsonPath("$[1].baseVolatility").value(0.40));

        verify(repository).findAll();
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void getAll_shouldReturnEmptyList() throws Exception {
        when(repository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/simulation/parameters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(repository).findAll();
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void getAll_shouldReturnForbidden() throws Exception {

        mockMvc.perform(get("/api/admin/simulation/parameters"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(repository);

    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_shouldReturnOK() throws Exception {
        InstrumentSimulationParameter parameter = new InstrumentSimulationParameter();
        parameter.setBaseVolatility(BigDecimal.valueOf(1.0));
        parameter.setInstrumentId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(parameter));

        when(repository.save(parameter)).thenReturn(parameter);

        String volatilityJson = """
                {
                    "baseVolatility": 0.78
                }
                """;

        mockMvc.perform(put("/api/admin/simulation/parameters/1/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(volatilityJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instrumentId").value(1))
                .andExpect(jsonPath("$.baseVolatility").value(0.78));

        ArgumentCaptor<InstrumentSimulationParameter> captor =
                ArgumentCaptor.forClass(InstrumentSimulationParameter.class);

        verify(simulationClockService).updateSimulationParameter(captor.capture());

        InstrumentSimulationParameter capturedParam = captor.getValue();

        assertEquals(1L, capturedParam.getInstrumentId());
        assertEquals(
                BigDecimal.valueOf(0.78),
                capturedParam.getBaseVolatility());

        assertEquals(BigDecimal.valueOf(0.78), parameter.getBaseVolatility());

        verify(repository).save(parameter);
        verify(repository).findById(1L);

    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_shouldReturnInstrumentNotFound() throws Exception {
        String requestBody = """
                {
                     "baseVolatility" : 0.1
                }
                """;

        when(repository.findById(100L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound());

        verify(repository, never()).save(any());
        verify(simulationClockService, never()).updateSimulationParameter(any());
        verify(repository).findById(100L);
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void updateVolatility_shouldReturnForbidden_ForNonAdmin() throws Exception {
        String requestBody = """
                {
                     "baseVolatility" : 0.1
                }
                """;

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());

        verify(repository, never()).save(any());
        verify(simulationClockService, never()).updateSimulationParameter(any());
        verify(repository, never()).findById(any());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_withEmptyRequest_shouldKeepExistingValue() throws Exception {
        String requestBody = """
                {
                }
                """;
        InstrumentSimulationParameter param = new InstrumentSimulationParameter();
        param.setInstrumentId(100L);
        param.setBaseVolatility(BigDecimal.valueOf(1.0));

        when(repository.findById(100L)).thenReturn(Optional.of(param));
        when(repository.save(param)).thenReturn(param);

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(repository, never()).save(param);
        verify(simulationClockService, never()).updateSimulationParameter(param);
        verify(repository, times(1)).findById(100L);
        assertEquals(BigDecimal.valueOf(1.0), param.getBaseVolatility());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_withInvalidRequest_shouldReturnBadRequest() throws Exception {
        String requestBody = """
                {
                    "baseVolatility": "invalid"
                }
                """;

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(simulationClockService, never()).updateSimulationParameter(any(InstrumentSimulationParameter.class));
        verify(repository, never()).findById(100L);
        verify(repository, never()).save(any(InstrumentSimulationParameter.class));
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_withNullBaseVolatility_shouldReturnOK() throws Exception {
        InstrumentSimulationParameter param = new InstrumentSimulationParameter();
        param.setInstrumentId(100L);
        param.setBaseVolatility(BigDecimal.valueOf(1.0));

        when(repository.findById(100L)).thenReturn(Optional.of(param));
        when(repository.save(param)).thenReturn(param);

        String requestBody = """
                {
                    "baseVolatility": null
                }
                """;

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        assertNotNull(param.getBaseVolatility());

        verify(repository, times(1)).findById(100L);
        verify(repository, never()).save(param);
        verify(simulationClockService, never())
                .updateSimulationParameter(param);
    }


    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_withUnknownField_shouldKeepExistingValue() throws Exception {
        InstrumentSimulationParameter param = new InstrumentSimulationParameter();
        param.setInstrumentId(100L);
        param.setBaseVolatility(BigDecimal.valueOf(1.0));

        when(repository.findById(100L)).thenReturn(Optional.of(param));
        when(repository.save(param)).thenReturn(param);

        String requestBody = """
                {
                    "unknownField": 123
                }
                """;

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        assertEquals(BigDecimal.valueOf(1.0), param.getBaseVolatility());

        verify(repository, times(1)).findById(100L);
        verify(repository, never()).save(any());
        verify(simulationClockService, never())
                .updateSimulationParameter(any());
    }


    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateVolatility_withNegativeBaseVolatility_shouldUpdateValue() throws Exception {
        InstrumentSimulationParameter param = new InstrumentSimulationParameter();
        param.setInstrumentId(100L);
        param.setBaseVolatility(BigDecimal.valueOf(1.0));

        when(repository.findById(100L)).thenReturn(Optional.of(param));
        when(repository.save(param)).thenReturn(param);

        String requestBody = """
                {
                    "baseVolatility": -0.5
                }
                """;

        mockMvc.perform(put("/api/admin/simulation/parameters/100/volatility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        assertEquals(BigDecimal.valueOf(1.0), param.getBaseVolatility());

        verify(repository, times(1)).findById(100L);
        verify(repository, never()).save(param);
        verify(simulationClockService, never())
                .updateSimulationParameter(param);
    }

}
