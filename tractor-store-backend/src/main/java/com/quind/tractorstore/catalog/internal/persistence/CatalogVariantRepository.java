package com.quind.tractorstore.catalog.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CatalogVariantRepository extends JpaRepository<CatalogVariantEntity, String> {

    List<CatalogVariantEntity> findByProductId(String productId);

    Optional<CatalogVariantEntity> findBySku(String sku);
}
