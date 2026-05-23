package com.quind.tractorstore.inventory.internal.seed;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quind.tractorstore.inventory.internal.persistence.InventoryItemEntity;
import com.quind.tractorstore.inventory.internal.persistence.InventoryItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(20)
public class InventorySeedLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(InventorySeedLoader.class);

    private final ObjectMapper objectMapper;
    private final InventoryItemRepository repository;

    public InventorySeedLoader(ObjectMapper objectMapper, InventoryItemRepository repository) {
        this.objectMapper = objectMapper;
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        log.info("Syncing inventory from seed data");
        var root = objectMapper.readTree(new ClassPathResource("seed/checkout-db.json").getInputStream());
        for (JsonNode variant : root.get("variants")) {
            var sku = variant.get("sku").asText();
            var seedQty = variant.get("inventory").asInt();
            repository.findById(sku).ifPresentOrElse(
                    entity -> {
                        if (entity.getQuantity() < seedQty) {
                            entity.setQuantity(seedQty);
                            repository.save(entity);
                        }
                    },
                    () -> {
                        var entity = new InventoryItemEntity();
                        entity.setSku(sku);
                        entity.setQuantity(seedQty);
                        repository.save(entity);
                    });
        }
    }
}
