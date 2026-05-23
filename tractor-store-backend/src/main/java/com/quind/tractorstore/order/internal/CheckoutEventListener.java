package com.quind.tractorstore.order.internal;

import com.quind.tractorstore.shared.event.CheckoutRequested;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class CheckoutEventListener {

    private static final Logger log = LoggerFactory.getLogger(CheckoutEventListener.class);

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCheckoutRequested(CheckoutRequested event) {
        log.info(
                "Checkout committed for session {} (checkoutId={})",
                event.cartSessionId(),
                event.checkoutId());
    }
}
