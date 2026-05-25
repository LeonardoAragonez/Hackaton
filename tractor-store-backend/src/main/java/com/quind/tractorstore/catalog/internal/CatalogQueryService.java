package com.quind.tractorstore.catalog.internal;

import com.quind.tractorstore.catalog.api.CatalogDtos;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryProductRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogCategoryRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogProductRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogRecommendationRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogStoreRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogTeaserRepository;
import com.quind.tractorstore.catalog.internal.persistence.CatalogVariantRepository;
import com.quind.tractorstore.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class CatalogQueryService {

    private static final Pattern PRODUCT_ID_IN_URL = Pattern.compile("/product/([^/?]+)");

    private final CatalogTeaserRepository teaserRepository;
    private final CatalogCategoryRepository categoryRepository;
    private final CatalogCategoryProductRepository categoryProductRepository;
    private final CatalogProductRepository productRepository;
    private final CatalogVariantRepository variantRepository;
    private final CatalogRecommendationRepository recommendationRepository;
    private final CatalogStoreRepository storeRepository;

    public CatalogQueryService(
            CatalogTeaserRepository teaserRepository,
            CatalogCategoryRepository categoryRepository,
            CatalogCategoryProductRepository categoryProductRepository,
            CatalogProductRepository productRepository,
            CatalogVariantRepository variantRepository,
            CatalogRecommendationRepository recommendationRepository,
            CatalogStoreRepository storeRepository) {
        this.teaserRepository = teaserRepository;
        this.categoryRepository = categoryRepository;
        this.categoryProductRepository = categoryProductRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.recommendationRepository = recommendationRepository;
        this.storeRepository = storeRepository;
    }

    public CatalogDtos.HomeResponse getHome() {
        var teasers = teaserRepository.findAllByOrderBySortOrderAsc().stream()
                .map(t -> new CatalogDtos.TeaserDto(t.getTitle(), t.getImage(), t.getUrl()))
                .toList();
        var categories = categoryRepository.findAll().stream()
                .map(c -> new CatalogDtos.CategoryDto(
                        c.getCategoryKey(),
                        c.getName(),
                        mapCategoryProducts(c.getCategoryKey())))
                .toList();
        return new CatalogDtos.HomeResponse(teasers, categories);
    }

    public CatalogDtos.CategoryDto getCategory(String filter) {
        return categoryRepository.findById(filter)
                .map(c -> new CatalogDtos.CategoryDto(
                        c.getCategoryKey(), c.getName(), mapCategoryProducts(filter)))
                .orElseThrow(() -> new ApiException(
                        "CATEGORY_NOT_FOUND",
                        "Category not found: " + filter,
                        HttpStatus.NOT_FOUND));
    }

    public CatalogDtos.ProductResponse getProduct(String id) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        "PRODUCT_NOT_FOUND",
                        "Product not found: " + id,
                        HttpStatus.NOT_FOUND));
        var variants = variantRepository.findByProductId(id).stream()
                .map(v -> new CatalogDtos.VariantDto(v.getName(), v.getImage(), v.getSku(), v.getColor(), v.getPrice()))
                .toList();
        return new CatalogDtos.ProductResponse(
                product.getName(),
                product.getProductId(),
                product.getCategory(),
                product.getHighlights(),
                variants);
    }

    public List<CatalogDtos.RecommendationDto> getRecommendations(String skusParam) {
        if (skusParam == null || skusParam.isBlank()) {
            return List.of();
        }
        var skus = Arrays.stream(skusParam.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        return recommendationRepository.findBySkuIn(skus).stream()
                .map(this::toRecommendationDto)
                .toList();
    }

    public List<CatalogDtos.RecommendationDto> getRandomRecommendations(String excludeProductId, int limit) {
        var pool = new ArrayList<>(recommendationRepository.findAll());
        Collections.shuffle(pool);
        var exclude = excludeProductId != null ? excludeProductId.trim() : "";
        var seenProducts = new LinkedHashSet<String>();
        var result = new ArrayList<CatalogDtos.RecommendationDto>();

        for (var entity : pool) {
            var productId = extractProductIdFromUrl(entity.getUrl());
            if (productId == null) {
                continue;
            }
            if (!exclude.isEmpty() && productId.equalsIgnoreCase(exclude)) {
                continue;
            }
            if (!seenProducts.add(productId)) {
                continue;
            }
            result.add(toRecommendationDto(entity));
            if (result.size() >= limit) {
                break;
            }
        }
        return result;
    }

    private CatalogDtos.RecommendationDto toRecommendationDto(
            com.quind.tractorstore.catalog.internal.persistence.CatalogRecommendationEntity r) {
        return new CatalogDtos.RecommendationDto(r.getName(), r.getSku(), r.getImage(), r.getUrl(), r.getRgb());
    }

    private static String extractProductIdFromUrl(String url) {
        if (url == null) {
            return null;
        }
        var matcher = PRODUCT_ID_IN_URL.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    public List<CatalogDtos.StoreDto> getStores() {
        return storeRepository.findAll().stream()
                .map(s -> new CatalogDtos.StoreDto(
                        s.getStoreId(), s.getName(), s.getStreet(), s.getCity(), s.getImage()))
                .toList();
    }

    public Optional<VariantView> findVariantBySku(String sku) {
        return variantRepository.findBySku(sku)
                .map(v -> new VariantView(v.getSku(), v.getProductId(), v.getName(), v.getImage(), v.getPrice()));
    }

    public Optional<StoreView> findStoreById(String storeId) {
        return storeRepository.findById(storeId)
                .map(s -> new StoreView(s.getStoreId(), s.getName(), s.getStreet(), s.getCity(), s.getImage()));
    }

    private List<CatalogDtos.CategoryProductDto> mapCategoryProducts(String categoryKey) {
        return categoryProductRepository.findByCategoryKeyOrderBySortOrderAsc(categoryKey).stream()
                .map(p -> new CatalogDtos.CategoryProductDto(
                        p.getName(), p.getProductId(), p.getImage(), p.getStartPrice(), p.getUrl()))
                .toList();
    }

    public record VariantView(String sku, String productId, String name, String image, int price) {
    }

    public record StoreView(String id, String name, String street, String city, String image) {
    }
}
