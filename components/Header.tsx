import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-emerald-500 to-green-400 text-transparent bg-clip-text">
        DripEditz
      </h1>
      <p className="text-md text-gray-400 mt-2">Edit images with a drop of AI</p>
    </header>
  );
};

export default Header;