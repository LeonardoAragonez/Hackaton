package com.quind.tractorstore.order.internal;

import com.quind.tractorstore.cart.CartFacade;
import com.quind.tractorstore.cart.CartSnapshot;
import com.quind.tractorstore.catalog.CatalogFacade;
import com.quind.tractorstore.inventory.InventoryFacade;
import com.quind.tractorstore.order.api.OrderDtos;
import com.quind.tractorstore.order.internal.persistence.OrderEntity;
import com.quind.tractorstore.order.internal.persistence.OrderLineEntity;
import com.quind.tractorstore.order.internal.persistence.OrderLineRepository;
import com.quind.tractorstore.order.internal.persistence.OrderRepository;
import com.quind.tractorstore.shared.api.ApiException;
import com.quind.tractorstore.shared.event.CheckoutRequested;
import com.quind.tractorstore.shared.event.OrderPlaced;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderLineRepository orderLineRepository;

    @Mock
    private CartFacade cartFacade;

    @Mock
    private InventoryFacade inventoryFacade;

    @Mock
    private CatalogFacade catalogFacade;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private OrderService orderService;

    @Test
    void placeOrderWithPickupFulfillment() {
        var cart = sampleCart();
        when(cartFacade.getCartOrThrow("sess-1")).thenReturn(cart);
        when(catalogFacade.requireStore("store-1"))
                .thenReturn(new CatalogFacade.StoreSnapshot("store-1", "Main", "1 Farm Rd", "Springfield", "/s.webp"));

        var request = new OrderDtos.PlaceOrderRequest(
                "PICKUP", "farmer@tractor.store", "John", "store-1", null, null, null);

        var response = orderService.placeOrder("sess-1", request);

        assertThat(response.fulfillmentType()).isEqualTo("PICKUP");
        assertThat(response.pickupStore()).isNotNull();
        assertThat(response.pickupStore().id()).isEqualTo("store-1");
        assertThat(response.shipping()).isNull();

        verify(inventoryFacade).reserve("AU-01", 1);
        verify(cartFacade).clearCart("sess-1");
        verify(eventPublisher).publishEvent(any(CheckoutRequested.class));
        verify(eventPublisher).publishEvent(any(OrderPlaced.class));

        var orderCaptor = ArgumentCaptor.forClass(OrderEntity.class);
        verify(orderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getPickupStoreId()).isEqualTo("store-1");
    }

    @Test
    void placeOrderWithDeliveryFulfillment() {
        when(cartFacade.getCartOrThrow("sess-1")).thenReturn(sampleCart());

        var request = new OrderDtos.PlaceOrderRequest(
                "delivery",
                "farmer@tractor.store",
                " John ",
                null,
                " Farm 1 ",
                " Springfield ",
                " 12345 ");

        var response = orderService.placeOrder("sess-1", request);

        assertThat(response.fulfillmentType()).isEqualTo("DELIVERY");
        assertThat(response.shipping()).isEqualTo(new OrderDtos.ShippingDto("Farm 1", "Springfield", "12345"));
        assertThat(response.pickupStore()).isNull();

        var orderCaptor = ArgumentCaptor.forClass(OrderEntity.class);
        verify(orderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getCustomerName()).isEqualTo("John");
        assertThat(orderCaptor.getValue().getShippingZip()).isEqualTo("12345");
    }

    @Test
    void placeOrderRejectsInvalidFulfillmentType() {
        var request = new OrderDtos.PlaceOrderRequest(
                "SHIP", "farmer@tractor.store", "John", null, "a", "c", "z");

        assertThatThrownBy(() -> orderService.placeOrder("sess-1", request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("PICKUP");
    }

    @Test
    void placeOrderRequiresStoreForPickup() {
        var request = new OrderDtos.PlaceOrderRequest(
                "PICKUP", "farmer@tractor.store", "John", "  ", null, null, null);

        assertThatThrownBy(() -> orderService.placeOrder("sess-1", request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("storeId");
    }

    @Test
    void placeOrderRequiresAddressForDelivery() {
        var request = new OrderDtos.PlaceOrderRequest(
                "DELIVERY", "farmer@tractor.store", "John", null, null, "Springfield", "12345");

        assertThatThrownBy(() -> orderService.placeOrder("sess-1", request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Address");
    }

    @Test
    void placeOrderRequiresCityForDelivery() {
        var request = new OrderDtos.PlaceOrderRequest(
                "DELIVERY", "farmer@tractor.store", "John", null, "Farm 1", " ", "12345");

        assertThatThrownBy(() -> orderService.placeOrder("sess-1", request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("City");
    }

    @Test
    void placeOrderRequiresZipForDelivery() {
        var request = new OrderDtos.PlaceOrderRequest(
                "DELIVERY", "farmer@tractor.store", "John", null, "Farm 1", "Springfield", null);

        assertThatThrownBy(() -> orderService.placeOrder("sess-1", request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Zip");
    }

    @Test
    void getOrderReturnsDetails() {
        var orderId = UUID.randomUUID();
        var order = new OrderEntity();
        order.setOrderId(orderId);
        order.setStatus("PLACED");
        order.setTotalAmount(2000);
        order.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        order.setFulfillmentType("DELIVERY");
        order.setShippingAddress("Farm 1");
        order.setShippingCity("Springfield");
        order.setShippingZip("12345");

        var line = new OrderLineEntity();
        line.setSku("AU-01");
        line.setName("Tractor");
        line.setImage("/t.webp");
        line.setQuantity(1);
        line.setUnitPrice(2000);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderLineRepository.findByOrderId(orderId)).thenReturn(List.of(line));

        var response = orderService.getOrder(orderId);

        assertThat(response.id()).isEqualTo(orderId);
        assertThat(response.shipping()).isEqualTo(new OrderDtos.ShippingDto("Farm 1", "Springfield", "12345"));
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().lineTotal()).isEqualTo(2000);
    }

    @Test
    void getOrderThrowsWhenMissing() {
        var orderId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder(orderId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining(orderId.toString());
    }

    @Test
    void getOrderResolvesPickupStoreWhenPresent() {
        var orderId = UUID.randomUUID();
        var order = new OrderEntity();
        order.setOrderId(orderId);
        order.setStatus("PLACED");
        order.setTotalAmount(1000);
        order.setCreatedAt(Instant.now());
        order.setFulfillmentType("PICKUP");
        order.setPickupStoreId("store-1");

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderLineRepository.findByOrderId(orderId)).thenReturn(List.of());
        when(catalogFacade.findStore("store-1"))
                .thenReturn(Optional.of(new CatalogFacade.StoreSnapshot("store-1", "Main", "Rd", "City", "/s.webp")));

        var response = orderService.getOrder(orderId);

        assertThat(response.pickupStore()).isNotNull();
        assertThat(response.pickupStore().name()).isEqualTo("Main");
        assertThat(response.shipping()).isNull();
    }

    private static CartSnapshot sampleCart() {
        var line = new CartSnapshot.CartLineSnapshot("AU-01", "Tractor", "/t.webp", 1, 2000, 2000);
        return new CartSnapshot("sess-1", List.of(line), 1, 2000);
    }
}
