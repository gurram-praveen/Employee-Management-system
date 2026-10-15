import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  deleteEmployee,
  getDepartments,
  getEmployees,
  getSummary,
  exportEmployees,
  parseError,
} from '../services/employeeService.js';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const PAGE_SIZE = 25;
const PAGE_SIZES = [10, 25, 50];

const formatSalary = (n) =>
  Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function EmployeeList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });
  const [departments, setDepartments] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Clear the one-time flash message from router history so it doesn't reappear on refresh.
  useEffect(() => {
    if (location.state?.message) navigate(location.pathname, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadSideData = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([getSummary(), getDepartments()]);
      setSummary(s);
      setDepartments(d);
    } catch (e) {
      setError(parseError(e).message);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getEmployees({
        page,
        size: pageSize,
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
        sortBy,
        direction: sortDirection,
      });
      setData(result);
    } catch (e) {
      setError(parseError(e).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department, status, sortBy, sortDirection]);

  useEffect(() => { loadSideData(); }, [loadSideData]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(toDelete.id);
      setSuccess(`Employee "${toDelete.fullName}" deleted successfully.`);
      setToDelete(null);
      // Step back a page if we just removed the last row on this page.
      if (data.content.length === 1 && page > 0) setPage(page - 1);
      else loadEmployees();
      loadSideData();
    } catch (e) {
      setError(parseError(e).message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setDepartment('');
    setStatus('');
    setPage(0);
  };

  const downloadCsv = async () => {
    setError('');
    setExporting(true);
    try {
      const csv = await exportEmployees({
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
      });
      const url = URL.createObjectURL(csv);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'employees.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(parseError(e).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <div className="eyebrow">PEOPLE DIRECTORY</div>
          <h2>Employees</h2>
          <p>Manage your people, roles, and employment information.</p>
        </div>
        <span className="directory-total">
          <span className="online-dot" /> {summary.total} team members
        </span>
      </div>

      <div className="cards">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" /></svg>
          </div>
          <span>Total employees</span><strong>{summary.total}</strong><small>Across all departments</small>
        </div>
        <button
          type="button"
          className={`stat-card stat-active stat-card-action ${status === 'ACTIVE' ? 'stat-card-selected' : ''}`}
          onClick={() => { setStatus((current) => current === 'ACTIVE' ? '' : 'ACTIVE'); setPage(0); }}
          aria-label="Filter by active employees"
          aria-pressed={status === 'ACTIVE'}
        >
          <div className="stat-icon stat-icon-green">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <span>Active employees</span><strong>{summary.active}</strong><small>Currently working</small>
        </button>
        <button
          type="button"
          className={`stat-card stat-inactive stat-card-action ${status === 'INACTIVE' ? 'stat-card-selected' : ''}`}
          onClick={() => { setStatus((current) => current === 'INACTIVE' ? '' : 'INACTIVE'); setPage(0); }}
          aria-label="Filter by inactive employees"
          aria-pressed={status === 'INACTIVE'}
        >
          <div className="stat-icon stat-icon-gray">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></svg>
          </div>
          <span>Inactive employees</span><strong>{summary.inactive}</strong><small>Not currently active</small>
        </button>
      </div>

      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      <section className="card directory-card" aria-label="Employee directory">
        <div className="list-toolbar">
          <div className="directory-heading">
            <h3>Employee directory</h3>
            <span>{data.totalElements} records</span>
          </div>
          <button className="btn export-btn" onClick={downloadCsv} disabled={exporting}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 17v4h14v-4" /></svg>
            {exporting ? 'Preparing…' : 'Export CSV'}
          </button>
        </div>
        <div className="filters">
          <label className="search-box">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
            <input
              type="search"
              aria-label="Search employees"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </label>
          <select aria-label="Filter by department" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0); }}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {(searchInput || department || status) && (
            <button className="btn clear-btn" onClick={clearFilters}>Clear filters</button>
          )}
          <div className="sort-control">
            <label htmlFor="employee-sort">Sort:</label>
            <select id="employee-sort" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }}>
              <option value="id">Recently added</option>
              <option value="fullName">Name</option>
              <option value="department">Department</option>
              <option value="dateOfJoining">Date joined</option>
            </select>
            <button
              className="sort-direction"
              onClick={() => setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')}
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading employees..." />
        ) : data.content.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4M8 11h6" /></svg>
            </div>
            <h3>No employees found</h3>
            <p>Try adjusting your search or filters to find the person you are looking for.</p>
            <button className="btn" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table aria-label="Employee records">
              <colgroup>
                <col className="employee-column" />
                <col className="department-column" />
                <col className="designation-column" />
                <col className="date-column" />
                <col className="salary-column" />
                <col className="status-column" />
                <col className="actions-column" />
              </colgroup>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Date joined</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((emp) => (
                  <tr key={emp.id}>
                    <td data-label="Employee">
                      <Link className="employee-cell" to={`/employees/${emp.id}`}>
                        <span className="employee-avatar">{initials(emp.fullName)}</span>
                        <span className="employee-copy">
                          <strong>{emp.fullName}</strong>
                          <span>{emp.email}</span>
                          <small>{emp.employeeId}</small>
                        </span>
                      </Link>
                    </td>
                    <td data-label="Department">{emp.department}</td>
                    <td data-label="Designation">{emp.designation}</td>
                    <td data-label="Date joined">{formatDate(emp.dateOfJoining)}</td>
                    <td data-label="Salary" className="salary-cell">{formatSalary(emp.salary)}</td>
                    <td data-label="Status"><StatusBadge status={emp.status} /></td>
                    <td data-label="Actions" className="actions">
                      <Link className="btn btn-sm row-action" to={`/employees/${emp.id}`} aria-label={`View ${emp.fullName}`}>View</Link>
                      <Link className="btn btn-sm row-action" to={`/employees/${emp.id}/edit`} aria-label={`Edit ${emp.fullName}`}>Edit</Link>
                      <button className="btn btn-sm icon-action" onClick={() => setToDelete(emp)} aria-label={`Delete ${emp.fullName}`} title="Delete employee">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          pageSizes={PAGE_SIZES}
        />
      </section>

      {toDelete && (
        <ConfirmDialog
          title="Delete employee?"
          message={`Are you sure you want to delete ${toDelete.fullName} (${toDelete.employeeId})? This cannot be undone.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
