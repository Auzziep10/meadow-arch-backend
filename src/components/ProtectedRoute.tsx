import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: 'var(--bg-color)', color: 'var(--accent-color)' }}>Loading...</div>;
  }

  // If there's no active user session, boot them to the login screen
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
