package com.kloudspot.ems.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank(message = "Department name is required")
        @Size(max = 80, message = "Department name must be at most 80 characters")
        String name) {
}
