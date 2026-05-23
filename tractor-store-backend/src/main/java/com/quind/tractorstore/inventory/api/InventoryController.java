package com.quind.tractorstore.inventory.api;

import com.quind.tractorstore.inventory.internal.InventoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{sku}")
    public InventoryDtos.InventoryResponse getInventory(@PathVariable String sku) {
        return inventoryService.getInventory(sku);
    }
}
