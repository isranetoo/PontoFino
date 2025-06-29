import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Ferramentas from './pages/Ferramentas';
import About from './pages/About';
import ProjetoFuturo from './pages/ProjetoFuturo';
import Subscriptions from './pages/Subscriptions';
import Login from './components/Login';
import Register from './components/Register';

import SimuladorInvestimentos from './components/Simulador de Investimentos/SimuladorInvestimentos';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>        <Route path="/" element={<Home />} />
        <Route path="/ferramentas" element={<Ferramentas />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/projetos-futuros" element={<ProjetoFuturo />} />        {/* Rotas para Gestão de Orçamento */}
        <Route path="/orcamento" element={<App />} />
        {/* Rota para Simulador de Investimentos */}
        <Route path="/simulador-investimentos" element={<SimuladorInvestimentos />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}
