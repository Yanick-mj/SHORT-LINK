import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const LocationStats = ({ clicksData }) => {
  // Grouper les clics par ville avec gestion des états de chargement
  const cityStats = clicksData.reduce((acc, click) => {
    let city = click.city || 'Unknown';

    // Gestion des états de chargement
    if (city === 'Loading...') {
      city = 'Loading...';
    } else if (city === 'Unknown') {
      city = 'Unknown';
    }

    if (!acc[city]) {
      acc[city] = 0;
    }
    acc[city]++;
    return acc;
  }, {});

  // Grouper par pays
  const countryStats = clicksData.reduce((acc, click) => {
    const country = click.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = 0;
    }
    acc[country]++;
    return acc;
  }, {});

  // Convertir en format pour Recharts
  const cityChartData = Object.entries(cityStats)
    .map(([city, clicks]) => ({ city, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10); // Top 10 villes

  const countryChartData = Object.entries(countryStats)
    .map(([country, clicks]) => ({ country, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8); // Top 8 pays

  // Couleurs pour le graphique en secteurs
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Statistiques par ville */}
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Top 10 Villes</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="city"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, 'Clics']}
                labelFormatter={(label) => `Ville: ${label}`}
              />
              <Bar dataKey="clicks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistiques par pays */}
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Répartition par Pays</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="clicks"
              >
                {countryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, 'Clics']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Villes uniques</h4>
          <p className="text-2xl font-bold text-blue-600">
            {Object.keys(cityStats).filter(city => city !== 'Loading...' && city !== 'Unknown').length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Pays uniques</h4>
          <p className="text-2xl font-bold text-green-600">
            {Object.keys(countryStats).filter(country => country !== 'Unknown').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationStats;
