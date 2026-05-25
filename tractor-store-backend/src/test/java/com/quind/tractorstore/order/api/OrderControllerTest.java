package com.quind.tractorstore.order.api;

import com.quind.tractorstore.cart.CartSessionResolver;
import com.quind.tractorstore.order.internal.OrderService;
import com.quind.tractorstore.shared.api.GlobalExceptionHandler;
import com.quind.tractorstore.shared.config.ApplicationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class)
@Import({GlobalExceptionHandler.class, ApplicationConfig.class})
@TestPropertySource(
        properties = {
            "tractor.cart.cookie-name=CART_SESSION",
            "tractor.cart.cookie-max-age-days=30",
            "tractor.cart.cookie-path=/",
            "tractor.cors.allowed-origins=http://localhost:4200"
        })
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private CartSessionResolver sessionResolver;

    @Test
    void placeOrderReturnsOrderId() throws Exception {
        var orderId = UUID.randomUUID();
        when(sessionResolver.resolveSessionId(any(), any())).thenReturn("sess-1");
        when(orderService.placeOrder(eq("sess-1"), any(OrderDtos.PlaceOrderRequest.class)))
                .thenReturn(new OrderDtos.PlaceOrderResponse(
                        orderId, "PLACED", 2500, "DELIVERY", null, new OrderDtos.ShippingDto("Farm 1", "Springfield", "12345")));

        mockMvc.perform(post("/api/orders")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "fulfillmentType": "DELIVERY",
                                  "email": "farmer@tractor.store",
                                  "name": "John",
                                  "address": "Farm 1",
                                  "city": "Springfield",
                                  "zip": "12345"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.status").value("PLACED"));
    }

    @Test
    void getOrderById() throws Exception {
        var orderId = UUID.randomUUID();
        when(orderService.getOrder(orderId))
                .thenReturn(new OrderDtos.OrderResponse(
                        orderId,
                        "PLACED",
                        2500,
                        null,
                        "DELIVERY",
                        null,
                        new OrderDtos.ShippingDto("Farm 1", "Springfield", "12345"),
                        java.util.List.of()));

        mockMvc.perform(get("/api/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.toString()));
    }
}
