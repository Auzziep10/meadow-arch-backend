
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarDays, 
  Users, 
  MessageSquare,
  Sparkles,
  LogOut,
  Bell
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Hook into our auth context

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard Overview';
      case '/intake-forms': return 'Intake Forms';
      case '/bookings': return 'Booking & Invoicing';
      case '/team': return 'Team Management';
      case '/planner-comms': return 'Planner Communications';
      default: return 'MeadowArch';
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (err) {
        console.error("Error signing out:", err);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-section">
          <Sparkles color="var(--accent-gold)" size={24} />
          <span className="brand-title">MeadowArch</span>
        </div>

        <div className="nav-section-title">Main Menu</div>
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/intake-forms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ClipboardList />
            <span>Intake Forms</span>
          </NavLink>
          
          <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays />
            <span>Bookings & Invoices</span>
          </NavLink>
          
          <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users />
            <span>Team & Locations</span>
          </NavLink>
          
          <NavLink to="/planner-comms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare />
            <span>Event Planners</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
            <LogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
          
          <div className="user-profile">
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Bell size={20} />
            </button>
            <div className="avatar">{(currentUser?.email || 'A').charAt(0).toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser?.email || 'Admin User'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Manager</span>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
