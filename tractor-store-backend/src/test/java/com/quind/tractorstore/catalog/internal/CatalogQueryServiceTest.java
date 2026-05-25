package com.quind.tractorstore.catalog.internal;

import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryProductEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryProductRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogProductEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogProductRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogRecommendationEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogRecommendationRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogStoreEntity;
import com.quind.tractorstore.catalog.internal.persistence.CatalogStoreRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogTeaserEntity;
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

    @Test
    void getHomeIncluyeTeasersYProductosDeCategoria() {
        var teaser = new CatalogTeaserEntity();
        teaser.setTitle("T1");
        teaser.setImage("/t.webp");
        teaser.setUrl("/url");
        teaser.setSortOrder(1);
        when(teaserRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(teaser));

        var category = new CatalogCategoryEntity();
        category.setCategoryKey("classic");
        category.setName("Classic");
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        var prod = new CatalogCategoryProductEntity();
        prod.setCategoryKey("classic");
        prod.setProductId("CL-01");
        prod.setName("Tractor Classic");
        prod.setImage("/p.webp");
        prod.setStartPrice(1000);
        prod.setUrl("/product/CL-01");
        when(categoryProductRepository.findByCategoryKeyOrderBySortOrderAsc("classic"))
                .thenReturn(List.of(prod));

        var home = catalogQueryService.getHome();

        assertThat(home.teaser()).hasSize(1);
        assertThat(home.teaser().getFirst().title()).isEqualTo("T1");
        assertThat(home.categories()).hasSize(1);
        assertThat(home.categories().getFirst().products()).hasSize(1);
        assertThat(home.categories().getFirst().products().getFirst().id()).isEqualTo("CL-01");
    }

    @Test
    void getCategoryDevuelveCategoriaConProductos() {
        var category = new CatalogCategoryEntity();
        category.setCategoryKey("classic");
        category.setName("Classic");
        when(categoryRepository.findById("classic")).thenReturn(Optional.of(category));
        var p = new CatalogCategoryProductEntity();
        p.setProductId("CL-01");
        p.setName("X");
        p.setImage("/x.webp");
        p.setStartPrice(50);
        p.setUrl("/product/CL-01");
        when(categoryProductRepository.findByCategoryKeyOrderBySortOrderAsc("classic"))
                .thenReturn(List.of(p));

        var dto = catalogQueryService.getCategory("classic");

        assertThat(dto.key()).isEqualTo("classic");
        assertThat(dto.name()).isEqualTo("Classic");
        assertThat(dto.products()).hasSize(1);
    }

    @Test
    void getProductDevuelveProductoConVariantes() {
        var product = new CatalogProductEntity();
        product.setProductId("CL-01");
        product.setName("Tractor");
        product.setCategory("classic");
        product.setHighlights(List.of("h1", "h2"));
        when(productRepository.findById("CL-01")).thenReturn(Optional.of(product));

        var variant = new CatalogVariantEntity();
        variant.setSku("CL-01-GR");
        variant.setProductId("CL-01");
        variant.setName("Verde");
        variant.setImage("/g.webp");
        variant.setColor("green");
        variant.setPrice(1000);
        when(variantRepository.findByProductId("CL-01")).thenReturn(List.of(variant));

        var response = catalogQueryService.getProduct("CL-01");

        assertThat(response.id()).isEqualTo("CL-01");
        assertThat(response.name()).isEqualTo("Tractor");
        assertThat(response.category()).isEqualTo("classic");
        assertThat(response.highlights()).containsExactly("h1", "h2");
        assertThat(response.variants()).hasSize(1);
        assertThat(response.variants().getFirst().sku()).isEqualTo("CL-01-GR");
        assertThat(response.variants().getFirst().color()).isEqualTo("green");
        assertThat(response.variants().getFirst().price()).isEqualTo(1000);
    }

    @Test
    void findVariantBySkuRetornaEmptyCuandoNoExiste() {
        when(variantRepository.findBySku("noexiste")).thenReturn(Optional.empty());
        assertThat(catalogQueryService.findVariantBySku("noexiste")).isEmpty();
    }

    @Test
    void findStoreByIdMapeaEntidad() {
        var store = new CatalogStoreEntity();
        store.setStoreId("s1");
        store.setName("Main");
        store.setStreet("Rd");
        store.setCity("City");
        store.setImage("/s.webp");
        when(storeRepository.findById("s1")).thenReturn(Optional.of(store));

        var view = catalogQueryService.findStoreById("s1");

        assertThat(view).isPresent();
        assertThat(view.get().id()).isEqualTo("s1");
        assertThat(view.get().name()).isEqualTo("Main");
        assertThat(view.get().city()).isEqualTo("City");
    }

    @Test
    void findStoreByIdRetornaEmptyCuandoNoExiste() {
        when(storeRepository.findById("none")).thenReturn(Optional.empty());
        assertThat(catalogQueryService.findStoreById("none")).isEmpty();
    }

    @Test
    void getRandomRecommendationsExcluyeProductIdYRespetaLimite() {
        var r1 = new CatalogRecommendationEntity();
        r1.setSku("AU-01");
        r1.setName("Tractor AU");
        r1.setImage("/au.webp");
        r1.setUrl("/product/AU-01");
        r1.setRgb(List.of(1, 2, 3));

        var r2 = new CatalogRecommendationEntity();
        r2.setSku("CL-02");
        r2.setName("Tractor CL");
        r2.setImage("/cl.webp");
        r2.setUrl("/product/CL-02");
        r2.setRgb(List.of(0, 0, 0));

        var r3Dup = new CatalogRecommendationEntity();
        r3Dup.setSku("CL-02-RED");
        r3Dup.setName("Otra variante");
        r3Dup.setImage("/cl2.webp");
        r3Dup.setUrl("/product/CL-02");
        r3Dup.setRgb(List.of(0, 0, 0));

        var rNoUrl = new CatalogRecommendationEntity();
        rNoUrl.setSku("BAD");
        rNoUrl.setName("Sin url");
        rNoUrl.setImage("/b.webp");
        rNoUrl.setUrl("/no-product-here");
        rNoUrl.setRgb(List.of(0, 0, 0));

        when(recommendationRepository.findAll()).thenReturn(List.of(r1, r2, r3Dup, rNoUrl));

        var result = catalogQueryService.getRandomRecommendations("AU-01", 5);

        // Sólo CL-02 (en cualquiera de sus 2 variantes) debe quedar:
        // AU-01 excluido, BAD descartado por URL inválida y la segunda CL-02 duplicada por productId.
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().sku()).startsWith("CL-02");
    }

    @Test
    void getRandomRecommendationsCortaAlLimite() {
        var r1 = new CatalogRecommendationEntity();
        r1.setSku("X-1");
        r1.setName("X1");
        r1.setImage("/x1.webp");
        r1.setUrl("/product/X-1");
        r1.setRgb(List.of(0, 0, 0));

        var r2 = new CatalogRecommendationEntity();
        r2.setSku("X-2");
        r2.setName("X2");
        r2.setImage("/x2.webp");
        r2.setUrl("/product/X-2");
        r2.setRgb(List.of(0, 0, 0));

        when(recommendationRepository.findAll()).thenReturn(List.of(r1, r2));

        var result = catalogQueryService.getRandomRecommendations(null, 1);
        assertThat(result).hasSize(1);
    }

    @Test
    void getRandomRecommendationsConPoolVacioRetornaListaVacia() {
        when(recommendationRepository.findAll()).thenReturn(List.of());
        assertThat(catalogQueryService.getRandomRecommendations(null, 5)).isEmpty();
    }
}
