package com.quind.tractorstore.notifications.internal;

import com.quind.tractorstore.notifications.internal.persistence.NotificationLogEntity;
import com.quind.tractorstore.notifications.internal.persistence.NotificationLogRepository;
import com.quind.tractorstore.shared.event.OrderPlaced;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderPlacedNotificationListenerTest {

    @Mock
    private NotificationLogRepository repository;

    @InjectMocks
    private OrderPlacedNotificationListener listener;

    @Test
    void onOrderPlacedPersistsNotificationLog() {
        var orderId = UUID.randomUUID();
        listener.onOrderPlaced(new OrderPlaced(orderId, "session-1", 1500));

        var captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getOrderId()).isEqualTo(orderId);
        assertThat(captor.getValue().getChannel()).isEqualTo("EMAIL");
        assertThat(captor.getValue().getMessage()).contains(orderId.toString());
    }
}
