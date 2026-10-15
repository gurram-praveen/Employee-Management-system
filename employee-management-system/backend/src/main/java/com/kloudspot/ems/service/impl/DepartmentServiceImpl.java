package com.kloudspot.ems.service.impl;

import com.kloudspot.ems.dto.DepartmentRequest;
import com.kloudspot.ems.dto.DepartmentResponse;
import com.kloudspot.ems.entity.Department;
import com.kloudspot.ems.exception.DuplicateResourceException;
import com.kloudspot.ems.exception.ResourceNotFoundException;
import com.kloudspot.ems.repository.DepartmentRepository;
import com.kloudspot.ems.repository.EmployeeRepository;
import com.kloudspot.ems.service.DepartmentService;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departments;
    private final EmployeeRepository employees;

    public DepartmentServiceImpl(DepartmentRepository departments, EmployeeRepository employees) {
        this.departments = departments;
        this.employees = employees;
    }

    @Override
    public List<DepartmentResponse> list() {
        return departments.findAll(Sort.by("name")).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        String name = request.name().trim();
        if (departments.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Department already exists: " + name);
        }
        Department department = new Department();
        department.setName(name);
        return toResponse(departments.save(department));
    }

    @Override
    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = find(id);
        String name = request.name().trim();
        if (departments.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Department already exists: " + name);
        }
        employees.renameDepartment(department.getName(), name);
        department.setName(name);
        return toResponse(departments.save(department));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Department department = find(id);
        long employeeCount = employees.countByDepartmentIgnoreCase(department.getName());
        if (employeeCount > 0) {
            throw new DuplicateResourceException(
                    "Cannot delete a department assigned to " + employeeCount + " employee(s)");
        }
        departments.delete(department);
    }

    private Department find(Long id) {
        return departments.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id " + id));
    }

    private DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(department.getId(), department.getName(),
                employees.countByDepartmentIgnoreCase(department.getName()));
    }
}
