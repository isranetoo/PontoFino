import NavBar from './components/Gestão de Orçamento/NavBar';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Ferramentas from './pages/Ferramentas';
import About from './pages/About';
import ProjetoFuturo from './pages/ProjetoFuturo';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Gestão de Orçamento/Dashboard';
import BudgetSettings from './components/Gestão de Orçamento/BudgetSettings';
import TransactionForm from './components/Gestão de Orçamento/TransactionForm';
import TransactionList from './components/Gestão de Orçamento/TransactionList';
import Investments from './components/Gestão de Orçamento/Investments';
import GoalsManager from './components/Gestão de Orçamento/GoalsManager';

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
        {/* Rotas para Gestão de Orçamento */}
        <Route path="/orcamento" element={<Dashboard />} />
        <Route path="/orcamento/configuracoes" element={<BudgetSettings />} />
        <Route path="/orcamento/nova-transacao" element={<TransactionForm />} />
        <Route path="/orcamento/transacoes" element={<TransactionList transactions={[]} categories={[]} onDeleteTransaction={()=>{}} />} />
        <Route path="/orcamento/investimentos" element={<Investments />} />
        <Route path="/orcamento/metas" element={<GoalsManager goals={[]} onAddGoal={()=>{}} onUpdateGoal={()=>{}} onDeleteGoal={()=>{}} />} />
        {/* Exemplo de rota para NavBar, ajuste conforme necessário */}
        <Route path="/orcamento/navbar" element={<NavBar tab={"dashboard"} setTab={()=>{}} />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}
