package com.quind.tractorstore.cart.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    List<CartItemEntity> findBySessionId(String sessionId);

    Optional<CartItemEntity> findBySessionIdAndSku(String sessionId, String sku);

    void deleteBySessionIdAndSku(String sessionId, String sku);

    void deleteBySessionId(String sessionId);
}
