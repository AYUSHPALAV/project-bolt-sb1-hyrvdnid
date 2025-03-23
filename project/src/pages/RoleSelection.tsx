import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Building2, Shield, Wallet, X } from 'lucide-react';

declare global {
  interface Window {
    ethereum: any;
  }
}

const RoleSelection = () => {
  const navigate = useNavigate();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [selectedChain, setSelectedChain] = useState('');

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowWalletModal(true);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setConnecting(true);
      setError('');

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to the selected network
      if (selectedChain === 'ethereum') {
        // Ethereum Mainnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }], // Ethereum Mainnet
        });
      } else if (selectedChain === 'educhain') {
        // EDU Chain Testnet - example ID, replace with actual chain ID
        // For a custom network, you would use wallet_addEthereumChain instead
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // Example ID for EDU Chain Testnet
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x539', // Example ID for EDU Chain Testnet
                  chainName: 'EDU Chain Testnet',
                  nativeCurrency: {
                    name: 'EDU',
                    symbol: 'EDU',
                    decimals: 18,
                  },
                  rpcUrls: ['https://educhain-testnet.example.com'], // Replace with actual RPC URL
                  blockExplorerUrls: ['https://explorer.educhain-testnet.example.com'], // Replace with actual explorer URL
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      if (accounts.length > 0) {
        localStorage.setItem('walletAddress', accounts[0]);
        localStorage.setItem('userRole', selectedRole);
        
        // Navigate based on role
        switch (selectedRole) {
          case 'donor':
            navigate('/donor-dashboard');
            break;
          case 'ngo':
            navigate('/ngo-dashboard');
            break;
          case 'auditor':
            navigate('/auditor-dashboard');
            break;
        }
        
        setShowWalletModal(false);
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Select Your Role</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => handleRoleSelect('donor')}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
        >
          <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Donor</h2>
          <p className="text-gray-600">
            Make transparent donations and track their impact
          </p>
        </button>

        <button
          onClick={() => handleRoleSelect('ngo')}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
        >
          <Building2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">NGO</h2>
          <p className="text-gray-600">
            Create fundraisers and manage donations
          </p>
        </button>

        <button
          onClick={() => handleRoleSelect('auditor')}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
        >
          <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Auditor</h2>
          <p className="text-gray-600">
            Verify and monitor fundraising activities
          </p>
        </button>
      </div>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please connect your MetaMask wallet to continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Blockchain Network
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedChain('ethereum')}
                  className={`p-3 border rounded-md ${
                    selectedChain === 'ethereum' 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-300'
                  }`}
                >
                  Ethereum
                </button>
                <button
                  onClick={() => setSelectedChain('educhain')}
                  className={`p-3 border rounded-md ${
                    selectedChain === 'educhain' 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-300'
                  }`}
                >
                  EDU Chain Testnet
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <button
              onClick={connectWallet}
              disabled={!selectedChain || connecting}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-md ${
                !selectedChain || connecting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Wallet className="h-5 w-5" />
              {connecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Don't have MetaMask? <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Install it here</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;