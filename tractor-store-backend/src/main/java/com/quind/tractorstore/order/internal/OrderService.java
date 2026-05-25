package com.quind.tractorstore.order.internal;

import com.quind.tractorstore.cart.CartFacade;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class OrderService {

    private static final String PICKUP = "PICKUP";
    private static final String DELIVERY = "DELIVERY";

    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final CartFacade cartFacade;
    private final InventoryFacade inventoryFacade;
    private final CatalogFacade catalogFacade;
    private final ApplicationEventPublisher eventPublisher;

    public OrderService(
            OrderRepository orderRepository,
            OrderLineRepository orderLineRepository,
            CartFacade cartFacade,
            InventoryFacade inventoryFacade,
            CatalogFacade catalogFacade,
            ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.orderLineRepository = orderLineRepository;
        this.cartFacade = cartFacade;
        this.inventoryFacade = inventoryFacade;
        this.catalogFacade = catalogFacade;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderDtos.PlaceOrderResponse placeOrder(String sessionId, OrderDtos.PlaceOrderRequest request) {
        var fulfillment = validateFulfillment(request);
        var checkoutId = UUID.randomUUID();
        eventPublisher.publishEvent(new CheckoutRequested(sessionId, checkoutId));

        var cart = cartFacade.getCartOrThrow(sessionId);
        cart.items().forEach(item -> inventoryFacade.reserve(item.sku(), item.quantity()));

        var orderId = UUID.randomUUID();
        var order = new OrderEntity();
        order.setOrderId(orderId);
        order.setSessionId(sessionId);
        order.setStatus("PLACED");
        order.setTotalAmount(cart.total());
        order.setCreatedAt(Instant.now());
        order.setFulfillmentType(fulfillment.type());
        order.setCustomerEmail(request.email().trim());
        order.setCustomerName(request.name().trim());

        OrderDtos.StoreDto pickupStore = null;
        OrderDtos.ShippingDto shipping = null;

        if (PICKUP.equals(fulfillment.type())) {
            var store = catalogFacade.requireStore(fulfillment.storeId());
            order.setPickupStoreId(store.id());
            pickupStore = toStoreDto(store);
        } else {
            order.setShippingAddress(fulfillment.address());
            order.setShippingCity(fulfillment.city());
            order.setShippingZip(fulfillment.zip());
            shipping = new OrderDtos.ShippingDto(fulfillment.address(), fulfillment.city(), fulfillment.zip());
        }

        orderRepository.save(order);

        cart.items().forEach(item -> {
            var line = new OrderLineEntity();
            line.setOrderId(orderId);
            line.setSku(item.sku());
            line.setQuantity(item.quantity());
            line.setUnitPrice(item.unitPrice());
            line.setName(item.name());
            line.setImage(item.image());
            orderLineRepository.save(line);
        });

        cartFacade.clearCart(sessionId);
        eventPublisher.publishEvent(new OrderPlaced(orderId, sessionId, cart.total()));

        return new OrderDtos.PlaceOrderResponse(
                orderId, order.getStatus(), order.getTotalAmount(), fulfillment.type(), pickupStore, shipping);
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderResponse getOrder(UUID orderId) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(
                        "ORDER_NOT_FOUND", "Order not found: " + orderId, HttpStatus.NOT_FOUND));
        var lines = orderLineRepository.findByOrderId(orderId).stream()
                .map(line -> new OrderDtos.OrderLineDto(
                        line.getSku(),
                        line.getName(),
                        line.getImage(),
                        line.getQuantity(),
                        line.getUnitPrice(),
                        line.getQuantity() * line.getUnitPrice()))
                .toList();
        return new OrderDtos.OrderResponse(
                order.getOrderId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getFulfillmentType(),
                resolvePickupStore(order),
                resolveShipping(order),
                lines);
    }

    private FulfillmentDetails validateFulfillment(OrderDtos.PlaceOrderRequest request) {
        var type = request.fulfillmentType() != null ? request.fulfillmentType().trim().toUpperCase() : "";
        return switch (type) {
            case PICKUP -> {
                if (request.storeId() == null || request.storeId().isBlank()) {
                    throw validationError("storeId", "Store is required for pickup");
                }
                yield new FulfillmentDetails(PICKUP, request.storeId().trim(), null, null, null);
            }
            case DELIVERY -> {
                if (isBlank(request.address())) {
                    throw validationError("address", "Address is required for delivery");
                }
                if (isBlank(request.city())) {
                    throw validationError("city", "City is required for delivery");
                }
                if (isBlank(request.zip())) {
                    throw validationError("zip", "Zip code is required for delivery");
                }
                yield new FulfillmentDetails(
                        DELIVERY,
                        null,
                        request.address().trim(),
                        request.city().trim(),
                        request.zip().trim());
            }
            default -> throw new ApiException(
                    "INVALID_FULFILLMENT",
                    "fulfillmentType must be PICKUP or DELIVERY",
                    HttpStatus.BAD_REQUEST);
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static ApiException validationError(String field, String message) {
        return new ApiException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST, java.util.Map.of(field, message));
    }

    private OrderDtos.StoreDto resolvePickupStore(OrderEntity order) {
        if (!PICKUP.equals(order.getFulfillmentType()) || order.getPickupStoreId() == null) {
            return null;
        }
        return catalogFacade.findStore(order.getPickupStoreId()).map(OrderService::toStoreDto).orElse(null);
    }

    private static OrderDtos.StoreDto toStoreDto(CatalogFacade.StoreSnapshot store) {
        return new OrderDtos.StoreDto(store.id(), store.name(), store.street(), store.city(), store.image());
    }

    private static OrderDtos.ShippingDto resolveShipping(OrderEntity order) {
        if (!DELIVERY.equals(order.getFulfillmentType())) {
            return null;
        }
        return new OrderDtos.ShippingDto(
                order.getShippingAddress(), order.getShippingCity(), order.getShippingZip());
    }

    private record FulfillmentDetails(String type, String storeId, String address, String city, String zip) {
    }
}
