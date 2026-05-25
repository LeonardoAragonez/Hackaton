package com.quind.tractorstore.inventory.internal;

import com.quind.tractorstore.inventory.internal.persistence.InventoryItemEntity;
import com.quind.tractorstore.inventory.internal.persistence.InventoryItemRepository;
import com.quind.tractorstore.shared.api.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository repository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void getInventoryReturnsDto() {
        var entity = new InventoryItemEntity();
        entity.setSku("AU-01");
        entity.setQuantity(4);
        when(repository.findById("AU-01")).thenReturn(Optional.of(entity));

        var response = inventoryService.getInventory("AU-01");

        assertThat(response.sku()).isEqualTo("AU-01");
        assertThat(response.quantity()).isEqualTo(4);
        assertThat(response.available()).isTrue();
    }

    @Test
    void getInventoryThrowsWhenMissing() {
        when(repository.findById("X")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.getInventory("X"))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void reserveReturnsFalseWhenInsufficient() {
        var entity = new InventoryItemEntity();
        entity.setSku("AU-01");
        entity.setQuantity(1);
        when(repository.findBySkuForUpdate("AU-01")).thenReturn(Optional.of(entity));

        assertThat(inventoryService.reserve("AU-01", 5)).isFalse();
    }

    @Test
    void reserveDecrementsStock() {
        var entity = new InventoryItemEntity();
        entity.setSku("AU-01");
        entity.setQuantity(5);
        when(repository.findBySkuForUpdate("AU-01")).thenReturn(Optional.of(entity));

        assertThat(inventoryService.reserve("AU-01", 2)).isTrue();
        assertThat(entity.getQuantity()).isEqualTo(3);
    }
}
