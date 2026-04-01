import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contractor bid modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');

  // User checking bids state
  const [bids, setBids] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const url = user.role === 'contractor' ? `${API_URL}/projects` : `${API_URL}/projects/myprojects`;
      const { data } = await axios.get(url, config);
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
    setLoading(false);
  };

  const submitBid = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/projects/${selectedProject}/bids`, { amount: bidAmount, proposal: bidProposal }, config);
      alert('Bid submitted successfully!');
      setSelectedProject(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit bid');
    }
  };

  const viewBids = async (projectId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const { data } = await axios.get(`${API_URL}/projects/${projectId}/bids`, config);
      setBids(data);
      setSelectedProject(projectId);
    } catch (error) {
      console.error('Failed to load bids');
    }
  };

  const acceptBid = async (bidId, projectId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.put(`${API_URL}/projects/${projectId}/bids/${bidId}/accept`, {}, config);
      alert('Bid accepted! The contractor has been notified.');
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      alert('Failed to accept bid');
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{user.role === 'contractor' ? 'Open Opportunities' : 'My Projects'}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {projects.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p> : null}
        
        {projects.map(project => (
          <div key={project._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{project.title}</h3>
              <span className={`badge badge-${project.status}`}>{project.status.toUpperCase()}</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0', flex: 1 }}>{project.description}</p>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              <strong>Location:</strong> {project.location} <br/>
              <strong>Est Budget:</strong> ₹{project.estimatedBudget}
            </div>

            {user.role === 'contractor' && project.status === 'open' && (
              <button className="btn btn-primary" onClick={() => setSelectedProject(project._id)}>Submit Bid</button>
            )}

            {user.role === 'user' && project.status === 'open' && (
              <button className="btn btn-secondary" onClick={() => viewBids(project._id)}>View Bids</button>
            )}

            {project.status === 'accepted' && project.acceptedBid && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                <strong>Winning Bid:</strong> ₹{project.acceptedBid?.amount || 'Hidden'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contractor Submit Bid Modal */}
      {selectedProject && user.role === 'contractor' && (
        <div className="glass-panel" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '400px' }}>
          <h3>Submit your bid</h3>
          <form onSubmit={submitBid} style={{ marginTop: '1rem' }}>
            <input type="number" placeholder="Your Price Estimate (₹)" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required />
            <textarea placeholder="Why should they pick you? (Proposal)" rows="4" value={bidProposal} onChange={e => setBidProposal(e.target.value)} required></textarea>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send Bid</button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedProject(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* User View Bids Modal */}
      {selectedProject && user.role === 'user' && (
        <div className="glass-panel" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Bids for this Project</h3>
            <button className="btn btn-secondary" onClick={() => setSelectedProject(null)} style={{ padding: '6px 12px' }}>Close</button>
          </div>
          
          {bids.length === 0 ? <p>No bids yet.</p> : null}
          {bids.map(bid => (
            <div key={bid._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{bid.contractor.name}</h4>
                <strong style={{ color: 'var(--success)', fontSize: '1.2rem' }}>₹{bid.amount}</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Exp: {bid.contractor.experienceYears} Years</p>
              <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>{bid.proposal}</p>
              <button className="btn btn-success" style={{ width: '100%', marginTop: '10px' }} onClick={() => acceptBid(bid._id, selectedProject)}>Accept & Award Project</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
