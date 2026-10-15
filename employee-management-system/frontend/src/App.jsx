import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import EmployeeList from './pages/EmployeeList.jsx';
import AddEmployee from './pages/AddEmployee.jsx';
import EditEmployee from './pages/EditEmployee.jsx';
import EmployeeDetails from './pages/EmployeeDetails.jsx';
import DepartmentManagement from './pages/DepartmentManagement.jsx';
import Login from './pages/Login.jsx';

function ProtectedLayout() {
  return sessionStorage.getItem('emsCredentials')
    ? <Layout><Outlet /></Layout>
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/employees/:id/edit" element={<EditEmployee />} />
        <Route path="/departments" element={<DepartmentManagement />} />
        <Route path="*" element={<p className="empty">Page not found.</p>} />
      </Route>
    </Routes>
  );
}
