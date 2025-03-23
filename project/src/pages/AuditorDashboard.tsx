import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Search, FileText, Wallet, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuditorDashboard = () => {
  const [selectedFundraiser, setSelectedFundraiser] = useState<number | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<number | null>(null);
  const navigate = useNavigate();

  // Placeholder data - would be fetched from smart contract
  const pendingFundraisers = [
    {
      id: 1,
      title: 'Clean Water Initiative',
      ngo: 'WaterAid Foundation',
      description: 'Providing clean water access to rural communities',
      goal: 5,
      documents: [
        { id: 1, title: 'NGO Registration', url: '#' },
        { id: 2, title: 'Project Plan', url: '#' },
        { id: 3, title: 'Budget Breakdown', url: '#' }
      ],
      submissionDate: '2024-02-25'
    },
    {
      id: 2,
      title: 'Education for All',
      ngo: 'Global Education Trust',
      description: 'Supporting underprivileged children with quality education',
      goal: 10,
      documents: [
        { id: 1, title: 'Trust Certificate', url: '#' },
        { id: 2, title: 'Previous Projects', url: '#' }
      ],
      submissionDate: '2024-02-26'
    }
  ];

  const verifiedFundraisers = [
    {
      id: 3,
      title: 'Healthcare Access Program',
      ngo: 'MedAid International',
      verificationDate: '2024-02-20',
      status: 'approved',
      note: 'All documentation verified. Project goals align with NGO mission.'
    }
  ];
  
  // Active fundraisers from donor and NGO dashboards
  const activeFundraisers = [
    {
      id: 101,
      title: 'Clean Water Initiative',
      ngo: 'WaterAid Foundation',
      description: 'Providing clean water access to rural communities',
      goal: 5,
      raised: 2.5,
      isVerified: true,
      startDate: '2024-02-15',
      endDate: '2024-04-15'
    },
    {
      id: 102,
      title: 'Education for All',
      ngo: 'Global Education Trust',
      description: 'Supporting underprivileged children with quality education',
      goal: 10,
      raised: 7.8,
      isVerified: true,
      startDate: '2024-01-20',
      endDate: '2024-03-20'
    }
  ];

  useEffect(() => {
    // Check if wallet is connected and user has auditor role
    const storedAddress = localStorage.getItem('walletAddress');
    const userRole = localStorage.getItem('userRole');
    
    if (!storedAddress || userRole !== 'auditor') {
      navigate('/'); // Redirect to role selection if not authenticated
      return;
    }
    
    setWalletAddress(storedAddress);
    
    // You could also verify the auditor role on the blockchain here
    
    // Set up event listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('userRole');
          navigate('/');
        } else {
          // User switched accounts
          localStorage.setItem('walletAddress', accounts[0]);
          setWalletAddress(accounts[0]);
        }
      });
    }
    
    return () => {
      // Clean up event listener
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [navigate]);

  const handleVerify = async (fundraiserId: number, approved: boolean) => {
    try {
      // Here you would interact with the smart contract
      // Example: await contractInstance.verifyFundraiser(fundraiserId, approved, verificationNote);
      
      console.log(`Fundraiser ${fundraiserId} ${approved ? 'approved' : 'rejected'}`);
      console.log('Verification note:', verificationNote);
      console.log('Auditor wallet:', walletAddress);
      
      setSelectedFundraiser(null);
      setVerificationNote('');
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };
  
  const handleDeleteFundraiser = async (fundraiserId: number) => {
    try {
      // Here you would interact with the smart contract to delete the fundraiser
      // Example: await contractInstance.deleteFundraiser(fundraiserId);
      
      console.log(`Fundraiser ${fundraiserId} deleted by auditor`);
      console.log('Auditor wallet:', walletAddress);
      
      // Update UI - in a real implementation, you would refresh the data from the blockchain
      setShowDeleteConfirmation(null);
      
      // For this example, we'll just update the state
      // In a real app, you'd fetch the updated list from the blockchain
      alert(`Fundraiser ${fundraiserId} has been deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting fundraiser:', error);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
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
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Pending Reviews</h3>
          </div>
          <p className="text-2xl font-bold">{pendingFundraisers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Verified Today</h3>
          </div>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Reviewed</h3>
          </div>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-semibold">Active Fundraisers</h3>
          </div>
          <p className="text-2xl font-bold">{activeFundraisers.length}</p>
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
                  <span>{(fundraiser.raised / fundraiser.goal * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 rounded-full h-2"
                    style={{ width: `${Math.min(100, (fundraiser.raised / fundraiser.goal * 100))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>{fundraiser.raised} ETH raised</span>
                  <span>Goal: {fundraiser.goal} ETH</span>
                </div>
              </div>
            </div>
          ))}
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
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(fundraiser.id, false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 mb-4">{fundraiser.description}</p>
              
              {selectedFundraiser === fundraiser.id && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold mb-3">Verification Details</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Submitted Documents</h5>
                      <ul className="space-y-2">
                        {fundraiser.documents.map((doc) => (
                          <li key={doc.id} className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <a href={doc.url} className="text-purple-600 hover:underline">
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Notes
                      </label>
                      <textarea
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        rows={4}
                        placeholder="Add your verification notes here..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recently Verified */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Recently Verified</h2>
        <div className="space-y-4">
          {verifiedFundraisers.map((fundraiser) => (
            <div key={fundraiser.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-md">
              <div>
                <h3 className="font-semibold mb-1">{fundraiser.title}</h3>
                <p className="text-gray-600 text-sm">{fundraiser.ngo}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Verified on: {fundraiser.verificationDate}
                </p>
                <p className="text-sm text-gray-700 mt-2">{fundraiser.note}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                fundraiser.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {fundraiser.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;