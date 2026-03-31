import { useEffect, useState } from 'react';
import { Users, CalendarCheck, FileText, Banknote } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const MOCK_INQUIRIES = [
  { id: '1', name: 'Sarah & John', type: 'Bride/Groom', dateStr: 'Oct 12, 2026', status: 'PENDING' },
  { id: '2', name: 'Luxe Weddings Co.', type: 'Event Planner', dateStr: 'Nov 05, 2026', status: 'CONFIRMED' },
  { id: '3', name: 'Pine Lodge', type: 'Venue Inquiry', dateStr: 'Dec 18, 2026', status: 'PENDING' }
];

export default function Dashboard() {
  const [inquiries, setInquiries] = useState<any[]>(MOCK_INQUIRIES);

  useEffect(() => {
    if (!db) return; // Silent fallback to mock data if no Firebase config

    const fetchInquiries = async () => {
      try {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedData = snapshot.docs.map(doc => {
            const d = doc.data();
            let name = 'Unknown';
            if (d.type === 'bride-groom') name = `${d.name1} & ${d.name2}`;
            else if (d.type === 'planner') name = d.plannerName;
            else if (d.type === 'venue') name = d.orgName;

            let dateStr = 'Recent';
            if (d.createdAt && d.createdAt.toDate) {
              dateStr = d.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

            let typeDisplay = 'Venue Inquiry';
            if (d.type === 'bride-groom') typeDisplay = 'Bride/Groom';
            else if (d.type === 'planner') typeDisplay = 'Event Planner';

            return {
              id: doc.id,
              name,
              type: typeDisplay,
              dateStr,
              status: (d.status || 'PENDING').toUpperCase()
            };
          });
          setInquiries(fetchedData);
        }
      } catch (err) {
        console.error("Error fetching Dashboard data from Firestore:", err);
      }
    };
    fetchInquiries();
  }, []);

  return (
    <div>
      <div className="grid-3">
        <div className="glass-card stat-card">
          <div className="stat-icon">
            <CalendarCheck />
          </div>
          <div className="stat-content">
            <h4>Upcoming Events</h4>
            <div className="value">12</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 92, 70, 0.15)', color: 'var(--accent-color)' }}>
            <FileText />
          </div>
          <div className="stat-content">
            <h4>Pending Forms</h4>
            <div className="value">{inquiries.filter(i => i.status === 'PENDING').length || 5}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(82, 122, 94, 0.15)', color: 'var(--accent-light)' }}>
            <Banknote />
          </div>
          <div className="stat-content">
            <h4>Recent Invoices</h4>
            <div className="value">3 Paid</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Recent Inquiries</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inquiry => (
                <tr key={inquiry.id}>
                  <td>{inquiry.name}</td>
                  <td>{inquiry.type}</td>
                  <td>{inquiry.dateStr}</td>
                  <td>
                    <span className={`badge ${inquiry.status === 'CONFIRMED' ? 'badge-confirmed' : 'badge-pending'}`}>
                      {inquiry.status}
                    </span>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', opacity: 0.5 }}>No inquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                   <FileText size={18} /> View New Client Forms
                </button>
                <button className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%' }}>
                   <Banknote size={18} /> Generate New Invoice
                </button>
                <button className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%' }}>
                   <Users size={18} /> Manage Team Schedules
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
