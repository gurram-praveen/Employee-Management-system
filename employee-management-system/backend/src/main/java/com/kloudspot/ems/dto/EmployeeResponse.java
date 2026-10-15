package com.kloudspot.ems.dto;

import com.kloudspot.ems.entity.EmploymentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String employeeId,
        String fullName,
        String email,
        String phoneNumber,
        String department,
        String designation,
        LocalDate dateOfJoining,
        BigDecimal salary,
        EmploymentStatus status) {
}
