import { useState, useEffect } from 'react';
import { Download, Plus, Search, MoreVertical } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const MOCK_BOOKINGS = [
  { id: '1', client: 'Emily & Carter', date: 'Oct 20, 2026', type: 'Wedding', location: 'Meadow Arch', status: 'Confirmed' },
  { id: '2', client: 'Peak Corporate', date: 'Nov 12, 2026', type: 'Retreat', location: 'Meadow Arch', status: 'Holding' }
];

const MOCK_INVOICES = [
  { id: '1', number: 'INV-00124', client: 'Emily & Carter', amount: '$12,500.00', date: 'Oct 01, 2026', status: 'Paid' },
  { id: '2', number: 'INV-00125', client: 'Peak Corporate', amount: '$8,000.00', date: 'Oct 15, 2026', status: 'Unpaid' }
];

export default function BookingsInvoicing() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<any[]>(MOCK_BOOKINGS);
  const [invoices, setInvoices] = useState<any[]>(MOCK_INVOICES);

  useEffect(() => {
    if (!db) return; // Silent fallback
    
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (!snapshot.empty) setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      if (!snapshot.empty) setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubBookings();
      unsubInvoices();
    };
  }, []);

  const handleCreate = async () => {
    if (!db) {
       alert("Firebase is not connected in .env settings.");
       return;
    }
    
    if (activeTab === 'bookings') {
      const client = prompt("Client Name:");
      if (!client) return;
      await addDoc(collection(db, 'bookings'), {
        client, date: 'TBD', type: 'Wedding', location: 'Meadow Arch (Main)', status: 'Holding', createdAt: serverTimestamp()
      });
    } else {
      const client = prompt("Client Name for Invoice:");
      if (!client) return;
      await addDoc(collection(db, 'invoices'), {
        number: `INV-${Math.floor(Math.random() * 10000)}`, client, amount: '$0.00', date: new Date().toLocaleDateString(), status: 'Unpaid', createdAt: serverTimestamp()
      });
    }
  };

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button 
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            style={{ padding: '0.5rem 1rem' }}
          >
            All Bookings
          </button>
          <button 
            className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
            style={{ padding: '0.5rem 1rem' }}
          >
            Invoices
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" className="form-control" placeholder={`Search ${activeTab}...`} style={{ paddingLeft: '2.5rem', width: '250px' }} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={18} /> {activeTab === 'bookings' ? 'New Booking' : 'Create Invoice'}
          </button>
        </div>
      </div>

      <div className="glass-card">
        {activeTab === 'bookings' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Event Date</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(row => (
                <tr key={row.id}>
                  <td>{row.client}</td>
                  <td>{row.date}</td>
                  <td>{row.type}</td>
                  <td>{row.location}</td>
                  <td><span className={`badge ${row.status === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'}`}>{row.status}</span></td>
                  <td><button className="btn btn-outline" style={{ padding: '0.5rem' }}><MoreVertical size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'invoices' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client Name</th>
                <th>Amount</th>
                <th>Date Issued</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(row => (
                <tr key={row.id}>
                  <td>{row.number}</td>
                  <td>{row.client}</td>
                  <td>{row.amount}</td>
                  <td>{row.date}</td>
                  <td><span className={`badge ${row.status === 'Paid' ? 'badge-confirmed' : 'badge-pending'}`}>{row.status}</span></td>
                  <td>
                      <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
                          <Download size={16} />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
