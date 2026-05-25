package com.quind.tractorstore.order.internal;

import com.quind.tractorstore.shared.event.CheckoutRequested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;

class CheckoutEventListenerTest {

    @Test
    void onCheckoutRequestedLogsWithoutError() {
        var listener = new CheckoutEventListener();
        var event = new CheckoutRequested("session-1", UUID.randomUUID());

        assertThatCode(() -> listener.onCheckoutRequested(event)).doesNotThrowAnyException();
    }
}
