package com.quind.tractorstore.cart.internal;

import com.quind.tractorstore.cart.api.CartDtos;
import com.quind.tractorstore.cart.internal.persistence.CartItemEntity;
import com.quind.tractorstore.cart.internal.persistence.CartItemRepository;
import com.quind.tractorstore.cart.internal.persistence.CartSessionEntity;
import com.quind.tractorstore.cart.internal.persistence.CartSessionRepository;
import com.quind.tractorstore.catalog.CatalogFacade;
import com.quind.tractorstore.inventory.InventoryFacade;
import com.quind.tractorstore.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class CartService {

    private final CartSessionRepository sessionRepository;
    private final CartItemRepository itemRepository;
    private final CatalogFacade catalogFacade;
    private final InventoryFacade inventoryFacade;

    public CartService(
            CartSessionRepository sessionRepository,
            CartItemRepository itemRepository,
            CatalogFacade catalogFacade,
            InventoryFacade inventoryFacade) {
        this.sessionRepository = sessionRepository;
        this.itemRepository = itemRepository;
        this.catalogFacade = catalogFacade;
        this.inventoryFacade = inventoryFacade;
    }

    @Transactional(readOnly = true)
    public CartDtos.CartResponse getCart(String sessionId) {
        return mapCart(sessionId, itemRepository.findBySessionId(sessionId));
    }

    @Transactional(readOnly = true)
    public CartDtos.MiniCartResponse getMiniCart(String sessionId) {
        var items = itemRepository.findBySessionId(sessionId);
        return new CartDtos.MiniCartResponse(countItems(items), sumTotal(items));
    }

    @Transactional
    public CartDtos.CartResponse addItem(String sessionId, String sku) {
        touchSession(sessionId);
        int inCart = quantityInCart(sessionId, sku);
        int available = inventoryFacade.availableQuantity(sku);
        int remaining = available - inCart;

        if (remaining <= 0) {
            var code = inCart > 0 ? "INSUFFICIENT_STOCK" : "OUT_OF_STOCK";
            var message = inCart > 0
                    ? "No more units available for SKU: " + sku
                    : "SKU is out of stock: " + sku;
            throw new ApiException(
                    code,
                    message,
                    HttpStatus.CONFLICT,
                    java.util.Map.of(
                            "sku", sku,
                            "available", available,
                            "inCart", inCart,
                            "remaining", Math.max(remaining, 0)));
        }

        var variant = catalogFacade.requireVariant(sku);
        var existing = itemRepository.findBySessionIdAndSku(sessionId, sku);
        if (existing.isPresent()) {
            var item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
            itemRepository.save(item);
        } else {
            var item = new CartItemEntity();
            item.setSessionId(sessionId);
            item.setSku(sku);
            item.setQuantity(1);
            item.setUnitPrice(variant.price());
            item.setName(variant.name());
            item.setImage(variant.image());
            itemRepository.save(item);
        }
        return getCart(sessionId);
    }

    @Transactional
    public CartDtos.CartResponse removeItem(String sessionId, String sku) {
        touchSession(sessionId);
        itemRepository.findBySessionIdAndSku(sessionId, sku).ifPresent(item -> {
            if (item.getQuantity() > 1) {
                item.setQuantity(item.getQuantity() - 1);
            } else {
                itemRepository.delete(item);
            }
        });
        return getCart(sessionId);
    }

    @Transactional
    public void clear(String sessionId) {
        itemRepository.deleteBySessionId(sessionId);
        touchSession(sessionId);
    }

    private void touchSession(String sessionId) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setUpdatedAt(Instant.now());
            sessionRepository.save(session);
        });
    }

    private CartDtos.CartResponse mapCart(String sessionId, List<CartItemEntity> items) {
        var dtos = items.stream()
                .map(i -> new CartDtos.CartItemDto(
                        i.getSku(), i.getName(), i.getImage(), i.getQuantity(), i.getUnitPrice(), i.lineTotal()))
                .toList();
        return new CartDtos.CartResponse(sessionId, dtos, countItems(items), sumTotal(items));
    }

    private int countItems(List<CartItemEntity> items) {
        return items.stream().mapToInt(CartItemEntity::getQuantity).sum();
    }

    private int sumTotal(List<CartItemEntity> items) {
        return items.stream().mapToInt(CartItemEntity::lineTotal).sum();
    }

    private int quantityInCart(String sessionId, String sku) {
        return itemRepository.findBySessionIdAndSku(sessionId, sku).map(CartItemEntity::getQuantity).orElse(0);
    }
}
