import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Search, FileText, Wallet, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LocalStorageService from '../services/LocalStorageService';

const AuditorDashboard = () => {
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [pendingFundraisers, setPendingFundraisers] = useState([]);
  const [activeFundraisers, setActiveFundraisers] = useState([]);
  const [recentlyVerified, setRecentlyVerified] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if wallet is connected and user has auditor role
    const storedAddress = localStorage.getItem('walletAddress');
    const userRole = localStorage.getItem('userRole');
    
    if (!storedAddress || userRole !== 'auditor') {
      navigate('/'); // Redirect to role selection if not authenticated
      return;
    }
    
    setWalletAddress(storedAddress);
    
    // Load data from localStorage
    loadFundraisers();
    
    // Setup event listener for wallet change
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('userRole');
          navigate('/');
        } else {
          localStorage.setItem('walletAddress', accounts[0]);
          setWalletAddress(accounts[0]);
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [navigate]);

  const loadFundraisers = () => {
    // Load pending fundraisers
    const pending = LocalStorageService.getPendingFundraisers();
    setPendingFundraisers(pending);
    
    // Load active (approved) fundraisers
    const active = LocalStorageService.getApprovedFundraisers();
    setActiveFundraisers(active);
    
    // Load recently verified (last 5)
    const allVerified = [...active];
    allVerified.sort((a, b) => new Date(b.verificationDate) - new Date(a.verificationDate));
    setRecentlyVerified(allVerified.slice(0, 5));
  };

  const handleVerify = async (fundraiserId, approved) => {
    try {
      if (approved) {
        // Approve the fundraiser
        LocalStorageService.approveFundraiser(fundraiserId);
      } else {
        // Reject the fundraiser
        LocalStorageService.rejectFundraiser(fundraiserId, verificationNote);
      }
      
      // Reload fundraisers
      loadFundraisers();
      
      // Reset state
      setSelectedFundraiser(null);
      setVerificationNote('');
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };
  
  const handleDeleteFundraiser = async (fundraiserId) => {
    try {
      // Delete the fundraiser
      LocalStorageService.deleteApprovedFundraiser(fundraiserId);
      
      // Reload fundraisers
      loadFundraisers();
      
      // Reset state
      setShowDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting fundraiser:', error);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const formatWalletAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Auditor Dashboard</h1>
        </div>
        {walletAddress && (
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-md flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>{formatWalletAddress(walletAddress)}</span>
            </div>
            <button 
              onClick={disconnectWallet}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">Pending Verifications</h3>
          </div>
          <p className="text-2xl font-bold">{pendingFundraisers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">Active Fundraisers</h3>
          </div>
          <p className="text-2xl font-bold">{activeFundraisers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Amount Raised</h3>
          </div>
          <p className="text-2xl font-bold">
            {activeFundraisers.reduce((sum, f) => sum + parseFloat(f.raised || 0), 0).toFixed(2)} ETH
          </p>
        </div>
      </div>

      {/* Active Fundraisers Monitoring */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Active Fundraisers Monitoring</h2>
        <div className="space-y-6">
          {activeFundraisers.map((fundraiser) => (
            <div key={fundraiser.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{fundraiser.title}</h3>
                    {fundraiser.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{fundraiser.ngo}</p>
                  <p className="text-sm text-gray-500">
                    Running: {fundraiser.startDate} to {fundraiser.endDate}
                  </p>
                </div>
                
                {showDeleteConfirmation !== fundraiser.id ? (
                  <button
                    onClick={() => setShowDeleteConfirmation(fundraiser.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirmation(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteFundraiser(fundraiser.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Confirm Delete
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{fundraiser.description}</p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{((fundraiser.raised || 0) / fundraiser.goal * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 rounded-full h-2"
                    style={{ width: `${Math.min(100, ((fundraiser.raised || 0) / fundraiser.goal * 100))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>{fundraiser.raised || 0} ETH raised</span>
                  <span>Goal: {fundraiser.goal} ETH</span>
                </div>
              </div>
            </div>
          ))}

          {activeFundraisers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No active fundraisers to display.
            </div>
          )}
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Pending Verifications</h2>
        <div className="space-y-6">
          {pendingFundraisers.map((fundraiser) => (
            <div key={fundraiser.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{fundraiser.title}</h3>
                  <p className="text-gray-600">{fundraiser.ngo}</p>
                  <p className="text-sm text-gray-500">Submitted: {fundraiser.submissionDate}</p>
                </div>
                {selectedFundraiser !== fundraiser.id ? (
                  <button
                    onClick={() => setSelectedFundraiser(fundraiser.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Review
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(fundraiser.id, true)}
                      className="px-4 py-2 bg-green-600text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(fundraiser.id, false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{fundraiser.description}</p>
              
              {/* Goal Display */}
              <div className="mb-4">
                <p className="font-medium">Goal: {fundraiser.goal} ETH</p>
              </div>
              
              {selectedFundraiser === fundraiser.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2">Verification Note</h4>
                  <textarea
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Enter notes about verification decision (required for rejections)"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md mb-2"
                  ></textarea>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>
                      Document verification and due diligence checks should be completed before approval.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {pendingFundraisers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No pending verifications at this time.
            </div>
          )}
        </div>
      </div>

      {/* Recently Verified */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Recently Verified</h2>
        <div className="space-y-4">
          {recentlyVerified.map((fundraiser) => (
            <div key={fundraiser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <h3 className="font-medium">{fundraiser.title}</h3>
                <p className="text-sm text-gray-600">
                  Verified on {fundraiser.verificationDate}
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Approved
              </div>
            </div>
          ))}

          {recentlyVerified.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No recently verified fundraisers to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;