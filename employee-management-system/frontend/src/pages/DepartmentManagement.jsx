import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import { createDepartment, deleteDepartment, listDepartments, parseError, updateDepartment } from '../services/employeeService.js';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setDepartments(await listDepartments());
    } catch (cause) {
      setError(parseError(cause).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      if (editingId === null) await createDepartment(name.trim());
      else await updateDepartment(editingId, name.trim());
      setName('');
      setEditingId(null);
      setSuccess(`Department ${editingId === null ? 'created' : 'updated'} successfully.`);
      await refresh();
    } catch (cause) {
      setError(parseError(cause).message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (department) => {
    setName(department.name);
    setEditingId(department.id);
    setError('');
    setSuccess('');
  };

  const remove = async (department) => {
    if (!window.confirm(`Delete the ${department.name} department?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteDepartment(department.id);
      setSuccess(`${department.name} department deleted.`);
      await refresh();
    } catch (cause) {
      setError(parseError(cause).message);
    }
  };

  return (
    <>
      <div className="page-title"><h2>Department Management</h2></div>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form className="card department-form" onSubmit={submit}>
        <label className="field" htmlFor="department-name">
          <span>{editingId === null ? 'New department' : 'Department name'}</span>
          <input id="department-name" value={name} maxLength={80}
            onChange={(event) => setName(event.target.value)} required />
        </label>
        <div className="department-form-actions">
          {editingId !== null && <button type="button" className="btn"
            onClick={() => { setEditingId(null); setName(''); }}>Cancel edit</button>}
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId === null ? 'Add department' : 'Save changes'}
          </button>
        </div>
      </form>
      <div className="card department-list">
        <h3>Departments</h3>
        {loading ? <p className="muted">Loading departments...</p> : departments.length === 0 ? (
          <p className="empty">No departments yet. Add one above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Department</th><th>Employees</th><th>Actions</th></tr></thead>
              <tbody>{departments.map((department) => (
                <tr key={department.id}>
                  <td data-label="Department">{department.name}</td>
                  <td data-label="Employees">{department.employeeCount}</td>
                  <td data-label="Actions" className="actions">
                    <button className="btn btn-sm" onClick={() => edit(department)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(department)}
                      disabled={department.employeeCount > 0} title={department.employeeCount > 0
                        ? 'Reassign employees before deleting this department' : undefined}>Delete</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
