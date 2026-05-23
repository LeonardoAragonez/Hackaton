package com.quind.tractorstore.cart.internal;

import com.quind.tractorstore.cart.internal.persistence.CartItemEntity;
import com.quind.tractorstore.cart.internal.persistence.CartItemRepository;
import com.quind.tractorstore.cart.internal.persistence.CartSessionRepository;
import com.quind.tractorstore.catalog.CatalogFacade;
import com.quind.tractorstore.inventory.InventoryFacade;
import com.quind.tractorstore.shared.api.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartSessionRepository sessionRepository;

    @Mock
    private CartItemRepository itemRepository;

    @Mock
    private CatalogFacade catalogFacade;

    @Mock
    private InventoryFacade inventoryFacade;

    @InjectMocks
    private CartService cartService;

    @Test
    void getMiniCartAggregatesQuantities() {
        var item = new CartItemEntity();
        item.setSku("AU-01-SI");
        item.setQuantity(2);
        item.setUnitPrice(1000);
        item.setName("Tractor");
        item.setImage("/t.webp");
        when(itemRepository.findBySessionId("s1")).thenReturn(List.of(item));

        var mini = cartService.getMiniCart("s1");

        assertThat(mini.itemCount()).isEqualTo(2);
        assertThat(mini.total()).isEqualTo(2000);
    }

    @Test
    void addItemFailsWhenOutOfStock() {
        when(inventoryFacade.availableQuantity("AU-01-SI")).thenReturn(0);

        assertThatThrownBy(() -> cartService.addItem("s1", "AU-01-SI"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("out of stock");
        verify(itemRepository, never()).save(any());
    }

    @Test
    void addItemCreatesLineWhenMissing() {
        when(inventoryFacade.availableQuantity("AU-01-SI")).thenReturn(5);
        when(catalogFacade.requireVariant("AU-01-SI"))
                .thenReturn(new CatalogFacade.VariantSnapshot("AU-01-SI", "P1", "Tractor", "/t.webp", 1000));
        when(itemRepository.findBySessionIdAndSku("s1", "AU-01-SI")).thenReturn(Optional.empty());
        when(itemRepository.findBySessionId("s1")).thenReturn(List.of());

        cartService.addItem("s1", "AU-01-SI");

        verify(itemRepository).save(any(CartItemEntity.class));
    }
}
