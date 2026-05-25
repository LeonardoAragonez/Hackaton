package com.quind.tractorstore.cart;

import com.quind.tractorstore.cart.internal.persistence.CartSessionRepository;
import com.quind.tractorstore.shared.config.TractorProperties;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartSessionResolverTest {

    @Mock
    private TractorProperties properties;

    @Mock
    private CartSessionRepository sessionRepository;

    @InjectMocks
    private CartSessionResolver resolver;

    @Test
    void resolveSessionIdReusesValidCookie() {
        when(properties.cart())
                .thenReturn(new TractorProperties.Cart("CART_SESSION", 30, "/"));
        when(sessionRepository.existsById("existing")).thenReturn(true);

        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("CART_SESSION", "existing"));
        var response = new MockHttpServletResponse();

        assertThat(resolver.resolveSessionId(request, response)).isEqualTo("existing");
    }

    @Test
    void resolveSessionIdCreatesSessionWhenCookieMissing() {
        when(properties.cart())
                .thenReturn(new TractorProperties.Cart("CART_SESSION", 30, "/"));

        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();

        var sessionId = resolver.resolveSessionId(request, response);

        assertThat(sessionId).isNotBlank();
        verify(sessionRepository).save(any());
        assertThat(response.getHeader("Set-Cookie")).contains("CART_SESSION=");
    }

    @Test
    void resolveSessionIdCreatesSessionWhenCookieNotInDatabase() {
        when(properties.cart())
                .thenReturn(new TractorProperties.Cart("CART_SESSION", 30, "/"));
        when(sessionRepository.existsById("stale")).thenReturn(false);

        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("CART_SESSION", "stale"));
        var response = new MockHttpServletResponse();

        assertThat(resolver.resolveSessionId(request, response)).isNotBlank();
        verify(sessionRepository).save(any());
    }
}
