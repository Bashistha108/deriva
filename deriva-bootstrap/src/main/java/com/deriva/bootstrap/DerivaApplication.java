package com.deriva.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication(scanBasePackages = "com.deriva")
@EnableJpaRepositories(basePackages = "com.deriva")
@EntityScan(basePackages = "com.deriva")
@EnableScheduling
@EnableAspectJAutoProxy
public class DerivaApplication {
    public static void main(String[] args) {
        SpringApplication.run(DerivaApplication.class, args);
    }
}
