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
}
