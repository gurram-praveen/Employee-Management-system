import { useState } from 'react';
import { Link } from 'react-router-dom';

const EMPTY = {
  employeeId: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  department: '',
  designation: '',
  dateOfJoining: '',
  salary: '',
  status: 'ACTIVE',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{10,14}$/;
const ID_RE = /^[A-Za-z0-9_-]+$/;

function validate(v) {
  const e = {};
  if (!v.employeeId.trim()) e.employeeId = 'Employee ID is required';
  else if (!ID_RE.test(v.employeeId.trim())) e.employeeId = 'Use letters, digits, hyphen or underscore only';
  if (!v.fullName.trim()) e.fullName = 'Full name is required';
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!v.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
  else if (!PHONE_RE.test(v.phoneNumber.trim())) e.phoneNumber = 'Phone must be 10-14 digits, optional leading +';
  if (!v.department.trim()) e.department = 'Department is required';
  if (!v.designation.trim()) e.designation = 'Designation is required';
  if (!v.dateOfJoining) e.dateOfJoining = 'Date of joining is required';
  else if (v.dateOfJoining > new Date().toISOString().slice(0, 10)) e.dateOfJoining = 'Date cannot be in the future';
  if (v.salary === '' || v.salary === null) e.salary = 'Salary is required';
  else if (Number.isNaN(Number(v.salary)) || Number(v.salary) <= 0) e.salary = 'Salary must be greater than 0';
  return e;
}

function Field({ label, name, error, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label} <span className="req">*</span></label>
      {children}
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}

export default function EmployeeForm({
  initial, departments = [], serverErrors = {}, submitting, submitLabel, onSubmit,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const [clientErrors, setClientErrors] = useState({});

  const errors = { ...serverErrors, ...clientErrors };

  const change = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setClientErrors((c) => ({ ...c, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setClientErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({
      employeeId: values.employeeId.trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      department: values.department.trim(),
      designation: values.designation.trim(),
      dateOfJoining: values.dateOfJoining,
      salary: Number(values.salary),
      status: values.status,
    });
  };

  const input = (name, props = {}) => (
    <input id={name} name={name} value={values[name]} onChange={change} {...props} />
  );

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Employee ID" name="employeeId" error={errors.employeeId}>
          {input('employeeId', { placeholder: 'EMP013' })}
        </Field>
        <Field label="Full Name" name="fullName" error={errors.fullName}>
          {input('fullName', { placeholder: 'Jane Doe' })}
        </Field>
        <Field label="Email Address" name="email" error={errors.email}>
          {input('email', { type: 'email', placeholder: 'jane@example.com' })}
        </Field>
        <Field label="Phone Number" name="phoneNumber" error={errors.phoneNumber}>
          {input('phoneNumber', { placeholder: '9876543210' })}
        </Field>
        <Field label="Department" name="department" error={errors.department}>
          <select id="department" name="department" value={values.department} onChange={change} required>
            <option value="">Select a department</option>
            {values.department && !departments.includes(values.department) && (
              <option value={values.department}>{values.department}</option>
            )}
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </Field>
        <Field label="Designation" name="designation" error={errors.designation}>
          {input('designation', { placeholder: 'Developer' })}
        </Field>
        <Field label="Date of Joining" name="dateOfJoining" error={errors.dateOfJoining}>
          {input('dateOfJoining', { type: 'date' })}
        </Field>
        <Field label="Salary" name="salary" error={errors.salary}>
          {input('salary', { type: 'number', min: '0', step: '0.01', placeholder: '50000' })}
        </Field>
        <Field label="Employment Status" name="status" error={errors.status}>
          <select id="status" name="status" value={values.status} onChange={change}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </Field>
      </div>
      <div className="form-actions">
        <Link to="/employees" className="btn">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
