import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee, getDepartments, parseError } from '../services/employeeService.js';
import Alert from '../components/Alert.jsx';
import EmployeeForm from '../components/EmployeeForm.jsx';
import { Link } from 'react-router-dom';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [departmentError, setDepartmentError] = useState('');

  useEffect(() => {
    getDepartments().then(setDepartments).catch((e) => setDepartmentError(parseError(e).message));
  }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const created = await createEmployee(payload);
      navigate('/employees', { state: { message: `Employee "${created.fullName}" added successfully.` } });
    } catch (e) {
      const parsed = parseError(e);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-title"><h2>Add Employee</h2></div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="error">{departmentError}</Alert>
      {departments.length === 0 && <p className="muted">Add a department before creating an employee. <Link to="/departments">Manage departments</Link></p>}
      <EmployeeForm
        departments={departments}
        serverErrors={fieldErrors}
        submitting={submitting}
        submitLabel="Add Employee"
        onSubmit={handleSubmit}
      />
    </>
  );
}
