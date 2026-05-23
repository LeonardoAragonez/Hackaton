package com.quind.tractorstore.shared.event;

import java.util.UUID;

public record OrderPlaced(UUID orderId, String cartSessionId, int totalAmount) {
}
