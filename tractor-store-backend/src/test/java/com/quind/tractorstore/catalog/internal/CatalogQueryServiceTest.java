package com.quind.tractorstore.catalog.internal;

import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryProductRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogProductEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogProductRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogRecommendationEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogRecommendationRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogStoreEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogStoreRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogTeaserRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogVariantEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogVariantRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CatalogQueryServiceTest {

    @Mock
    private CatalogTeaserRepository teaserRepository;

    @Mock
    private CatalogCategoryRepository categoryRepository;

    @Mock
    private CatalogCategoryProductRepository categoryProductRepository;

    @Mock
    private CatalogProductRepository productRepository;

    @Mock
    private CatalogVariantRepository variantRepository;

    @Mock
    private CatalogRecommendationRepository recommendationRepository;

    @Mock
    private CatalogStoreRepository storeRepository;

    @InjectMocks
    private CatalogQueryService catalogQueryService;

    @Test
    void getHomeAggregatesTeasersAndCategories() {
        when(teaserRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of());
        var category = new CatalogCategoryEntity();
        category.setCategoryKey("classic");
        category.setName("Classic");
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(categoryProductRepository.findByCategoryKeyOrderBySortOrderAsc("classic")).thenReturn(List.of());

        var home = catalogQueryService.getHome();

        assertThat(home.categories()).hasSize(1);
        assertThat(home.categories().getFirst().key()).isEqualTo("classic");
    }

    @Test
    void getCategoryThrowsWhenMissing() {
        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalogQueryService.getCategory("missing"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void getProductThrowsWhenMissing() {
        when(productRepository.findById("P1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalogQueryService.getProduct("P1"))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void getRecommendationsReturnsEmptyForBlankInput() {
        assertThat(catalogQueryService.getRecommendations(null)).isEmpty();
        assertThat(catalogQueryService.getRecommendations("   ")).isEmpty();
    }

    @Test
    void getRecommendationsFiltersSkus() {
        var entity = new CatalogRecommendationEntity();
        entity.setSku("AU-01");
        entity.setName("Tractor");
        entity.setImage("/t.webp");
        entity.setUrl("/product/AU-01");
        entity.setRgb(List.of(0, 128, 0));
        when(recommendationRepository.findBySkuIn(List.of("AU-01"))).thenReturn(List.of(entity));

        var result = catalogQueryService.getRecommendations(" AU-01 , ");

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().sku()).isEqualTo("AU-01");
    }

    @Test
    void findVariantBySkuMapsEntity() {
        var variant = new CatalogVariantEntity();
        variant.setSku("AU-01");
        variant.setProductId("P1");
        variant.setName("Tractor");
        variant.setImage("/t.webp");
        variant.setPrice(1000);
        when(variantRepository.findBySku("AU-01")).thenReturn(Optional.of(variant));

        var view = catalogQueryService.findVariantBySku("AU-01");

        assertThat(view).isPresent();
        assertThat(view.get().price()).isEqualTo(1000);
    }

    @Test
    void getStoresMapsEntities() {
        var store = new CatalogStoreEntity();
        store.setStoreId("s1");
        store.setName("Main");
        store.setStreet("Rd");
        store.setCity("City");
        store.setImage("/s.webp");
        when(storeRepository.findAll()).thenReturn(List.of(store));

        assertThat(catalogQueryService.getStores()).hasSize(1);
    }
}
