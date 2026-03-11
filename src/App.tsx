import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import IntakeForms from './pages/IntakeForms';
import BookingsInvoicing from './pages/BookingsInvoicing';
import TeamManagement from './pages/TeamManagement';
import PlannerComms from './pages/PlannerComms';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="intake-forms" element={<IntakeForms />} />
          <Route path="bookings" element={<BookingsInvoicing />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="planner-comms" element={<PlannerComms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
