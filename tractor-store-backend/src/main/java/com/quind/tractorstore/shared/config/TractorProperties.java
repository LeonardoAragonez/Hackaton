package com.quind.tractorstore.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "tractor")
public record TractorProperties(Cart cart, Cors cors) {

    public record Cart(String cookieName, int cookieMaxAgeDays, String cookiePath) {
    }

    public record Cors(List<String> allowedOrigins) {
    }
}
