import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmployeeList from './EmployeeList.jsx';
import Layout from '../components/Layout.jsx';
import { getDepartments, getEmployees, getSummary } from '../services/employeeService.js';

vi.mock('../services/employeeService.js', () => ({
  deleteEmployee: vi.fn(),
  exportEmployees: vi.fn(),
  getDepartments: vi.fn(),
  getEmployees: vi.fn(),
  getSummary: vi.fn(),
  parseError: (error) => ({ message: error.message, fieldErrors: {} }),
}));

const response = {
  content: [{
    id: 1,
    employeeId: 'EMP001',
    fullName: 'Asha Rao',
    email: 'asha.rao@example.com',
    phoneNumber: '9876543210',
    department: 'Engineering',
    designation: 'Developer',
    dateOfJoining: '2024-01-15',
    salary: 55000,
    status: 'ACTIVE',
  }],
  page: 0,
  size: 25,
  totalElements: 1,
  totalPages: 1,
};

describe('Employee directory', () => {
  beforeEach(() => {
    sessionStorage.setItem('emsCredentials', 'YWRtaW46Y2hhbmdlLW1l');
    vi.mocked(getEmployees).mockReset().mockResolvedValue(response);
    vi.mocked(getSummary).mockReset().mockResolvedValue({ total: 1, active: 1, inactive: 0 });
    vi.mocked(getDepartments).mockReset().mockResolvedValue(['Engineering']);
  });

  it('shows the company-branded directory and keeps one add-employee action', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout><EmployeeList /></Layout>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Asha Rao')).toBeInTheDocument();
    expect(screen.getByText('KLOUDSPOT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Employee Management System' })).toBeInTheDocument();
    expect(screen.queryByText('PEOPLE OPERATIONS')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Add employee' })).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveValue('25');
    expect(screen.getByRole('button', { name: 'Filter by active employees' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('uses the active summary card as a status quick filter', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout><EmployeeList /></Layout>
      </MemoryRouter>,
    );
    await screen.findByText('Asha Rao');

    fireEvent.click(screen.getByRole('button', { name: 'Filter by active employees' }));
    await waitFor(() => expect(getEmployees).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'ACTIVE', page: 0 }),
    ));
    expect(screen.getByRole('button', { name: 'Filter by active employees' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('requests the selected sort and page size from the API', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout><EmployeeList /></Layout>
      </MemoryRouter>,
    );
    await screen.findByText('Asha Rao');

    fireEvent.change(screen.getByLabelText('Sort:'), { target: { value: 'fullName' } });
    await waitFor(() => expect(getEmployees).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: 'fullName', direction: 'desc' }),
    ));

    fireEvent.change(screen.getByRole('combobox', { name: 'Rows per page' }), { target: { value: '50' } });
    await waitFor(() => expect(getEmployees).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: 'fullName', size: 50, page: 0 }),
    ));
  });
});
