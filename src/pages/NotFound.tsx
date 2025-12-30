import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundImage from '../aspects/404.svg';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4 transition-colors duration-300">
      <img src={NotFoundImage} alt="404 Not Found" className="w-full max-w-md mb-8 drop-shadow-lg" />
      
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
        We couldn't find your page
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <button
        onClick={() => navigate('/')}
        className="px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-purple-500/50"
      >
        Go to Home Page
      </button>
    </div>
  );
};

export default NotFound;
