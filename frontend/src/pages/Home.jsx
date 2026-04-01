import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, FileText, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page">
      <header className="hero">
        <h1>Your Dream Home, <br/><span style={{ color: 'var(--accent)' }}>Planned by AI, Built by Pros.</span></h1>
        <p>
          Discuss your construction requirements with Gharvex Ai. Get an instant scope of work, budget estimate, and competitive bids from verified local contractors.
        </p>
        <Link to="/chat" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          Start Planning Now
        </Link>
      </header>

      <section style={{ display: 'flex', gap: '2rem', marginTop: '4rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
          <Bot size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>1. Chat with AI</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tell our smart assistant what you want to build. From a new duplex to a kitchen renovation.
          </p>
        </div>
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
          <FileText size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h3>2. Get Scope & Budget</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Instantly receive a professional "Scope of Work" document and a realistic budget estimate.
          </p>
        </div>
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
          <Users size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h3>3. Receive & Negotiate Bids</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Local verified contractors will submit their bids. Compare their portfolios and pick the best.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
