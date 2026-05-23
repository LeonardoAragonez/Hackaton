package com.quind.tractorstore.catalog.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogCategoryRepository extends JpaRepository<CatalogCategoryEntity, String> {
}
