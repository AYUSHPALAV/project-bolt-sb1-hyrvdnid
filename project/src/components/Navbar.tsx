import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogIn } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-800">DeFi Donate</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/role-selection" className="flex items-center px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">
              <LogIn className="h-5 w-5 mr-2" />
              <span>Connect</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;