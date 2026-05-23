package com.quind.tractorstore.cart;

import java.util.List;

public record CartSnapshot(String sessionId, List<CartLineSnapshot> items, int itemCount, int total) {

    public record CartLineSnapshot(String sku, String name, String image, int quantity, int unitPrice, int lineTotal) {
    }
}
