package com.quind.tractorstore.order.api;

import com.quind.tractorstore.cart.CartSessionResolver;
import com.quind.tractorstore.order.internal.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CartSessionResolver sessionResolver;

    public OrderController(OrderService orderService, CartSessionResolver sessionResolver) {
        this.orderService = orderService;
        this.sessionResolver = sessionResolver;
    }

    @PostMapping
    public OrderDtos.PlaceOrderResponse placeOrder(
            @Valid @RequestBody OrderDtos.PlaceOrderRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        var sessionId = sessionResolver.resolveSessionId(request, response);
        return orderService.placeOrder(sessionId, body);
    }

    @GetMapping("/{id}")
    public OrderDtos.OrderResponse getOrder(@PathVariable UUID id) {
        return orderService.getOrder(id);
    }
}
