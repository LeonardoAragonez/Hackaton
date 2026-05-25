package com.quind.tractorstore.shared.api;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ApiExceptionTest {

    @Test
    void exposesCodeStatusAndDetails() {
        var ex = new ApiException(
                "VALIDATION_ERROR",
                "Invalid",
                HttpStatus.BAD_REQUEST,
                Map.of("field", "error"));

        assertThat(ex.getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ex.getMessage()).isEqualTo("Invalid");
        assertThat(ex.getDetails()).containsEntry("field", "error");
    }

    @Test
    void allowsNullDetails() {
        var ex = new ApiException("NOT_FOUND", "missing", HttpStatus.NOT_FOUND);

        assertThat(ex.getDetails()).isNull();
    }
}
