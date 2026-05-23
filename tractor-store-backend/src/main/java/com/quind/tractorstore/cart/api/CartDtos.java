package com.quind.tractorstore.cart.api;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public final class CartDtos {

    private CartDtos() {
    }

    public record CartItemDto(String sku, String name, String image, int quantity, int unitPrice, int lineTotal) {
    }

    public record CartResponse(String sessionId, List<CartItemDto> items, int itemCount, int total) {
    }

    public record MiniCartResponse(int itemCount, int total) {
    }

    public record AddCartItemRequest(@NotBlank String sku) {
    }
}
