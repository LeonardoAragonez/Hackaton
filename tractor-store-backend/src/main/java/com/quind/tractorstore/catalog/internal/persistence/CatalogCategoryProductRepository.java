package com.quind.tractorstore.catalog.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogCategoryProductRepository extends JpaRepository<CatalogCategoryProductEntity, Long> {

    List<CatalogCategoryProductEntity> findByCategoryKeyOrderBySortOrderAsc(String categoryKey);
}
