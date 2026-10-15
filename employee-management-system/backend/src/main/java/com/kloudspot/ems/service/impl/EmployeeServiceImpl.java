package com.kloudspot.ems.service.impl;

import com.kloudspot.ems.dto.EmployeeRequest;
import com.kloudspot.ems.dto.EmployeeResponse;
import com.kloudspot.ems.dto.EmployeeSummary;
import com.kloudspot.ems.dto.PageResponse;
import com.kloudspot.ems.entity.Employee;
import com.kloudspot.ems.entity.EmploymentStatus;
import com.kloudspot.ems.exception.DuplicateResourceException;
import com.kloudspot.ems.exception.ResourceNotFoundException;
import com.kloudspot.ems.repository.EmployeeRepository;
import com.kloudspot.ems.service.EmployeeService;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeServiceImpl(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (repository.existsByEmployeeIdIgnoreCase(request.getEmployeeId().trim())) {
            throw new DuplicateResourceException("Employee ID already exists: " + request.getEmployeeId());
        }
        if (repository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        Employee employee = new Employee();
        apply(employee, request);
        return toResponse(repository.save(employee));
    }

    @Override
    public EmployeeResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = find(id);
        if (repository.existsByEmployeeIdIgnoreCaseAndIdNot(request.getEmployeeId().trim(), id)) {
            throw new DuplicateResourceException("Employee ID already exists: " + request.getEmployeeId());
        }
        if (repository.existsByEmailIgnoreCaseAndIdNot(request.getEmail().trim(), id)) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        apply(employee, request);
        return toResponse(repository.save(employee));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    @Override
    public PageResponse<EmployeeResponse> search(String keyword, String department,
                                                 EmploymentStatus status, Pageable pageable) {
        return PageResponse.from(repository.findAll(filterSpec(keyword, department, status), pageable)
                .map(this::toResponse));
    }

    @Override
    public EmployeeSummary summary() {
        long active = repository.countByStatus(EmploymentStatus.ACTIVE);
        long inactive = repository.countByStatus(EmploymentStatus.INACTIVE);
        return new EmployeeSummary(active + inactive, active, inactive);
    }

    @Override
    public List<String> departments() {
        return repository.findDistinctDepartments();
    }

    @Override
    public String exportCsv(String keyword, String department, EmploymentStatus status) {
        String header = "Employee ID,Full Name,Email Address,Phone Number,Department,Designation,"
                + "Date of Joining,Salary,Employment Status";
        String rows = repository.findAll(filterSpec(keyword, department, status), Sort.by("employeeId"))
                .stream()
                .map(employee -> List.of(
                        csvCell(employee.getEmployeeId()),
                        csvCell(employee.getFullName()),
                        csvCell(employee.getEmail()),
                        csvCell(employee.getPhoneNumber()),
                        csvCell(employee.getDepartment()),
                        csvCell(employee.getDesignation()),
                        csvCell(employee.getDateOfJoining().toString()),
                        csvCell(employee.getSalary().toPlainString()),
                        csvCell(employee.getStatus().name()))
                        .stream().collect(Collectors.joining(",")))
                .collect(Collectors.joining("\r\n"));
        return header + "\r\n" + rows + "\r\n";
    }

    private Specification<Employee> filterSpec(String keyword, String department, EmploymentStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email")), like)));
            }
            if (department != null && !department.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("department")), department.trim().toLowerCase()));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String csvCell(String value) {
        String safeValue = value.matches("^[\\s]*[=+@-].*")
                ? "'" + value
                : value;
        return "\"" + safeValue.replace("\"", "\"\"") + "\"";
    }

    private Employee find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + id));
    }

    private void apply(Employee e, EmployeeRequest r) {
        e.setEmployeeId(r.getEmployeeId().trim());
        e.setFullName(r.getFullName().trim());
        e.setEmail(r.getEmail().trim());
        e.setPhoneNumber(r.getPhoneNumber().trim());
        e.setDepartment(r.getDepartment().trim());
        e.setDesignation(r.getDesignation().trim());
        e.setDateOfJoining(r.getDateOfJoining());
        e.setSalary(r.getSalary());
        e.setStatus(r.getStatus());
    }

    private EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.getId(), e.getEmployeeId(), e.getFullName(), e.getEmail(),
                e.getPhoneNumber(), e.getDepartment(), e.getDesignation(), e.getDateOfJoining(),
                e.getSalary(), e.getStatus());
    }
}
