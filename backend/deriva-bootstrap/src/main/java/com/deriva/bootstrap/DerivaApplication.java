package com.deriva.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.deriva")
@EntityScan(basePackages = "com.deriva.domain")
@EnableJpaRepositories(basePackages = "com.deriva.persistence")
public class DerivaApplication {
    public static void main(String[] args) {
        SpringApplication.run(DerivaApplication.class, args);
    }
}
