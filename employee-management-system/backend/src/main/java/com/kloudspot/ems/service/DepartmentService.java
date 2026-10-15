package com.kloudspot.ems.service;

import com.kloudspot.ems.dto.DepartmentRequest;
import com.kloudspot.ems.dto.DepartmentResponse;
import java.util.List;

public interface DepartmentService {

    List<DepartmentResponse> list();

    DepartmentResponse create(DepartmentRequest request);

    DepartmentResponse update(Long id, DepartmentRequest request);

    void delete(Long id);
}
