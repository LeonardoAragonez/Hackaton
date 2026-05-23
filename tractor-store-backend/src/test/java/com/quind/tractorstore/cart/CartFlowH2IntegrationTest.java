package com.quind.tractorstore.cart;

import com.fasterxml.jackson.databind.JsonNode;
import com.quind.tractorstore.TractorStoreApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TractorStoreApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class CartFlowH2IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void catalogHomeAndCartFlow() throws Exception {
        mockMvc.perform(get("/api/catalog/home")).andExpect(status().isOk());

        MvcResult add = mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sku\":\"AU-01-SI\"}"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode cart = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(add.getResponse().getContentAsString());
        assertThat(cart.get("itemCount").asInt()).isGreaterThan(0);

        mockMvc.perform(get("/api/cart/mini")).andExpect(status().isOk());
    }
}
