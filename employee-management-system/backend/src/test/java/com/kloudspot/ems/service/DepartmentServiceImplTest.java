package com.kloudspot.ems.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kloudspot.ems.dto.DepartmentRequest;
import com.kloudspot.ems.entity.Department;
import com.kloudspot.ems.exception.DuplicateResourceException;
import com.kloudspot.ems.repository.DepartmentRepository;
import com.kloudspot.ems.repository.EmployeeRepository;
import com.kloudspot.ems.service.impl.DepartmentServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceImplTest {

    @Mock
    private DepartmentRepository departments;

    @Mock
    private EmployeeRepository employees;

    @InjectMocks
    private DepartmentServiceImpl service;

    @Test
    void create_rejectsDuplicateNameIgnoringCase() {
        when(departments.existsByNameIgnoreCase("Engineering")).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> service.create(new DepartmentRequest("Engineering")));
        verify(departments, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void updateRenamesAssignedEmployees() {
        Department department = new Department();
        department.setId(2L);
        department.setName("Engineering");
        when(departments.findById(2L)).thenReturn(Optional.of(department));
        when(departments.existsByNameIgnoreCaseAndIdNot("Product", 2L)).thenReturn(false);
        when(departments.save(department)).thenReturn(department);
        when(employees.countByDepartmentIgnoreCase("Product")).thenReturn(4L);

        var result = service.update(2L, new DepartmentRequest(" Product "));

        assertEquals("Product", result.name());
        assertEquals(4L, result.employeeCount());
        verify(employees).renameDepartment("Engineering", "Product");
    }

    @Test
    void deleteRejectsDepartmentThatHasEmployees() {
        Department department = new Department();
        department.setId(1L);
        department.setName("Engineering");
        when(departments.findById(1L)).thenReturn(Optional.of(department));
        when(employees.countByDepartmentIgnoreCase("Engineering")).thenReturn(2L);

        assertThrows(DuplicateResourceException.class, () -> service.delete(1L));
        verify(departments, never()).delete(department);
    }
}
