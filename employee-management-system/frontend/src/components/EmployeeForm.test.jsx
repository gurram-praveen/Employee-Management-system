import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import EmployeeForm from './EmployeeForm.jsx';

const renderForm = (onSubmit = vi.fn()) => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <EmployeeForm
        departments={['Engineering']}
        submitting={false}
        submitLabel="Add Employee"
        onSubmit={onSubmit}
      />
    </MemoryRouter>,
  );
  return onSubmit;
};

describe('EmployeeForm', () => {
  it('shows validation errors when required fields are empty', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
    expect(screen.getByText('Employee ID is required')).toBeInTheDocument();
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Department is required')).toBeInTheDocument();
  });

  it('submits a valid employee with a numeric salary', () => {
    const onSubmit = renderForm();
    const values = {
      employeeId: 'EMP101',
      fullName: 'Sam Lee',
      email: 'sam@example.com',
      phoneNumber: '9876543210',
      department: 'Engineering',
      designation: 'Developer',
      dateOfJoining: '2024-02-01',
      salary: '50000',
    };
    Object.entries(values).forEach(([name, value]) => {
      fireEvent.change(screen.getByLabelText(new RegExp(name === 'fullName' ? 'Full Name' :
        name === 'employeeId' ? 'Employee ID' : name === 'email' ? 'Email Address' :
          name === 'phoneNumber' ? 'Phone Number' : name === 'department' ? 'Department' :
            name === 'designation' ? 'Designation' : name === 'dateOfJoining' ? 'Date of Joining' : 'Salary')),
      { target: { value } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Employee' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      employeeId: 'EMP101',
      fullName: 'Sam Lee',
      salary: 50000,
      status: 'ACTIVE',
    }));
  });
});
