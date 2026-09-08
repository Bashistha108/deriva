package com.deriva.infrastructure.messaging;

import com.deriva.application.port.out.DomainEventPublisher;
import com.deriva.domain.event.MarketQuoteUpdated;
import com.deriva.infrastructure.messaging.idempotency.IdempotentEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest
@Testcontainers
@org.junit.jupiter.api.Disabled("Docker not available")
public class KafkaIntegrationTest {

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.4.0"));

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:15-alpine"));

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    private DomainEventPublisher eventPublisher;

    @Autowired
    private IdempotentEventRepository idempotentEventRepository;

    @BeforeEach
    void setUp() {
        idempotentEventRepository.deleteAll();
    }

    @Test
    void shouldProcessEventAndEnsureIdempotency() {
        UUID eventId = UUID.randomUUID();
        MarketQuoteUpdated event = new MarketQuoteUpdated(eventId, Instant.now(), "AAPL", new BigDecimal("150.00"), new BigDecimal("150.10"), new BigDecimal("150.05"));

        // Publish same event twice
        eventPublisher.publish("market-quote-updates", event);
        eventPublisher.publish("market-quote-updates", event);

        // Await until event is stored in idempotency repo
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> 
            assertThat(idempotentEventRepository.findById(eventId)).isPresent()
        );

        // Ensure it's only stored once, despite being published twice
        assertThat(idempotentEventRepository.count()).isEqualTo(1);
    }
}
