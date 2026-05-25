package com.quind.tractorstore.catalog.api;

import com.quind.tractorstore.catalog.internal.CatalogQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogQueryService catalogQueryService;

    public CatalogController(CatalogQueryService catalogQueryService) {
        this.catalogQueryService = catalogQueryService;
    }

    @GetMapping("/home")
    public CatalogDtos.HomeResponse home() {
        return catalogQueryService.getHome();
    }

    @GetMapping("/categories/{filter}")
    public CatalogDtos.CategoryDto category(@PathVariable String filter) {
        return catalogQueryService.getCategory(filter);
    }

    @GetMapping("/products/{id}")
    public CatalogDtos.ProductResponse product(@PathVariable String id) {
        return catalogQueryService.getProduct(id);
    }

    @GetMapping("/recommendations")
    public List<CatalogDtos.RecommendationDto> recommendations(
            @RequestParam(required = false) String skus,
            @RequestParam(required = false) String excludeProductId,
            @RequestParam(defaultValue = "false") boolean random,
            @RequestParam(defaultValue = "4") int limit) {
        if (random) {
            return catalogQueryService.getRandomRecommendations(excludeProductId, Math.min(Math.max(limit, 1), 12));
        }
        return catalogQueryService.getRecommendations(skus);
    }

    @GetMapping("/stores")
    public List<CatalogDtos.StoreDto> stores() {
        return catalogQueryService.getStores();
    }
}
