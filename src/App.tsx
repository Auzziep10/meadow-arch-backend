
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import IntakeForms from './pages/IntakeForms';
import BookingsInvoicing from './pages/BookingsInvoicing';
import TeamManagement from './pages/TeamManagement';
import PlannerComms from './pages/PlannerComms';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="intake-forms" element={<IntakeForms />} />
            <Route path="bookings" element={<BookingsInvoicing />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="planner-comms" element={<PlannerComms />} />
          </Route>

          {/* Catch all bad URLs and send them home to be authenticated */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
