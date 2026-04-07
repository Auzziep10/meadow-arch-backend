import { useState } from 'react';
import { Send, Code, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function IntakeForms() {
  const [activeTab, setActiveTab] = useState('bride-groom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIframeHtml, setShowIframeHtml] = useState(false);
  
  const isEmbed = window.location.pathname.includes('/embed');

  // Form States
  const [brideForm, setBrideForm] = useState({ name1: '', name2: '', email: '', phone: '', date: '', guests: '', details: '' });
  const [plannerForm, setPlannerForm] = useState({ plannerName: '', contactName: '', clientsNames: '', date: '', budget: '$10k - $25k', details: '' });
  const [venueForm, setVenueForm] = useState({ eventType: 'Corporate Retreat', orgName: '', contactName: '', date: '', duration: 'Half Day', details: '' });

  const submitInquiry = async (type: string, data: any, resetCb: () => void) => {
    if (!db) {
      alert("Firebase not configured! Check your .env setup. (Mock mode active)");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        type,
        ...data,
        createdAt: serverTimestamp(),
        status: 'Pending'
      });
      alert('Inquiry successfully submitted to Firestore!');
      resetCb();
    } catch (err) {
      console.error(err);
      alert('Error submitting inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isEmbed && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', maxWidth: '800px', margin: '0 auto 1rem auto' }}>
          <button className="btn btn-outline" onClick={() => setShowIframeHtml(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Code size={16} /> Get Embed Code
          </button>
        </div>
      )}
      
      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="tabs">
        <button 
          className={`tab ${activeTab === 'bride-groom' ? 'active' : ''}`}
          onClick={() => setActiveTab('bride-groom')}
        >
          Bride/Groom
        </button>
        <button 
          className={`tab ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Event Planner
        </button>
        <button 
          className={`tab ${activeTab === 'venue' ? 'active' : ''}`}
          onClick={() => setActiveTab('venue')}
        >
          Venue Partner
        </button>
      </div>

      <div style={{ padding: '1rem' }}>
        {activeTab === 'bride-groom' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            submitInquiry('bride-groom', brideForm, () => setBrideForm({ name1: '', name2: '', email: '', phone: '', date: '', guests: '', details: '' }));
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Couple Inquiry</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Bride / Groom 1 Name</label>
                <input type="text" required className="form-control" placeholder="Jane Doe" value={brideForm.name1} onChange={e => setBrideForm({...brideForm, name1: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Bride / Groom 2 Name</label>
                <input type="text" required className="form-control" placeholder="John Smith" value={brideForm.name2} onChange={e => setBrideForm({...brideForm, name2: e.target.value})} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required className="form-control" placeholder="jane@example.com" value={brideForm.email} onChange={e => setBrideForm({...brideForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" required className="form-control" placeholder="(555) 123-4567" value={brideForm.phone} onChange={e => setBrideForm({...brideForm, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Preferred Date</label>
                <input type="date" required className="form-control" value={brideForm.date} onChange={e => setBrideForm({...brideForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Expected Guest Count</label>
                <input type="number" required className="form-control" placeholder="150" value={brideForm.guests} onChange={e => setBrideForm({...brideForm, guests: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Additional Details or Vision</label>
              <textarea className="form-control" rows={4} placeholder="Tell us about the dream wedding..." value={brideForm.details} onChange={e => setBrideForm({...brideForm, details: e.target.value})} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
              <Send size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        )}

        {activeTab === 'planner' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            submitInquiry('planner', plannerForm, () => setPlannerForm({ plannerName: '', contactName: '', clientsNames: '', date: '', budget: '$10k - $25k', details: '' }));
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Event Planner Intake</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Planner / Agency Name</label>
                <input type="text" required className="form-control" placeholder="Luxe Events" value={plannerForm.plannerName} onChange={e => setPlannerForm({...plannerForm, plannerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input type="text" required className="form-control" placeholder="Sarah Jenkins" value={plannerForm.contactName} onChange={e => setPlannerForm({...plannerForm, contactName: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Client's Names</label>
              <input type="text" required className="form-control" placeholder="Jane & John" value={plannerForm.clientsNames} onChange={e => setPlannerForm({...plannerForm, clientsNames: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Requested Date</label>
                <input type="date" required className="form-control" value={plannerForm.date} onChange={e => setPlannerForm({...plannerForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Budget Range</label>
                <select className="form-control" value={plannerForm.budget} onChange={e => setPlannerForm({...plannerForm, budget: e.target.value})}>
                  <option>$10k - $25k</option>
                  <option>$25k - $50k</option>
                  <option>$50k+</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Message / Special Requirements</label>
              <textarea className="form-control" rows={4} placeholder="Catering preferences, staging setup..." value={plannerForm.details} onChange={e => setPlannerForm({...plannerForm, details: e.target.value})} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
              <Send size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}

        {activeTab === 'venue' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            submitInquiry('venue', venueForm, () => setVenueForm({ eventType: 'Corporate Retreat', orgName: '', contactName: '', date: '', duration: 'Half Day', details: '' }));
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Venue Request</h2>
            <div className="form-group">
              <label>Event Type</label>
              <select className="form-control" value={venueForm.eventType} onChange={e => setVenueForm({...venueForm, eventType: e.target.value})}>
                <option>Corporate Retreat</option>
                <option>Photoshoot / Film</option>
                <option>Workshop / Seminar</option>
                <option>Other</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Organization Name</label>
                <input type="text" required className="form-control" placeholder="TechCorp" value={venueForm.orgName} onChange={e => setVenueForm({...venueForm, orgName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input type="text" required className="form-control" placeholder="Alex Winters" value={venueForm.contactName} onChange={e => setVenueForm({...venueForm, contactName: e.target.value})} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Date Required</label>
                <input type="date" required className="form-control" value={venueForm.date} onChange={e => setVenueForm({...venueForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select className="form-control" value={venueForm.duration} onChange={e => setVenueForm({...venueForm, duration: e.target.value})}>
                  <option>Half Day</option>
                  <option>Full Day</option>
                  <option>Multi-Day</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Event Details</label>
              <textarea className="form-control" rows={4} placeholder="Describe the intended use of the venue..." value={venueForm.details} onChange={e => setVenueForm({...venueForm, details: e.target.value})} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
              <Send size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Venue Request'}
            </button>
          </form>
        )}
      </div></div>

      {/* Embed Code Modal */}
      {showIframeHtml && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>HTML Embed Snippet</h3>
              <button 
                onClick={() => setShowIframeHtml(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Copy and paste this HTML snippet into any external webpage to embed exactly these forms. The forms will continue to send data directly to this database.</p>
            <div style={{ background: '#f4f5f1', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', userSelect: 'all' }}>
              {`<iframe \n  src="${window.location.origin}/embed/intake-forms" \n  width="100%" \n  height="700" \n  style="border: none;" \n  title="Meadow Arch Intake Forms"\n></iframe>`}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => {
                navigator.clipboard.writeText(`<iframe src="${window.location.origin}/embed/intake-forms" width="100%" height="700" style="border: none;" title="Meadow Arch Intake Forms"></iframe>`);
                alert('Copied to clipboard!');
              }}>Copy to Clipboard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
