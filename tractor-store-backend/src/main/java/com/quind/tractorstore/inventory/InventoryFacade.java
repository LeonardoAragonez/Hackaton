package com.quind.tractorstore.inventory;

import com.quind.tractorstore.inventory.internal.InventoryService;
import com.quind.tractorstore.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class InventoryFacade {

    private final InventoryService inventoryService;

    public InventoryFacade(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    public void reserve(String sku, int quantity) {
        if (!inventoryService.reserve(sku, quantity)) {
            throw new ApiException(
                    "INSUFFICIENT_STOCK",
                    "Not enough inventory for SKU: " + sku,
                    HttpStatus.CONFLICT);
        }
    }

    public int availableQuantity(String sku) {
        return inventoryService.getQuantity(sku);
    }
}
