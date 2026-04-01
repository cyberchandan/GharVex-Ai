import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am Gharvex Ai. Briefly describe what kind of construction or renovation project you have in mind." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'contractor') {
      navigate('/dashboard'); // Contractors don't need the AI chat
    }
  }, [user, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || projectData) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const { data } = await axios.post(`${API_URL}/ai/chat`, { messages: newMessages }, config);

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      
      if (data.projectReady && data.projectData) {
        setProjectData(data.projectData);
      }
    } catch (error) {
      console.error('Chat error', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Oops, something went wrong. Let me reconnect...' }]);
    }
    setLoading(false);
  };

  const createProject = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/projects`, projectData, config);
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to save project');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
        
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem' 
            }}>
              <div style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                padding: '12px 18px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '0' : '16px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '0' : '16px',
                maxWidth: '75%',
                lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: 'var(--text-secondary)' }}>Gharvex Ai is typing...</div>}
          
          {projectData && (
            <div className="glass-panel" style={{ marginTop: '2rem', border: '1px solid var(--success)' }}>
              <h3 style={{ color: 'var(--success)' }}>Project finalized!</h3>
              <ul style={{ margin: '1rem 0 1rem 1.5rem', color: 'var(--text-secondary)' }}>
                <li><strong>Title:</strong> {projectData.title}</li>
                <li><strong>Budget:</strong> ₹{projectData.estimatedBudget}</li>
                <li><strong>Location:</strong> {projectData.location}</li>
              </ul>
              <button className="btn btn-success" onClick={createProject}>Approve & Find Contractors</button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <input 
            style={{ marginBottom: 0, flex: 1 }}
            type="text" 
            placeholder="Type your message..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            disabled={loading || !!projectData}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !!projectData}>Send</button>
        </form>

      </div>
    </div>
  );
};

export default Chat;
