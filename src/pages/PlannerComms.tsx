import { useState, useEffect } from 'react';
import { Phone, Mail, Video, FileCheck } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const MOCK_PLANNERS = [
  { id: '1', name: 'Luxe Events Co.', contact: 'Sarah Jenkins', time: '10:45 AM', message: 'Have you received the updated floral arrangement list for the Oct wedding?', active: true },
  { id: '2', name: 'Alpine Planning', contact: 'Marcus Thorne', time: 'Yesterday', message: 'We need to confirm the catering load-in times.', active: false },
  { id: '3', name: 'Sierra Designs', contact: 'Elena Cruz', time: 'Mon, 9:20 AM', message: 'Thanks for sending the new floorplans.', active: false },
  { id: '4', name: 'Vow & Canvas', contact: 'Jessica Rossi', time: 'Last Week', message: 'Perfect. We will book the Lakeside Pavilion.', active: false },
];

export default function PlannerComms() {
  const [activeChat, setActiveChat] = useState('1');
  const [planners, setPlanners] = useState<any[]>(MOCK_PLANNERS);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'planner_comms'), (snapshot) => {
      if (!snapshot.empty) setPlanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const activePlanner = planners.find(p => p.id === activeChat) || planners[0];

  return (
    <div className="grid-3" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Planner List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden' }}>
        <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Planner Network</h3>
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input type="text" className="form-control" placeholder="Search planners..." style={{ width: '100%' }} />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {planners.map(planner => (
            <div 
              key={planner.id}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: activeChat === planner.id ? 'var(--accent-color)' : 'transparent',
                color: activeChat === planner.id ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onClick={() => setActiveChat(planner.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{planner.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{planner.time || 'New'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontWeight: 600 }}>{planner.contact}:</span> {planner.message || 'Started a new thread.'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat / Comms Area */}
      <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="avatar" style={{ width: '48px', height: '48px', background: 'var(--accent-color)' }}>
              {activePlanner?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-sans)' }}>{activePlanner?.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activePlanner?.contact} • VIP Partner</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Video Call"><Video size={18} /></button>
            <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Phone Call"><Phone size={18} /></button>
            <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Email"><Mail size={18} /></button>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}><FileCheck size={18} /> New Request</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ alignSelf: 'center', fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'var(--text-secondary)' }}>
            Oct 12, 2026
          </div>

          <div style={{ display: 'flex', gap: '1rem', maxWidth: '80%' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', background: 'var(--accent-color)' }}>{activePlanner?.name?.charAt(0) || 'P'}</div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '0 12px 12px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{activePlanner?.message || "Hi Team, we're looking forward to our next event at MeadowArch."}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>10:45 AM</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', maxWidth: '80%', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', background: 'var(--accent-gold)' }}>A</div>
            <div style={{ background: 'var(--accent-color)', color: 'white', padding: '1rem', borderRadius: '12px 0 12px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Received! Let me know if you need any adjustments to the staging details before we move forward.</p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', display: 'block' }}>10:52 AM</span>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.4)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" className="form-control" placeholder={`Type a message to ${activePlanner?.name}...`} style={{ flex: 1, background: 'white' }} />
            <button className="btn btn-primary" style={{ padding: '0 1.5rem' }}>Send</button>
          </div>
        </div>

      </div>
    </div>
  );
}
