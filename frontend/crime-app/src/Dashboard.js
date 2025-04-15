import React, { useState, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import './dashboard.css';
import SearchCrimeData from './SearchCrimeData';
import AdvanceSearch from './AdvanceSearch';
import KeywordSearch from './KeywordSearch';
import AboutCrimeAtlas from './About';
import logo from './Logo.png';
import { UserContext } from './App';

function Dashboard() {
  const [selectedView, setSelectedView] = useState('basic-search');
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log('Dashboard signout'); // Debug signout
    logout();
    window.location.href = '/';
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-title">
          <img src={logo} alt="CrimeAtlas Logo" className="logo-icon" />
          <span>CrimeAtlas</span>
        </div>

        <button
          className={selectedView === 'about' ? 'active' : ''}
          onClick={() => setSelectedView('about')}
        >
          About
        </button>
        <button
          className={selectedView === 'basic-search' ? 'active' : ''}
          onClick={() => setSelectedView('basic-search')}
        >
          Basic Search
        </button>
        <button
          className={selectedView === 'advance-search' ? 'active' : ''}
          onClick={() => setSelectedView('advance-search')}
        >
          Advance Search
        </button>
        <button
          className={selectedView === 'keyword-search' ? 'active' : ''}
          onClick={() => setSelectedView('keyword-search')}
        >
          Keyword Search
        </button>
        <button className="signout" onClick={handleSignOut}>
          Signout
        </button>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {selectedView === 'about' && <AboutCrimeAtlas />}
        {selectedView === 'basic-search' && <SearchCrimeData />}
        {selectedView === 'advance-search' && <AdvanceSearch />}
        {selectedView === 'keyword-search' && <KeywordSearch />}
      </div>
    </div>
  );
}

export default Dashboard;
