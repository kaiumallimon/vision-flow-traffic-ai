import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route sends user to Login */}
        <Route path="/login" element={<Login />} />
        
        {/* The AI Analysis Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect any unknown link to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;