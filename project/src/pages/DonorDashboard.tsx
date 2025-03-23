import React, { useState, useEffect } from 'react';
import { Heart, History, TrendingUp, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Fundraiser {
  id: number;
  title: string;
  ngo: string;
  description: string;
  goal: number;
  raised: number;
  isVerified: boolean;
  walletAddress?: string;
}

interface DonationDetails {
  fundraiserId: number;
  amount: number;
}

const DonorDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [approvedFundraisers, setApprovedFundraisers] = useState<Fundraiser[]>([]);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [donationAmount, setDonationAmount] = useState<Record<number, string>>({});
  const [donationModal, setDonationModal] = useState<{ isOpen: boolean, fundraiser: Fundraiser | null }>({
    isOpen: false,
    fundraiser: null
  });
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    status: 'success' | 'error' | 'pending' | null;
    message: string;
  }>({ status: null, message: '' });

  // Existing hard-coded fundraisers with wallet addresses
  const fundraisers: Fundraiser[] = [
    {
      id: 1,
      title: 'Clean Water Initiative',
      ngo: 'WaterAid Foundation',
      description: 'Providing clean water access to rural communities',
      goal: 5,
      raised: 2.5,
      isVerified: true,
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
    {
      id: 2,
      title: 'Education for All',
      ngo: 'Global Education Trust',
      description: 'Supporting underprivileged children with quality education',
      goal: 10,
      raised: 7.8,
      isVerified: true,
      walletAddress: '0x0987654321098765432109876543210987654321',
    }
  ];

  // Check for MetaMask on component mount
  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        setIsMetaMaskInstalled(true);
        
        // Check if already connected
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking accounts:', error);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          } else {
            setConnectedAccount(null);
          }
        });
      } else {
        setIsMetaMaskInstalled(false);
      }
    };

    checkMetaMask();

    // Load approved fundraisers from localStorage
    const stored = localStorage.getItem('approvedFundraisers');
    if (stored) {
      setApprovedFundraisers(JSON.parse(stored));
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {
          console.log('Listener removed');
        });
      }
    };
  }, []);

  // Combine existing fundraisers with newly approved ones
  const combinedFundraisers = [...fundraisers, ...approvedFundraisers];

  // Filter fundraisers based on selected category
  const filteredFundraisers = selectedCategory === 'verified'
    ? combinedFundraisers.filter(f => f.isVerified)
    : combinedFundraisers;

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed! Please install MetaMask to make donations.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnectedAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  // Open donation modal
  const openDonationModal = (fundraiser: Fundraiser) => {
    setDonationModal({
      isOpen: true,
      fundraiser: fundraiser
    });
    // Set default donation amount
    setDonationAmount({
      ...donationAmount,
      [fundraiser.id]: '0.1'
    });
  };

  // Close donation modal
  const closeDonationModal = () => {
    setDonationModal({
      isOpen: false,
      fundraiser: null
    });
    setTransactionStatus({ status: null, message: '' });
  };

  // Handle donation amount change
  const handleAmountChange = (fundraiserId: number, value: string) => {
    setDonationAmount({
      ...donationAmount,
      [fundraiserId]: value
    });
  };

  // Process donation
  const processDonation = async () => {
    if (!donationModal.fundraiser || !donationModal.fundraiser.walletAddress) {
      setTransactionStatus({
        status: 'error',
        message: 'Invalid recipient address.'
      });
      return;
    }

    if (!connectedAccount) {
      setTransactionStatus({
        status: 'error',
        message: 'Please connect your MetaMask wallet first.'
      });
      return;
    }

    const amount = donationAmount[donationModal.fundraiser.id];
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setTransactionStatus({
        status: 'error',
        message: 'Please enter a valid donation amount.'
      });
      return;
    }

    setIsTransacting(true);
    setTransactionStatus({
      status: 'pending',
      message: 'Processing your donation...'
    });

    try {
      // Convert ETH to wei
      const amountInWei = window.ethereum.utils 
        ? window.ethereum.utils.toWei(amount, 'ether')
        : (parseFloat(amount) * 1e18).toString(); // Fallback conversion

      // Send transaction
      const transactionParameters = {
        to: donationModal.fundraiser.walletAddress,
        from: connectedAccount,
        value: `0x${parseInt(amountInWei).toString(16)}`, // Convert to hex
        gas: '0x5208', // 21000 gas (standard transaction)
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // Update local state to reflect donation
      const updatedFundraisers = combinedFundraisers.map(f => {
        if (f.id === donationModal.fundraiser.id) {
          return {
            ...f,
            raised: f.raised + parseFloat(amount)
          };
        }
        return f;
      });

      // If the fundraiser was from the approved list, update it
      const updatedApproved = approvedFundraisers.map(f => {
        if (f.id === donationModal.fundraiser.id) {
          return {
            ...f,
            raised: f.raised + parseFloat(amount)
          };
        }
        return f;
      });
      
      setApprovedFundraisers(updatedApproved);
      localStorage.setItem('approvedFundraisers', JSON.stringify(updatedApproved));

      // Record the transaction
      recordDonation({
        fundraiserId: donationModal.fundraiser.id,
        amount: parseFloat(amount)
      });

      setTransactionStatus({
        status: 'success',
        message: `Donation successful! Transaction hash: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`
      });
    } catch (error: any) {
      console.error('Transaction error:', error);
      setTransactionStatus({
        status: 'error',
        message: error.message || 'Transaction failed. Please try again.'
      });
    } finally {
      setIsTransacting(false);
    }
  };

  // Record donation in local storage for history
  const recordDonation = (details: DonationDetails) => {
    const donations = JSON.parse(localStorage.getItem('donationHistory') || '[]');
    donations.push({
      ...details,
      timestamp: new Date().toISOString(),
      address: connectedAccount
    });
    localStorage.setItem('donationHistory', JSON.stringify(donations));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Donor Dashboard</h1>
        </div>
        <div>
          {isMetaMaskInstalled ? (
            connectedAccount ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Connected: {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}</span>
              </div>
            ) : (
              <button 
                onClick={connectMetaMask}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Connect MetaMask
              </button>
            )
          ) : (
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Install MetaMask
            </a>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Donated</h3>
          </div>
          <p className="text-2xl font-bold">5.5 ETH</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Donations Made</h3>
          </div>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Impact Score</h3>
          </div>
          <p className="text-2xl font-bold">85</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Fundraisers
        </button>
        <button
          onClick={() => setSelectedCategory('verified')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedCategory === 'verified'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verified Only
        </button>
      </div>

      {/* Fundraisers Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredFundraisers.map((fundraiser) => (
          <div key={fundraiser.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{fundraiser.title}</h3>
                <p className="text-gray-600 text-sm">{fundraiser.ngo}</p>
              </div>
              {fundraiser.isVerified && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Verified
                </span>
              )}
            </div>
            <p className="text-gray-700 mb-4">{fundraiser.description}</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{(fundraiser.raised / fundraiser.goal * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 rounded-full h-2"
                  style={{ width: `${(fundraiser.raised / fundraiser.goal * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>{fundraiser.raised} ETH raised</span>
                <span>Goal: {fundraiser.goal} ETH</span>
              </div>
            </div>
            <button
              onClick={() => openDonationModal(fundraiser)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              disabled={!isMetaMaskInstalled}
            >
              Donate Now
            </button>
          </div>
        ))}
      </div>

      {/* Donation Modal */}
      {donationModal.isOpen && donationModal.fundraiser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Donate to {donationModal.fundraiser.title}</h3>
              <button onClick={closeDonationModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            {!connectedAccount ? (
              <div className="mb-4 text-center">
                <p className="mb-4">Please connect your MetaMask wallet to make a donation.</p>
                <button 
                  onClick={connectMetaMask}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Connect MetaMask
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Donation Amount (ETH)</label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={donationAmount[donationModal.fundraiser.id] || ''}
                    onChange={(e) => handleAmountChange(donationModal.fundraiser.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="0.1"
                    disabled={isTransacting}
                  />
                </div>
                
                <div className="mb-4 text-sm text-gray-600">
                  <p>Recipient: {donationModal.fundraiser.ngo}</p>
                  <p className="truncate">Address: {donationModal.fundraiser.walletAddress}</p>
                </div>
                
                {transactionStatus.status && (
                  <div className={`mb-4 p-3 rounded-md ${
                    transactionStatus.status === 'success' ? 'bg-green-100 text-green-800' :
                    transactionStatus.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <p>{transactionStatus.message}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeDonationModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={isTransacting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processDonation}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                    disabled={isTransacting}
                  >
                    {isTransacting ? 'Processing...' : 'Confirm Donation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;