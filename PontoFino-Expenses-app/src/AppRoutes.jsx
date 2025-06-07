import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Ferramentas from './pages/Ferramentas';
import About from './pages/About';
import ProjetoFuturo from './pages/ProjetoFuturo';
import Login from './components/Login';
import Register from './components/Register';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ferramentas" element={<Ferramentas />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/projetos-futuros" element={<ProjetoFuturo />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}
