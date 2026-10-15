package com.kloudspot.ems.service;

import com.kloudspot.ems.dto.EmployeeRequest;
import com.kloudspot.ems.dto.EmployeeResponse;
import com.kloudspot.ems.dto.EmployeeSummary;
import com.kloudspot.ems.dto.PageResponse;
import com.kloudspot.ems.entity.EmploymentStatus;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    EmployeeResponse create(EmployeeRequest request);

    EmployeeResponse getById(Long id);

    EmployeeResponse update(Long id, EmployeeRequest request);

    void delete(Long id);

    PageResponse<EmployeeResponse> search(String keyword, String department, EmploymentStatus status, Pageable pageable);

    EmployeeSummary summary();

    List<String> departments();

    String exportCsv(String keyword, String department, EmploymentStatus status);
}
