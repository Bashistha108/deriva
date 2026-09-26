package com.deriva.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.deriva")
@EntityScan(basePackages = "com.deriva.domain")
@EnableJpaRepositories(basePackages = "com.deriva.persistence")
@EnableScheduling
public class DerivaApplication {
    public static void main(String[] args) {
        SpringApplication.run(DerivaApplication.class, args);
    }
}
