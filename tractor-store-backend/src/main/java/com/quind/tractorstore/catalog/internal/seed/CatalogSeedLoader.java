package com.quind.tractorstore.catalog.internal.seed;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component
@Order(10)
public class CatalogSeedLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogSeedLoader.class);

    private final ObjectMapper objectMapper;
    private final CatalogTeaserRepository teaserRepository;
    private final CatalogCategoryRepository categoryRepository;
    private final CatalogCategoryProductRepository categoryProductRepository;
    private final CatalogProductRepository productRepository;
    private final CatalogVariantRepository variantRepository;
    private final CatalogRecommendationRepository recommendationRepository;
    private final CatalogStoreRepository storeRepository;

    public CatalogSeedLoader(
            ObjectMapper objectMapper,
            CatalogTeaserRepository teaserRepository,
            CatalogCategoryRepository categoryRepository,
            CatalogCategoryProductRepository categoryProductRepository,
            CatalogProductRepository productRepository,
            CatalogVariantRepository variantRepository,
            CatalogRecommendationRepository recommendationRepository,
            CatalogStoreRepository storeRepository) {
        this.objectMapper = objectMapper;
        this.teaserRepository = teaserRepository;
        this.categoryRepository = categoryRepository;
        this.categoryProductRepository = categoryProductRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.recommendationRepository = recommendationRepository;
        this.storeRepository = storeRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (teaserRepository.count() > 0) {
            return;
        }
        log.info("Loading catalog seed data");
        loadExplore();
        loadDecide();
    }

    private void loadExplore() throws Exception {
        var root = objectMapper.readTree(new ClassPathResource("seed/explore-db.json").getInputStream());

        int teaserOrder = 0;
        for (JsonNode node : root.get("teaser")) {
            var entity = new CatalogTeaserEntity();
            entity.setTitle(node.get("title").asText());
            entity.setImage(node.get("image").asText());
            entity.setUrl(node.get("url").asText());
            entity.setSortOrder(teaserOrder++);
            teaserRepository.save(entity);
        }

        for (JsonNode categoryNode : root.get("categories")) {
            var category = new CatalogCategoryEntity();
            var key = categoryNode.get("key").asText();
            category.setCategoryKey(key);
            category.setName(categoryNode.get("name").asText());
            categoryRepository.save(category);

            int productOrder = 0;
            for (JsonNode productNode : categoryNode.get("products")) {
                var product = new CatalogCategoryProductEntity();
                product.setCategoryKey(key);
                product.setProductId(productNode.get("id").asText());
                product.setName(productNode.get("name").asText());
                product.setImage(productNode.get("image").asText());
                product.setStartPrice(productNode.get("startPrice").asInt());
                product.setUrl(productNode.get("url").asText());
                product.setSortOrder(productOrder++);
                categoryProductRepository.save(product);
            }
        }

        var recommendations = root.get("recommendations");
        Iterator<String> fieldNames = recommendations.fieldNames();
        while (fieldNames.hasNext()) {
            var sku = fieldNames.next();
            var node = recommendations.get(sku);
            var entity = new CatalogRecommendationEntity();
            entity.setSku(sku);
            entity.setName(node.get("name").asText());
            entity.setImage(node.get("image").asText());
            entity.setUrl(node.get("url").asText());
            entity.setRgb(readRgb(node.get("rgb")));
            recommendationRepository.save(entity);
        }

        for (JsonNode storeNode : root.get("stores")) {
            var store = new CatalogStoreEntity();
            store.setStoreId(storeNode.get("id").asText());
            store.setName(storeNode.get("name").asText());
            store.setStreet(storeNode.get("street").asText());
            store.setCity(storeNode.get("city").asText());
            store.setImage(storeNode.get("image").asText());
            storeRepository.save(store);
        }
    }

    private void loadDecide() throws Exception {
        var root = objectMapper.readTree(new ClassPathResource("seed/decide-db.json").getInputStream());
        for (JsonNode productNode : root.get("products")) {
            var product = new CatalogProductEntity();
            product.setProductId(productNode.get("id").asText());
            product.setName(productNode.get("name").asText());
            product.setCategory(productNode.get("category").asText());
            product.setHighlights(readHighlights(productNode));
            productRepository.save(product);

            for (JsonNode variantNode : productNode.get("variants")) {
                var variant = new CatalogVariantEntity();
                variant.setSku(variantNode.get("sku").asText());
                variant.setProductId(product.getProductId());
                variant.setName(variantNode.get("name").asText());
                variant.setImage(variantNode.get("image").asText());
                if (variantNode.hasNonNull("color")) {
                    variant.setColor(variantNode.get("color").asText());
                }
                variant.setPrice(variantNode.get("price").asInt());
                variantRepository.save(variant);
            }
        }
    }

    private List<String> readHighlights(JsonNode productNode) {
        JsonNode highlights = productNode.has("highlights")
                ? productNode.get("highlights")
                : productNode.get("highlightsa");
        var result = new ArrayList<String>();
        if (highlights != null && highlights.isArray()) {
            highlights.forEach(n -> result.add(n.asText()));
        }
        return result;
    }

    private List<Integer> readRgb(JsonNode rgbNode) {
        var rgb = new ArrayList<Integer>();
        if (rgbNode != null && rgbNode.isArray()) {
            rgbNode.forEach(n -> rgb.add(n.asInt()));
        }
        return rgb;
    }
}
