package com.quind.tractorstore.inventory.internal.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItemEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from InventoryItemEntity i where i.sku = :sku")
    Optional<InventoryItemEntity> findBySkuForUpdate(@Param("sku") String sku);
}
