package com.quind.tractorstore.catalog;

import com.quind.tractorstore.catalog.internal.CatalogQueryService;
import com.quind.tractorstore.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CatalogFacade {

    private final CatalogQueryService queryService;

    public CatalogFacade(CatalogQueryService queryService) {
        this.queryService = queryService;
    }

    public Optional<VariantSnapshot> findVariant(String sku) {
        return queryService.findVariantBySku(sku)
                .map(v -> new VariantSnapshot(v.sku(), v.productId(), v.name(), v.image(), v.price()));
    }

    public VariantSnapshot requireVariant(String sku) {
        return findVariant(sku)
                .orElseThrow(() -> new ApiException(
                        "VARIANT_NOT_FOUND",
                        "Product variant not found: " + sku,
                        HttpStatus.NOT_FOUND));
    }

    public Optional<StoreSnapshot> findStore(String storeId) {
        return queryService.findStoreById(storeId)
                .map(s -> new StoreSnapshot(s.id(), s.name(), s.street(), s.city(), s.image()));
    }

    public StoreSnapshot requireStore(String storeId) {
        return findStore(storeId)
                .orElseThrow(() -> new ApiException(
                        "STORE_NOT_FOUND", "Store not found: " + storeId, HttpStatus.NOT_FOUND));
    }

    public record VariantSnapshot(String sku, String productId, String name, String image, int price) {
    }

    public record StoreSnapshot(String id, String name, String street, String city, String image) {
    }
}
