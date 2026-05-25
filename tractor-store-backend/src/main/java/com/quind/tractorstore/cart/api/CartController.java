package com.quind.tractorstore.cart.api;

import com.quind.tractorstore.cart.internal.CartService;
import com.quind.tractorstore.cart.CartSessionResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final CartSessionResolver sessionResolver;

    public CartController(CartService cartService, CartSessionResolver sessionResolver) {
        this.cartService = cartService;
        this.sessionResolver = sessionResolver;
    }

    @GetMapping
    public CartDtos.CartResponse getCart(HttpServletRequest request, HttpServletResponse response) {
        var sessionId = sessionResolver.resolveSessionId(request, response);
        return cartService.getCart(sessionId);
    }

    @GetMapping("/mini")
    public CartDtos.MiniCartResponse miniCart(HttpServletRequest request, HttpServletResponse response) {
        var sessionId = sessionResolver.resolveSessionId(request, response);
        return cartService.getMiniCart(sessionId);
    }

    @PostMapping("/items")
    public CartDtos.CartResponse addItem(
            @Valid @RequestBody CartDtos.AddCartItemRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        var sessionId = sessionResolver.resolveSessionId(request, response);
        return cartService.addItem(sessionId, body.sku());
    }

    @DeleteMapping("/items/{sku}")
    public CartDtos.CartResponse removeItem(
            @PathVariable String sku, HttpServletRequest request, HttpServletResponse response) {
        var sessionId = sessionResolver.resolveSessionId(request, response);
        return cartService.removeItem(sessionId, sku);
    }
}
