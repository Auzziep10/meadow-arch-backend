import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Sparkles, Lock } from 'lucide-react';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase not configured properly.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Wait for auth state listener to redirect automatically
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) {
      setError("Firebase not configured properly.");
      return;
    }
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if user document exists
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      // If new, create pending document
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName,
          status: 'pending',
          role: 'Staff',
          location: 'Meadow Arch (Main)',
          createdAt: serverTimestamp()
        });
      }
      // Wait for auth state listener to redirect automatically
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    } 
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Sparkles color="var(--accent-gold)" size={32} />
          <span className="brand-title" style={{ fontSize: '2.25rem' }}>MeadowArch</span>
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-sans)', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
          <Lock size={18} /> Admin Portal
        </h2>
        
        {error && <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,0,0,0.1)', color: 'red', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border)', 
            background: 'white', 
            color: 'var(--text-primary)', 
            fontWeight: 500, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            cursor: 'pointer', 
            marginBottom: '1.5rem',
            transition: 'var(--transition)'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>

        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>
        
        <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
          <div className="form-group">
            <label>Email Workspace Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="manager@meadowarch.com"
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Secure Password</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
