package com.quind.tractorstore.inventory.internal;

import com.quind.tractorstore.inventory.api.InventoryDtos;
import com.quind.tractorstore.inventory.internal.persistence.InventoryItemEntity;
import com.quind.tractorstore.inventory.internal.persistence.InventoryItemRepository;
import com.quind.tractorstore.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryItemRepository repository;

    public InventoryService(InventoryItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public InventoryDtos.InventoryResponse getInventory(String sku) {
        var item = repository.findById(sku)
                .orElseThrow(() -> new ApiException(
                        "INVENTORY_NOT_FOUND",
                        "Inventory not found for SKU: " + sku,
                        HttpStatus.NOT_FOUND));
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public int getQuantity(String sku) {
        return repository.findById(sku).map(InventoryItemEntity::getQuantity).orElse(0);
    }

    @Transactional
    public boolean reserve(String sku, int quantity) {
        return repository.findBySkuForUpdate(sku)
                .map(item -> {
                    if (item.getQuantity() < quantity) {
                        return false;
                    }
                    item.setQuantity(item.getQuantity() - quantity);
                    return true;
                })
                .orElse(false);
    }

    private InventoryDtos.InventoryResponse toResponse(InventoryItemEntity item) {
        return new InventoryDtos.InventoryResponse(
                item.getSku(), item.getQuantity(), item.getQuantity() > 0);
    }
}
