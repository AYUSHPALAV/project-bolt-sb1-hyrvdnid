import React from 'react';
import { ArrowRight, Shield, LineChart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Transparent Donations for a Better World
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your donations in real-time and see the direct impact of your contribution
        </p>
        <Link
          to="/role-selection"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <Shield className="h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
          <p className="text-gray-600">
            Blockchain-powered transparency ensures your donations are tracked and used responsibly
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <LineChart className="h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
          <p className="text-gray-600">
            Monitor how your donations are being utilized with live updates and detailed reporting
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <Users className="h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI-Powered Verification</h3>
          <p className="text-gray-600">
            Advanced AI systems verify NGO credentials and monitor fund usage for maximum impact
          </p>
        </div>
      </div>

      {/* Success Stories */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Success Stories</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Success story"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Clean Water Initiative</h3>
              <p className="text-gray-600">
                Provided clean water access to 10,000 people in rural communities through transparent donation tracking
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1524069290683-0457abfe42c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Success story"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Education for All</h3>
              <p className="text-gray-600">
                Funded 50 schools with complete transparency in resource allocation and utilization
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;