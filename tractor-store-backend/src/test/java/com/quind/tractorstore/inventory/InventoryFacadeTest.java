package com.quind.tractorstore.inventory;

import com.quind.tractorstore.inventory.internal.InventoryService;
import com.quind.tractorstore.shared.api.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryFacadeTest {

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private InventoryFacade inventoryFacade;

    @Test
    void availableQuantityDelegatesToService() {
        when(inventoryService.getQuantity("AU-01")).thenReturn(7);

        assertThat(inventoryFacade.availableQuantity("AU-01")).isEqualTo(7);
    }

    @Test
    void reserveSucceedsWhenStockAvailable() {
        when(inventoryService.reserve("AU-01", 2)).thenReturn(true);

        inventoryFacade.reserve("AU-01", 2);

        verify(inventoryService).reserve("AU-01", 2);
    }

    @Test
    void reserveThrowsWhenInsufficientStock() {
        when(inventoryService.reserve("AU-01", 99)).thenReturn(false);

        assertThatThrownBy(() -> inventoryFacade.reserve("AU-01", 99))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("AU-01");
    }
}
