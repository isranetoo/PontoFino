import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Ferramentas from './pages/Ferramentas';
import Login from './components/Login';
import Register from './components/Register';


export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ferramentas" element={<Ferramentas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}
