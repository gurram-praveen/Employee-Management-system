package com.kloudspot.ems.repository;

import com.kloudspot.ems.entity.Employee;
import com.kloudspot.ems.entity.EmploymentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    boolean existsByEmployeeIdIgnoreCase(String employeeId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmployeeIdIgnoreCaseAndIdNot(String employeeId, Long id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByStatus(EmploymentStatus status);

    long countByDepartmentIgnoreCase(String department);

    @Modifying
    @Query("update Employee e set e.department = :newDepartment where lower(e.department) = lower(:oldDepartment)")
    int renameDepartment(@Param("oldDepartment") String oldDepartment,
                         @Param("newDepartment") String newDepartment);

    @Query("select distinct e.department from Employee e order by e.department")
    List<String> findDistinctDepartments();
}
