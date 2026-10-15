package com.kloudspot.ems.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kloudspot.ems.dto.EmployeeRequest;
import com.kloudspot.ems.dto.EmployeeResponse;
import com.kloudspot.ems.dto.EmployeeSummary;
import com.kloudspot.ems.dto.PageResponse;
import com.kloudspot.ems.entity.Employee;
import com.kloudspot.ems.entity.EmploymentStatus;
import com.kloudspot.ems.exception.DuplicateResourceException;
import com.kloudspot.ems.exception.ResourceNotFoundException;
import com.kloudspot.ems.repository.EmployeeRepository;
import com.kloudspot.ems.service.impl.EmployeeServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository repository;

    @InjectMocks
    private EmployeeServiceImpl service;

    private EmployeeRequest request;
    private Employee saved;

    @BeforeEach
    void setUp() {
        request = new EmployeeRequest();
        request.setEmployeeId("EMP001");
        request.setFullName("Asha Rao");
        request.setEmail("asha@example.com");
        request.setPhoneNumber("9876543210");
        request.setDepartment("Engineering");
        request.setDesignation("Developer");
        request.setDateOfJoining(LocalDate.of(2024, 1, 15));
        request.setSalary(new BigDecimal("55000.00"));
        request.setStatus(EmploymentStatus.ACTIVE);

        saved = new Employee();
        saved.setId(1L);
        saved.setEmployeeId("EMP001");
        saved.setFullName("Asha Rao");
        saved.setEmail("asha@example.com");
        saved.setPhoneNumber("9876543210");
        saved.setDepartment("Engineering");
        saved.setDesignation("Developer");
        saved.setDateOfJoining(LocalDate.of(2024, 1, 15));
        saved.setSalary(new BigDecimal("55000.00"));
        saved.setStatus(EmploymentStatus.ACTIVE);
    }

    @Test
    void create_savesAndReturnsEmployee() {
        when(repository.existsByEmployeeIdIgnoreCase("EMP001")).thenReturn(false);
        when(repository.existsByEmailIgnoreCase("asha@example.com")).thenReturn(false);
        when(repository.save(any(Employee.class))).thenReturn(saved);

        EmployeeResponse result = service.create(request);

        assertEquals(1L, result.id());
        assertEquals("EMP001", result.employeeId());
        assertEquals("Asha Rao", result.fullName());
        verify(repository).save(any(Employee.class));
    }

    @Test
    void create_duplicateEmployeeId_throwsConflict() {
        when(repository.existsByEmployeeIdIgnoreCase("EMP001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> service.create(request));
        verify(repository, never()).save(any());
    }

    @Test
    void create_duplicateEmail_throwsConflict() {
        when(repository.existsByEmployeeIdIgnoreCase("EMP001")).thenReturn(false);
        when(repository.existsByEmailIgnoreCase("asha@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> service.create(request));
        verify(repository, never()).save(any());
    }

    @Test
    void getById_existing_returnsEmployee() {
        when(repository.findById(1L)).thenReturn(Optional.of(saved));

        EmployeeResponse result = service.getById(1L);

        assertEquals("asha@example.com", result.email());
        assertEquals(EmploymentStatus.ACTIVE, result.status());
    }

    @Test
    void getById_missing_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById(99L));
    }

    @Test
    void update_existing_updatesFields() {
        request.setFullName("Asha R. Rao");
        request.setStatus(EmploymentStatus.INACTIVE);
        when(repository.findById(1L)).thenReturn(Optional.of(saved));
        when(repository.existsByEmployeeIdIgnoreCaseAndIdNot("EMP001", 1L)).thenReturn(false);
        when(repository.existsByEmailIgnoreCaseAndIdNot("asha@example.com", 1L)).thenReturn(false);
        when(repository.save(any(Employee.class))).thenAnswer(inv -> inv.getArgument(0));

        EmployeeResponse result = service.update(1L, request);

        assertEquals("Asha R. Rao", result.fullName());
        assertEquals(EmploymentStatus.INACTIVE, result.status());
    }

    @Test
    void update_missing_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(99L, request));
        verify(repository, never()).save(any());
    }

    @Test
    void update_emailUsedByAnotherEmployee_throwsConflict() {
        when(repository.findById(1L)).thenReturn(Optional.of(saved));
        when(repository.existsByEmployeeIdIgnoreCaseAndIdNot("EMP001", 1L)).thenReturn(false);
        when(repository.existsByEmailIgnoreCaseAndIdNot("asha@example.com", 1L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> service.update(1L, request));
        verify(repository, never()).save(any());
    }

    @Test
    void update_employeeIdUsedByAnotherEmployee_throwsConflict() {
        when(repository.findById(1L)).thenReturn(Optional.of(saved));
        when(repository.existsByEmployeeIdIgnoreCaseAndIdNot("EMP001", 1L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> service.update(1L, request));
        verify(repository, never()).save(any());
    }

    @Test
    void delete_existing_deletesEmployee() {
        when(repository.findById(1L)).thenReturn(Optional.of(saved));

        service.delete(1L);

        verify(repository).delete(saved);
    }

    @Test
    void delete_missing_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete(99L));
        verify(repository, never()).delete(any(Employee.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void search_returnsPagedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        when(repository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(saved), pageable, 1));

        PageResponse<EmployeeResponse> result =
                service.search("asha", "Engineering", EmploymentStatus.ACTIVE, pageable);

        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());
        assertEquals(0, result.page());
    }

    @Test
    void summary_returnsCounts() {
        when(repository.countByStatus(EmploymentStatus.ACTIVE)).thenReturn(7L);
        when(repository.countByStatus(EmploymentStatus.INACTIVE)).thenReturn(3L);

        EmployeeSummary summary = service.summary();

        assertEquals(10L, summary.total());
        assertEquals(7L, summary.active());
        assertEquals(3L, summary.inactive());
    }

    @Test
    @SuppressWarnings("unchecked")
    void exportCsv_quotesCellsAndNeutralizesSpreadsheetFormulas() {
        saved.setFullName("=HYPERLINK(\"https://example.com\")");
        when(repository.findAll(any(Specification.class), eq(Sort.by("employeeId"))))
                .thenReturn(List.of(saved));

        String csv = service.exportCsv(null, "Engineering", EmploymentStatus.ACTIVE);

        assertTrue(csv.startsWith("Employee ID,Full Name,Email Address"));
        assertTrue(csv.contains("\"'=HYPERLINK(\"\"https://example.com\"\")\""));
        assertTrue(csv.endsWith("\"ACTIVE\"\r\n"));
    }
}
