package com.quind.tractorstore.cart;

import com.quind.tractorstore.cart.api.CartDtos;
import com.quind.tractorstore.cart.internal.CartService;
import com.quind.tractorstore.shared.api.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartFacadeTest {

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartFacade cartFacade;

    @Test
    void getCartOrThrowFailsWhenEmpty() {
        when(cartService.getCart("s1"))
                .thenReturn(new CartDtos.CartResponse("s1", List.of(), 0, 0));

        assertThatThrownBy(() -> cartFacade.getCartOrThrow("s1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void getCartOrThrowMapsSnapshot() {
        var item = new CartDtos.CartItemDto("SKU", "Tractor", "/t.webp", 2, 1000, 2000);
        when(cartService.getCart("s1"))
                .thenReturn(new CartDtos.CartResponse("s1", List.of(item), 2, 2000));

        var snapshot = cartFacade.getCartOrThrow("s1");

        assertThat(snapshot.sessionId()).isEqualTo("s1");
        assertThat(snapshot.itemCount()).isEqualTo(2);
        assertThat(snapshot.lines()).hasSize(1);
        assertThat(snapshot.lines().getFirst().sku()).isEqualTo("SKU");
    }

    @Test
    void clearCartDelegates() {
        cartFacade.clearCart("s1");
        verify(cartService).clear("s1");
    }
}
