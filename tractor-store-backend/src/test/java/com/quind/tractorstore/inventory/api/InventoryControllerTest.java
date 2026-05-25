package com.quind.tractorstore.inventory.api;

import com.quind.tractorstore.inventory.internal.InventoryService;
import com.quind.tractorstore.shared.api.GlobalExceptionHandler;
import com.quind.tractorstore.shared.config.ApplicationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = InventoryController.class)
@Import({GlobalExceptionHandler.class, ApplicationConfig.class})
@TestPropertySource(
        properties = {
            "tractor.cart.cookie-name=CART_SESSION",
            "tractor.cart.cookie-max-age-days=30",
            "tractor.cart.cookie-path=/",
            "tractor.cors.allowed-origins=http://localhost:4200"
        })
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryService inventoryService;

    @Test
    void returnsStockForSku() throws Exception {
        when(inventoryService.getInventory("AU-01-SI"))
                .thenReturn(new InventoryDtos.InventoryResponse("AU-01-SI", 5, true));

        mockMvc.perform(get("/api/inventory/AU-01-SI"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("AU-01-SI"))
                .andExpect(jsonPath("$.quantity").value(5));
    }
}
