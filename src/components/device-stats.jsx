import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const DeviceStats = ({ clicksData }) => {
  // Grouper les clics par appareil
  const deviceStats = clicksData.reduce((acc, click) => {
    const device = click.devise || 'Unknown';
    if (!acc[device]) {
      acc[device] = 0;
    }
    acc[device]++;
    return acc;
  }, {});

  // Convertir en format pour Recharts
  const chartData = Object.entries(deviceStats).map(([device, clicks]) => ({
    name: device,
    value: clicks
  }));

  // Couleurs pour les différents appareils
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceStats;
