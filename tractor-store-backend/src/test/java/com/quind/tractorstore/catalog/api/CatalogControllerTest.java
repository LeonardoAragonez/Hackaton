package com.quind.tractorstore.catalog.api;

import com.quind.tractorstore.catalog.internal.CatalogQueryService;
import com.quind.tractorstore.shared.api.GlobalExceptionHandler;
import com.quind.tractorstore.shared.config.ApplicationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CatalogController.class)
@Import({GlobalExceptionHandler.class, ApplicationConfig.class})
@TestPropertySource(
        properties = {
            "tractor.cart.cookie-name=CART_SESSION",
            "tractor.cart.cookie-max-age-days=30",
            "tractor.cart.cookie-path=/",
            "tractor.cors.allowed-origins=http://localhost:4200"
        })
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CatalogQueryService catalogQueryService;

    @Test
    void homeReturnsTeasersAndCategories() throws Exception {
        when(catalogQueryService.getHome())
                .thenReturn(new CatalogDtos.HomeResponse(
                        List.of(new CatalogDtos.TeaserDto("Classic", "/img.webp", "/products/classic")),
                        List.of(new CatalogDtos.CategoryDto("classic", "Classics", List.of()))));

        mockMvc.perform(get("/api/catalog/home"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teaser[0].title").value("Classic"))
                .andExpect(jsonPath("$.categories[0].key").value("classic"));
    }

    @Test
    void storesReturnsList() throws Exception {
        when(catalogQueryService.getStores())
                .thenReturn(List.of(new CatalogDtos.StoreDto("s1", "Store", "Street", "City", "/s.webp")));

        mockMvc.perform(get("/api/catalog/stores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("s1"));
    }

    @Test
    void categoryReturnsDto() throws Exception {
        when(catalogQueryService.getCategory("classic"))
                .thenReturn(new CatalogDtos.CategoryDto("classic", "Classic", List.of()));

        mockMvc.perform(get("/api/catalog/categories/classic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value("classic"))
                .andExpect(jsonPath("$.name").value("Classic"));
    }

    @Test
    void productReturnsDto() throws Exception {
        when(catalogQueryService.getProduct("CL-01"))
                .thenReturn(new CatalogDtos.ProductResponse(
                        "Tractor",
                        "CL-01",
                        "classic",
                        List.of("h1"),
                        List.of(new CatalogDtos.VariantDto("Verde", "/g.webp", "CL-01-GR", "green", 1000))));

        mockMvc.perform(get("/api/catalog/products/CL-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("CL-01"))
                .andExpect(jsonPath("$.variants[0].sku").value("CL-01-GR"));
    }

    @Test
    void recommendationsBySkusDelegatesToService() throws Exception {
        when(catalogQueryService.getRecommendations("AU-01,CL-02"))
                .thenReturn(List.of(new CatalogDtos.RecommendationDto(
                        "Tractor", "AU-01", "/au.webp", "/product/AU-01", List.of(0, 1, 2))));

        mockMvc.perform(get("/api/catalog/recommendations").param("skus", "AU-01,CL-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("AU-01"));
    }

    @Test
    void recommendationsRandomDelegateConLimiteAcotado() throws Exception {
        when(catalogQueryService.getRandomRecommendations("CL-01", 12))
                .thenReturn(List.of(new CatalogDtos.RecommendationDto(
                        "Tractor", "X", "/x.webp", "/product/X", List.of(0, 0, 0))));

        mockMvc.perform(get("/api/catalog/recommendations")
                        .param("random", "true")
                        .param("excludeProductId", "CL-01")
                        .param("limit", "999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("X"));
    }

    @Test
    void recommendationsRandomConLimiteMenorQueUnoSeAjustaA1() throws Exception {
        when(catalogQueryService.getRandomRecommendations(null, 1))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/catalog/recommendations")
                        .param("random", "true")
                        .param("limit", "0"))
                .andExpect(status().isOk());
    }
}
