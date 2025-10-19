import React from 'react';

const PopularSports: React.FC = () => {
  const sports = [
    {
      id: 'football',
      name: 'Fútbol',
      icon: '⚽',
      count: '2,847',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'basketball',
      name: 'Básquetbol',
      icon: '🏀',
      count: '1,523',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'tennis',
      name: 'Tenis',
      icon: '🎾',
      count: '967',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'volleyball',
      name: 'Voleibol',
      icon: '🏐',
      count: '743',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'paddle',
      name: 'Paddle',
      icon: '🏓',
      count: '592',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'hockey',
      name: 'Hockey',
      icon: '🏒',
      count: '234',
      color: 'bg-red-100 text-red-800',
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Deportes más populares
          </h2>
          <p className="text-lg text-gray-600">
            Descubre las canchas más reservadas en tu zona
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sports.map((sport) => (
            <button
              key={sport.id}
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 text-center"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {sport.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {sport.name}
              </h3>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sport.color}`}>
                {sport.count} canchas
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Ver todos los deportes
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopularSports;