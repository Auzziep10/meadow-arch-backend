import { useState, useEffect } from 'react';
import { UserPlus, Filter, MapPin, CheckCircle, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const LOCATIONS = [
  'Meadow Arch (Main)',
  'Lakeside Pavilion',
  'Alpine Cabin',
  'Pine Retreat'
];

export default function TeamManagement() {
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [users, setUsers] = useState<any[]>([]);

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
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Invite via Link</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Direct them to the portal where they can request access using Google Sign In.</p>
          <button className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(window.location.origin + '/login'); alert('Invite link copied!'); }}>Copy Invite Link</button>
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
    </div>
  );
}
