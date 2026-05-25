package com.quind.tractorstore.catalog;

import com.quind.tractorstore.catalog.internal.CatalogQueryService;
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
class CatalogFacadeTest {

    @Mock
    private CatalogQueryService queryService;

    @InjectMocks
    private CatalogFacade catalogFacade;

    @Test
    void findVariantMapsSnapshot() {
        when(queryService.findVariantBySku("AU-01"))
                .thenReturn(Optional.of(new CatalogQueryService.VariantView("AU-01", "P1", "Tractor", "/t.webp", 1000)));

        var variant = catalogFacade.findVariant("AU-01");

        assertThat(variant).isPresent();
        assertThat(variant.get().sku()).isEqualTo("AU-01");
        assertThat(variant.get().price()).isEqualTo(1000);
    }

    @Test
    void requireVariantThrowsWhenMissing() {
        when(queryService.findVariantBySku("X")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalogFacade.requireVariant("X"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("X");
    }

    @Test
    void findStoreMapsSnapshot() {
        when(queryService.findStoreById("store-1"))
                .thenReturn(Optional.of(new CatalogQueryService.StoreView("store-1", "Main", "1 Farm Rd", "Springfield", "/s.webp")));

        var store = catalogFacade.findStore("store-1");

        assertThat(store).isPresent();
        assertThat(store.get().name()).isEqualTo("Main");
    }

    @Test
    void requireStoreThrowsWhenMissing() {
        when(queryService.findStoreById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalogFacade.requireStore("missing"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("missing");
    }
}
