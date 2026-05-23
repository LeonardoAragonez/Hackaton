package com.quind.tractorstore.catalog.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogStoreRepository extends JpaRepository<CatalogStoreEntity, String> {
}
