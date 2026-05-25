package com.quind.tractorstore.cart;

import com.quind.tractorstore.cart.internal.persistence.CartSessionEntity;
import com.quind.tractorstore.cart.internal.persistence.CartSessionRepository;
import com.quind.tractorstore.shared.config.TractorProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Component
public class CartSessionResolver {

    private final TractorProperties properties;
    private final CartSessionRepository sessionRepository;

    public CartSessionResolver(TractorProperties properties, CartSessionRepository sessionRepository) {
        this.properties = properties;
        this.sessionRepository = sessionRepository;
    }

    public String resolveSessionId(HttpServletRequest request, HttpServletResponse response) {
        return readCookie(request)
                .filter(sessionRepository::existsById)
                .orElseGet(() -> createSession(response));
    }

    public Optional<String> readSessionId(HttpServletRequest request) {
        return readCookie(request).filter(sessionRepository::existsById);
    }

    private Optional<String> readCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        var cookieName = properties.cart().cookieName();
        return Arrays.stream(request.getCookies())
                .filter(c -> cookieName.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private String createSession(HttpServletResponse response) {
        var sessionId = UUID.randomUUID().toString();
        var now = Instant.now();
        var entity = new CartSessionEntity();
        entity.setSessionId(sessionId);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        sessionRepository.save(entity);
        writeCookie(response, sessionId);
        return sessionId;
    }

    public void writeCookie(HttpServletResponse response, String sessionId) {
        var cart = properties.cart();
        var cookie = ResponseCookie.from(cart.cookieName(), sessionId)
                .httpOnly(true)
                .path(cart.cookiePath())
                .maxAge(cart.cookieMaxAgeDays() * 24L * 60L * 60L)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
