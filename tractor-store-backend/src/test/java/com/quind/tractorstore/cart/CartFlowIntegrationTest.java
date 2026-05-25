package com.quind.tractorstore.cart;

import com.fasterxml.jackson.databind.JsonNode;
import com.quind.tractorstore.TractorStoreApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TractorStoreApplication.class)
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
@ActiveProfiles("test")
class CartFlowIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("tractor_store_test")
            .withUsername("tractor")
            .withPassword("tractor");

    @DynamicPropertySource
    static void registerDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void cartAddMiniAndRemoveFlow() throws Exception {
        MvcResult addResult = mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sku\":\"AU-01-SI\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1))
                .andExpect(jsonPath("$.total").value(1000))
                .andReturn();

        var cookie = addResult.getResponse().getCookie("CART_SESSION");
        assertThat(cookie).isNotNull();
        assertThat(cookie.isHttpOnly()).isTrue();

        mockMvc.perform(get("/api/cart/mini").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1))
                .andExpect(jsonPath("$.total").value(1000));

        mockMvc.perform(get("/api/cart").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].sku").value("AU-01-SI"));

        mockMvc.perform(delete("/api/cart/items/AU-01-SI").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(0));
    }

    @Test
    void inventoryEndpointReturnsStock() throws Exception {
        mockMvc.perform(get("/api/inventory/AU-01-SI"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("AU-01-SI"))
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    void catalogHomeReturnsTeasers() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/catalog/home")).andExpect(status().isOk()).andReturn();
        JsonNode body = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(result.getResponse().getContentAsString());
        assertThat(body.get("teaser")).isNotEmpty();
        assertThat(body.get("categories")).isNotEmpty();
    }
}
