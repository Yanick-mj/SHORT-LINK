import React from 'react';
import Header from '../components/header';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (

    <div>
      <main className="min-h-screen container mx-auto px-4 ">
        <Header />
        <Outlet />
      </main>

      {/* footer */}
      <div className="p-10 text-center bg-gray-800 mt-10 text-white">
          Made with 🫀 by Yanick Mingala
      </div>
    </div>
  )
};

export default AppLayout;
