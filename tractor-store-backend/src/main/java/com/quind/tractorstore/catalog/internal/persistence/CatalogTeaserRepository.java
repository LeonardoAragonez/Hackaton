package com.quind.tractorstore.catalog.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogTeaserRepository extends JpaRepository<CatalogTeaserEntity, Long> {

    List<CatalogTeaserEntity> findAllByOrderBySortOrderAsc();
}
