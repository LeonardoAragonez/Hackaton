package com.quind.tractorstore.cart.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quind.tractorstore.cart.CartSessionResolver;
import com.quind.tractorstore.cart.internal.CartService;
import com.quind.tractorstore.shared.api.GlobalExceptionHandler;
import com.quind.tractorstore.shared.config.ApplicationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CartController.class)
@Import({GlobalExceptionHandler.class, ApplicationConfig.class})
@TestPropertySource(
        properties = {
            "tractor.cart.cookie-name=CART_SESSION",
            "tractor.cart.cookie-max-age-days=30",
            "tractor.cart.cookie-path=/",
            "tractor.cors.allowed-origins=http://localhost:4200"
        })
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @MockBean
    private CartSessionResolver sessionResolver;

    @Test
    void getCartReturnsItems() throws Exception {
        when(sessionResolver.resolveSessionId(any(), any())).thenReturn("sess-1");
        when(cartService.getCart("sess-1"))
                .thenReturn(new CartDtos.CartResponse(
                        "sess-1",
                        List.of(new CartDtos.CartItemDto("AU-01-SI", "Tractor", "/t.webp", 1, 1000, 1000)),
                        1,
                        1000));

        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1))
                .andExpect(jsonPath("$.total").value(1000));
    }

    @Test
    void addItemRequiresSku() throws Exception {
        when(sessionResolver.resolveSessionId(any(), any())).thenReturn("sess-1");

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void addItemDelegatesToService() throws Exception {
        when(sessionResolver.resolveSessionId(any(), any())).thenReturn("sess-1");
        when(cartService.addItem(eq("sess-1"), eq("AU-01-SI")))
                .thenReturn(new CartDtos.CartResponse("sess-1", List.of(), 1, 1000));

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CartDtos.AddCartItemRequest("AU-01-SI"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1));
    }
}
