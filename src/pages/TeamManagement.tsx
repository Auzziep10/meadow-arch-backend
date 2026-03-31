import { useState, useEffect } from 'react';
import { UserPlus, Filter, MapPin } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

const LOCATIONS = [
  'Meadow Arch (Main)',
  'Lakeside Pavilion',
  'Alpine Cabin',
  'Pine Retreat'
];

const MOCK_TEAM = [
  { id: '1', name: 'Sarah Jenkins', role: 'Event Coordinator', location: 'Meadow Arch (Main)', email: 'sarah@meadowarch.com' },
  { id: '2', name: 'Michael Chen', role: 'Operations Manager', location: 'Lakeside Pavilion', email: 'michael@meadowarch.com' },
  { id: '3', name: 'Jessica Rossi', role: 'Catering Lead', location: 'Alpine Cabin', email: 'jessica@meadowarch.com' },
  { id: '4', name: 'David Smith', role: 'Facilities', location: 'Pine Retreat', email: 'david@meadowarch.com' },
  { id: '5', name: 'Amanda Lee', role: 'Assistant Coordinator', location: 'Meadow Arch (Main)', email: 'amanda@meadowarch.com' },
];

export default function TeamManagement() {
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [team, setTeam] = useState<any[]>(MOCK_TEAM);

  useEffect(() => {
    if (!db) return; // Silent fallback to mock
    const unsubscribe = onSnapshot(collection(db, 'team'), (snapshot) => {
      if (snapshot.empty && team === MOCK_TEAM) return; // keep mock if DB is totally empty
      const updatedTeam = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (updatedTeam.length > 0) setTeam(updatedTeam);
    });
    return () => unsubscribe();
  }, []);

  const handleAddMember = async () => {
    if (!db) {
      alert("Firebase not configured! Check env setup to use live Database.");
      return;
    }
    const name = prompt("Enter Colleague Name:");
    if (!name) return;
    const role = prompt("Enter Job Role:");
    const location = prompt("Enter Location (e.g. 'Lakeside Pavilion'):");
    const email = prompt("Enter Email address:");

    try {
      await addDoc(collection(db, 'team'), {
        name,
        role: role || 'Staff',
        location: location || 'Meadow Arch (Main)',
        email: email || ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add team member to Firestore');
    }
  };

  const filteredTeam = selectedLocation === 'All' 
    ? team 
    : team.filter(member => member.location === selectedLocation);

  return (
    <div>
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
                  {team.filter(m => m.location === loc).length} Staff Members
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <UserPlus size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Onboard New Staff</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Add a new team member and assign them to one of our 4 locations.</p>
          <button className="btn btn-primary" onClick={handleAddMember}>Add Team Member</button>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>
            {selectedLocation === 'All' ? 'All Team Members' : `Team at ${selectedLocation}`}
          </h3>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <Filter size={16} /> Filter
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Location</th>
              <th>Email Address</th>
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
                    <span style={{ fontWeight: 500 }}>{member.name}</span>
                  </div>
                </td>
                <td>{member.role}</td>
                <td><span className="badge" style={{ background: 'rgba(59, 92, 70, 0.1)', color: 'var(--accent-color)' }}>{member.location}</span></td>
                <td>{member.email}</td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                </td>
              </tr>
            ))}
            {filteredTeam.length === 0 && (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No staff at this location.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
