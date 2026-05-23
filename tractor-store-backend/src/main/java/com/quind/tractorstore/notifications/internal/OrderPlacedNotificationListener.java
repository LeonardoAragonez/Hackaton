package com.quind.tractorstore.notifications.internal;

import com.quind.tractorstore.notifications.internal.persistence.NotificationLogEntity;
import com.quind.tractorstore.notifications.internal.persistence.NotificationLogRepository;
import com.quind.tractorstore.shared.event.OrderPlaced;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;

@Component
public class OrderPlacedNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(OrderPlacedNotificationListener.class);

    private final NotificationLogRepository repository;

    public OrderPlacedNotificationListener(NotificationLogRepository repository) {
        this.repository = repository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onOrderPlaced(OrderPlaced event) {
        var message = "Order %s placed for session %s. Total: %d"
                .formatted(event.orderId(), event.cartSessionId(), event.totalAmount());
        log.info("Sending order confirmation: {}", message);

        var entity = new NotificationLogEntity();
        entity.setOrderId(event.orderId());
        entity.setChannel("EMAIL");
        entity.setMessage(message);
        entity.setCreatedAt(Instant.now());
        repository.save(entity);
    }
}
