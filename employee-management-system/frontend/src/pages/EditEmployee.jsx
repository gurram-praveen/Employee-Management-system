import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDepartments, getEmployee, parseError, updateEmployee } from '../services/employeeService.js';
import Alert from '../components/Alert.jsx';
import EmployeeForm from '../components/EmployeeForm.jsx';
import Spinner from '../components/Spinner.jsx';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getEmployee(id)
      .then(setEmployee)
      .catch((e) => setError(parseError(e).message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getDepartments().then(setDepartments).catch((e) => setError(parseError(e).message));
  }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const updated = await updateEmployee(id, payload);
      navigate('/employees', { state: { message: `Employee "${updated.fullName}" updated successfully.` } });
    } catch (e) {
      const parsed = parseError(e);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading employee..." />;

  if (!employee) {
    return (
      <>
        <Alert type="error">{error || 'Employee not found.'}</Alert>
        <Link to="/employees" className="btn">Back to list</Link>
      </>
    );
  }

  return (
    <>
      <div className="page-title"><h2>Edit Employee</h2></div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <EmployeeForm
        departments={departments}
        initial={{ ...employee, salary: String(employee.salary) }}
        serverErrors={fieldErrors}
        submitting={submitting}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </>
  );
}
