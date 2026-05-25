package com.quind.tractorstore.order.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class OrderDtos {

    private OrderDtos() {
    }

    public record PlaceOrderRequest(
            @NotBlank String fulfillmentType,
            @NotBlank @Email String email,
            @NotBlank String name,
            String storeId,
            String address,
            String city,
            String zip) {
    }

    public record StoreDto(String id, String name, String street, String city, String image) {
    }

    public record ShippingDto(String address, String city, String zip) {
    }

    public record OrderLineDto(String sku, String name, String image, int quantity, int unitPrice, int lineTotal) {
    }

    public record OrderResponse(
            UUID id,
            String status,
            int total,
            Instant createdAt,
            String fulfillmentType,
            StoreDto pickupStore,
            ShippingDto shipping,
            List<OrderLineDto> items) {
    }

    public record PlaceOrderResponse(
            UUID orderId,
            String status,
            int total,
            String fulfillmentType,
            StoreDto pickupStore,
            ShippingDto shipping) {
    }
}
