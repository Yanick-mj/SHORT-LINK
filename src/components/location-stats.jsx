import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LocationStats = ({ clicksData }) => {
  // Grouper les clics par ville
  const cityStats = clicksData.reduce((acc, click) => {
    const city = click.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = 0;
    }
    acc[city]++;
    return acc;
  }, {});

  // Convertir en format pour Recharts
  const chartData = Object.entries(cityStats).map(([city, clicks]) => ({
    city,
    clicks
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="city" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LocationStats;
