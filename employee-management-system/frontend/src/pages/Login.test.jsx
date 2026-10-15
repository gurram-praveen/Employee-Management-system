import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login.jsx';
import { login as authenticate, parseError } from '../services/employeeService.js';

vi.mock('../services/employeeService.js', async (importOriginal) => ({
  ...await importOriginal(),
  login: vi.fn(),
}));

function renderLogin() {
  render(
    <MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/employees" element={<p>Employee list</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.mocked(authenticate).mockReset();
    sessionStorage.clear();
  });

  it('submits credentials and navigates to the employee list on success', async () => {
    vi.mocked(authenticate).mockResolvedValue(undefined);
    renderLogin();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Employee list')).toBeInTheDocument();
    expect(authenticate).toHaveBeenCalledWith('admin', 'secret');
  });

  it('shows authentication errors', async () => {
    vi.mocked(authenticate).mockRejectedValue({
      config: { url: '/auth/login' },
      response: { status: 401, data: { detail: 'Invalid username or password' } },
    });
    renderLogin();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
  });

  it('toggles password visibility accessibly', () => {
    renderLogin();
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows invalid credentials instead of a connection error for an authentication 401', () => {
    const error = {
      config: { url: '/auth/login' },
      response: { status: 401, data: {} },
    };

    expect(parseError(error).message).toBe('Invalid username or password.');
  });

  it('keeps a distinct message when the backend cannot be reached', () => {
    expect(parseError({ code: 'ERR_NETWORK' }).message)
      .toContain('Cannot reach the backend at http://localhost:8080');
  });
});
