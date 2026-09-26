package com.deriva.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.deriva")
public class DerivaApplication {
    public static void main(String[] args) {
        SpringApplication.run(DerivaApplication.class, args);
    }
}
