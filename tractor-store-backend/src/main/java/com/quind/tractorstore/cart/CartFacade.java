package com.quind.tractorstore.cart;

import com.quind.tractorstore.cart.internal.CartService;
import com.quind.tractorstore.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CartFacade {

    private final CartService cartService;

    public CartFacade(CartService cartService) {
        this.cartService = cartService;
    }

    public CartSnapshot getCartOrThrow(String sessionId) {
        var cart = cartService.getCart(sessionId);
        if (cart.items().isEmpty()) {
            throw new ApiException("CART_EMPTY", "Cart is empty", HttpStatus.BAD_REQUEST);
        }
        return toSnapshot(cart);
    }

    public void clearCart(String sessionId) {
        cartService.clear(sessionId);
    }

    private CartSnapshot toSnapshot(com.quind.tractorstore.cart.api.CartDtos.CartResponse cart) {
        var lines = cart.items().stream()
                .map(i -> new CartSnapshot.CartLineSnapshot(
                        i.sku(), i.name(), i.image(), i.quantity(), i.unitPrice(), i.lineTotal()))
                .toList();
        return new CartSnapshot(cart.sessionId(), lines, cart.itemCount(), cart.total());
    }
}
