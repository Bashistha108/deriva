package com.deriva.infrastructure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.deriva.infrastructure")
@EntityScan(basePackages = "com.deriva.infrastructure.messaging.idempotency")
@EnableJpaRepositories(basePackages = "com.deriva.infrastructure.messaging.idempotency")
public class TestApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
