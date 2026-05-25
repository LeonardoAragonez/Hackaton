package com.quind.tractorstore.cart.internal.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartSessionRepository extends JpaRepository<CartSessionEntity, String> {
}
