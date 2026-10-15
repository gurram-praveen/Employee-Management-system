import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteEmployee, getEmployee, parseError } from '../services/employeeService.js';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getEmployee(id)
      .then(setEmployee)
      .catch((e) => setError(parseError(e).message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(id);
      navigate('/employees', { state: { message: `Employee "${employee.fullName}" deleted successfully.` } });
    } catch (e) {
      setError(parseError(e).message);
      setConfirming(false);
      setDeleting(false);
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

  const rows = [
    ['Employee ID', employee.employeeId],
    ['Full Name', employee.fullName],
    ['Email', employee.email],
    ['Phone Number', employee.phoneNumber],
    ['Department', employee.department],
    ['Designation', employee.designation],
    ['Date of Joining', new Date(employee.dateOfJoining).toLocaleDateString('en-IN', { dateStyle: 'long' })],
    ['Salary', Number(employee.salary).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })],
    ['Status', <StatusBadge key="s" status={employee.status} />],
  ];

  return (
    <>
      <div className="page-title"><h2>Employee Details</h2></div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <div className="card">
        <dl className="details">
          {rows.map(([label, value]) => (
            <div key={label} className="detail-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="form-actions">
          <Link to="/employees" className="btn">Back</Link>
          <Link to={`/employees/${employee.id}/edit`} className="btn btn-primary">Edit</Link>
          <button className="btn btn-danger" onClick={() => setConfirming(true)}>Delete</button>
        </div>
      </div>
      {confirming && (
        <ConfirmDialog
          title="Delete employee?"
          message={`Are you sure you want to delete ${employee.fullName} (${employee.employeeId})? This cannot be undone.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
