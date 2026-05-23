package com.quind.tractorstore.catalog.api;

import java.util.List;

public final class CatalogDtos {

    private CatalogDtos() {
    }

    public record TeaserDto(String title, String image, String url) {
    }

    public record CategoryProductDto(String name, String id, String image, int startPrice, String url) {
    }

    public record CategoryDto(String key, String name, List<CategoryProductDto> products) {
    }

    public record HomeResponse(List<TeaserDto> teaser, List<CategoryDto> categories) {
    }

    public record VariantDto(String name, String image, String sku, String color, int price) {
    }

    public record ProductResponse(
            String name,
            String id,
            String category,
            List<String> highlights,
            List<VariantDto> variants) {
    }

    public record RecommendationDto(String name, String sku, String image, String url, List<Integer> rgb) {
    }

    public record StoreDto(String id, String name, String street, String city, String image) {
    }
}
