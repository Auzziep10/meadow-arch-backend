import { useState, useEffect } from 'react';
import { UserPlus, Filter, MapPin, CheckCircle, Clock, X } from 'lucide-react';
import { db, firebaseConfig } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const LOCATIONS = [
  'Meadow Arch (Main)',
  'Lakeside Pavilion',
  'Alpine Cabin',
  'Pine Retreat'
];

export default function TeamManagement() {
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [users, setUsers] = useState<any[]>([]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Staff');
  const [newLocation, setNewLocation] = useState(LOCATIONS[0]);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!db || !confirm('Approve this staff member to access the workspace?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'active' });
    } catch (err) {
      console.error(err);
      alert('Failed to approve user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !firebaseConfig.apiKey) {
      alert("Firebase not configured properly.");
      return;
    }
    
    try {
      setCreatingUser(true);
      
      // Use a secondary app instance to safely create a user without destroying the current admin session
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      
      // Register in Firestore securely
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newEmail,
        name: newName,
        role: newRole,
        location: newLocation,
        status: 'active',
        createdAt: serverTimestamp()
      });
      
      await secondaryAuth.signOut();
      
      setCreatingUser(false);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('Staff');
      setNewLocation(LOCATIONS[0]);
      
      alert('Staff member created successfully and has been activated.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to create account: ' + err.message);
      setCreatingUser(false);
    }
  };

  const activeStaff = users.filter(u => u.status !== 'pending');
  const pendingStaff = users.filter(u => u.status === 'pending');

  const filteredTeam = selectedLocation === 'All' 
    ? activeStaff 
    : activeStaff.filter(member => member.location === selectedLocation);

  return (
    <div>
      {/* Pending Approvals Section */}
      {pendingStaff.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem', borderColor: 'var(--accent-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Clock color="var(--accent-gold)" />
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', color: 'var(--accent-gold)' }}>Pending Approvals ({pendingStaff.length})</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name / Email</th>
                <th>Requested Role</th>
                <th>Requested Location</th>
                <th>Requested At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingStaff.map(member => (
                <tr key={member.id} style={{ background: 'rgba(212, 175, 55, 0.05)' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'var(--accent-gold)', color: 'white' }}>
                        {(member.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 500, display: 'block' }}>{member.name || 'Unknown'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{member.role || 'Staff'}</td>
                  <td>{member.location || 'Meadow Arch (Main)'}</td>
                  <td>{member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString() : 'Just now'}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleApprove(member.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <CheckCircle size={14} /> Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Location Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {LOCATIONS.map(loc => (
              <div 
                key={loc} 
                className={`glass-card ${selectedLocation === loc ? 'active' : ''}`}
                style={{ 
                  padding: '1rem', 
                  cursor: 'pointer',
                  border: selectedLocation === loc ? '1px solid var(--accent-color)' : '',
                  background: selectedLocation === loc ? 'rgba(59, 92, 70, 0.05)' : ''
                }}
                onClick={() => setSelectedLocation(selectedLocation === loc ? 'All' : loc)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} color="var(--accent-color)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{loc}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeStaff.filter(m => m.location === loc).length} Staff Members
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <UserPlus size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Add Team Member</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Provision a new member account with an email and password or share the invite link.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Create Account</button>
            <button className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(window.location.origin + '/login'); alert('Invite link copied!'); }}>Copy Link</button>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>
            {selectedLocation === 'All' ? 'All Active Team Members' : `Active Team at ${selectedLocation}`}
          </h3>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <Filter size={16} /> Filter
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name / Email</th>
              <th>Role</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.map(member => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'var(--accent-light)' }}>
                      {(member.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500, display: 'block' }}>{member.name || 'Unknown'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.email}</span>
                    </div>
                  </div>
                </td>
                <td>{member.role || 'Staff'}</td>
                <td><span className="badge" style={{ background: 'rgba(59, 92, 70, 0.1)', color: 'var(--accent-color)' }}>{member.location || 'Unassigned'}</span></td>
                <td><span className="badge" style={{ background: 'rgba(59, 92, 70, 0.1)', color: 'var(--accent-color)' }}>Active</span></td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                </td>
              </tr>
            ))}
            {filteredTeam.length === 0 && (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No staff found for this location.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Create Account</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="jane@meadowarch.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Minimum 6 characters" minLength={6} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-control" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location Assignment</label>
                  <select className="form-control" value={newLocation} onChange={e => setNewLocation(e.target.value)}>
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={creatingUser}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingUser}>
                  {creatingUser ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
