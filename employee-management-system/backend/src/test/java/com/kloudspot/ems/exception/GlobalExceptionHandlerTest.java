package com.kloudspot.ems.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.kloudspot.ems.dto.ApiError;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void responseStatusExceptionPreservesUnauthorizedStatusAndMessage() {
        var response = handler.handleResponseStatus(
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        ApiError error = response.getBody();
        assertEquals(401, error.status());
        assertEquals("Invalid username or password", error.message());
    }
}
