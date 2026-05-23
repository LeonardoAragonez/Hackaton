package com.quind.tractorstore.catalog.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogRecommendationRepository extends JpaRepository<CatalogRecommendationEntity, String> {

    List<CatalogRecommendationEntity> findBySkuIn(List<String> skus);
}
