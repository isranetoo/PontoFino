import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

const DashboardSimulador = ({ simulations, comparisonData }) => {
  // simulations: array of simulation results
  // comparisonData: array of { name, value } for comparison chart

  return (
    <div className="space-y-6 relative">
      {/* Resultados das Simulações */}
      {simulations && simulations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-200">
                <PieChartIcon className="h-5 w-5" />
                Resultados das Simulações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={simulations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valorFinal"
                    nameKey="name"
                  >
                    {simulations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} labelStyle={{ color: '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {/* Comparação de Rentabilidades */}
      {comparisonData && comparisonData.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-200">
                <BarChart3 className="h-5 w-5" />
                Comparação de Rentabilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} labelStyle={{ color: '#000' }} />
                  <Legend />
                  <Bar dataKey="valorFinal" fill="#10B981" name="Valor Final" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardSimulador;
