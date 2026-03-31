import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import { auth } from '../firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: 'var(--bg-color)', color: 'var(--accent-color)' }}>Loading...</div>;
  }

  // If there's no active user session, boot them to the login screen
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If they are signed in but their status is explicitly 'pending'
  // (We use userData?.status to support older manually created users that might not have a doc)
  if (userData?.status === 'pending') {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', minHeight: '100vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 92, 70, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={32} color="var(--accent-color)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-sans)', marginBottom: '1rem', fontSize: '1.5rem' }}>Access Request Pending</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Your account ({currentUser.email}) has been successfully created and is waiting for administrator approval. 
            <br /><br />
            Once an admin enables your workspace access, this page will automatically unlock and redirect you to the dashboard.
          </p>
          <button className="btn btn-outline" onClick={() => auth?.signOut()} style={{ width: '100%' }}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
