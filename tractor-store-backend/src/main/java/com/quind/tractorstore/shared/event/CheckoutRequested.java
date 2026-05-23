package com.quind.tractorstore.shared.event;

import java.util.UUID;

public record CheckoutRequested(String cartSessionId, UUID checkoutId) {
}
