package com.quind.tractorstore.inventory.api;

public final class InventoryDtos {

    private InventoryDtos() {
    }

    public record InventoryResponse(String sku, int quantity, boolean available) {
    }
}
