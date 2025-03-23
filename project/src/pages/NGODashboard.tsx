import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, TrendingUp, History, CheckCircle, Clock, X, FileText, Calendar, BarChart, Edit, Send, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Update {
  id: number;
  date: string;
  content: string;
  imageUrl?: string;
  type: 'text' | 'milestone' | 'image';
}

interface Fundraiser {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  isVerified: boolean;
  status: 'draft' | 'pending' | 'active' | 'rejected' | 'completed';
  category: string;
  startDate: string;
  endDate: string;
  updates: Update[];
  documents: {
    id: number;
    title: string;
    url: string;
  }[];
  rejectionReason?: string;
  submissionDate: string;
}

interface FundraiserFormData {
  title: string;
  description: string;
  goal: number;
  category: string;
  startDate: string;
  endDate: string;
  documents: File[];
}

const NGODashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedFundraiser, setSelectedFundraiser] = useState<number | null>(null);
  const [formData, setFormData] = useState<FundraiserFormData>({
    title: '',
    description: '',
    goal: 0,
    category: 'education',
    startDate: '',
    endDate: '',
    documents: []
  });
  const [updateData, setUpdateData] = useState({
    content: '',
    type: 'text',
    imageUrl: ''
  });
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  // Placeholder data - would be fetched from smart contract
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([
    {
      id: 1,
      title: 'Clean Water Initiative',
      description: 'Providing clean water access to rural communities',
      goal: 5,
      raised: 2.5,
      isVerified: true,
      status: 'active',
      category: 'environment',
      startDate: '2024-02-15',
      endDate: '2024-04-15',
      submissionDate: '2024-02-10',
      updates: [
        { id: 1, date: '2024-02-20', content: 'Started work in first village', type: 'text' },
        { id: 2, date: '2024-02-25', content: 'Completed first well installation', type: 'milestone' },
        { id: 3, date: '2024-03-01', content: '/images/water-well.jpg', type: 'image' }
      ],
      documents: [
        { id: 1, title: 'Project Plan', url: '#' },
        { id: 2, title: 'Budget Breakdown', url: '#' }
      ]
    },
    {
      id: 2,
      title: 'Education Support Program',
      description: 'Providing educational resources to underprivileged schools',
      goal: 3,
      raised: 0,
      isVerified: false,
      status: 'pending',
      category: 'education',
      startDate: '2024-03-01',
      endDate: '2024-05-01',
      submissionDate: '2024-02-28',
      updates: [],
      documents: [
        { id: 1, title: 'Program Overview', url: '#' }
      ]
    },
    {
      id: 3,
      title: 'Healthcare for Remote Areas',
      description: 'Mobile clinics for remote villages without access to healthcare',
      goal: 8,
      raised: 0,
      isVerified: false,
      status: 'rejected',
      category: 'healthcare',
      startDate: '2024-03-15',
      endDate: '2024-06-15',
      submissionDate: '2024-02-25',
      updates: [],
      documents: [
        { id: 1, title: 'Healthcare Plan', url: '#' }
      ],
      rejectionReason: 'Insufficient documentation of healthcare licenses. Please provide additional proof of medical certifications.'
    }
  ]);

  // Filter fundraisers based on active tab
  const filteredFundraisers = fundraisers.filter(fundraiser => {
    switch (activeTab) {
      case 'active':
        return fundraiser.status === 'active';
      case 'pending':
        return fundraiser.status === 'pending';
      case 'rejected':
        return fundraiser.status === 'rejected';
      case 'completed':
        return fundraiser.status === 'completed';
      default:
        return true;
    }
  });

  useEffect(() => {
    // Check if wallet is connected and user has NGO role
    const storedAddress = localStorage.getItem('walletAddress');
    const userRole = localStorage.getItem('userRole');
    
    if (!storedAddress || userRole !== 'ngo') {
      navigate('/'); // Redirect to role selection if not authenticated
      return;
    }
    
    setWalletAddress(storedAddress);
    
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        documents: Array.from(e.target.files)
      });
    }
  };

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateData({
      ...updateData,
      [name]: value
    });
  };

  const handleCreateFundraiser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new fundraiser object
    const newFundraiser: Fundraiser = {
      id: Math.max(...fundraisers.map(f => f.id), 0) + 1,
      title: formData.title,
      description: formData.description,
      goal: formData.goal,
      raised: 0,
      isVerified: false,
      status: 'pending',
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      updates: [],
      submissionDate: new Date().toISOString().split('T')[0],
      documents: formData.documents.map((doc, index) => ({
        id: index + 1,
        title: doc.name,
        url: '#'
      }))
    };
    
    // Add to fundraisers list
    setFundraisers([...fundraisers, newFundraiser]);
    
    // Reset form and close modal
    setFormData({
      title: '',
      description: '',
      goal: 0,
      category: 'education',
      startDate: '',
      endDate: '',
      documents: []
    });
    setShowCreateModal(false);
    
    // Simulate blockchain transaction
    alert('Fundraiser submitted for verification. It will be in "Pending" status until approved by an auditor.');
  };

  const handlePostUpdate = (fundraiserId: number) => {
    setSelectedFundraiser(fundraiserId);
    setShowUpdateModal(true);
  };
  
  const handleSubmitUpdate = () => {
    if (!selectedFundraiser) return;
    
    const currentFundraiser = fundraisers.find(f => f.id === selectedFundraiser);
    if (!currentFundraiser) return;
    
    // Create new update
    const newUpdate: Update = {
      id: Math.max(...currentFundraiser.updates.map(u => u.id), 0) + 1,
      date: new Date().toISOString().split('T')[0],
      content: updateData.content,
      type: updateData.type as 'text' | 'milestone' | 'image',
      imageUrl: updateData.type === 'image' ? updateData.imageUrl : undefined
    };
    
    // Update fundraiser
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === selectedFundraiser) {
        return {
          ...f,
          updates: [...f.updates, newUpdate]
        };
      }
      return f;
    });
    
    setFundraisers(updatedFundraisers);
    setShowUpdateModal(false);
    setUpdateData({ content: '', type: 'text', imageUrl: '' });
    setSelectedFundraiser(null);
    
    // Simulate blockchain transaction
    alert('Update posted successfully.');
  };
  
  const handleResubmit = (fundraiserId: number) => {
    // Update status to pending
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === fundraiserId) {
        return {
          ...f,
          status: 'pending',
          submissionDate: new Date().toISOString().split('T')[0],
          rejectionReason: undefined
        };
      }
      return f;
    });
    
    setFundraisers(updatedFundraisers);
    
    // Simulate blockchain transaction
    alert('Fundraiser resubmitted for verification.');
  };
  
  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate total stats
  const totalRaised = fundraisers.filter(f => f.status === 'active').reduce((sum, f) => sum + f.raised, 0);
  const activeCount = fundraisers.filter(f => f.status === 'active').length;
  const pendingCount = fundraisers.filter(f => f.status === 'pending').length;
  const rejectedCount = fundraisers.filter(f => f.status === 'rejected').length;
  const completedCount = fundraisers.filter(f => f.status === 'completed').length;
  const verificationStatus = fundraisers.some(f => f.isVerified) ? 'Verified' : 'Not Verified';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">NGO Dashboard</h1>
        </div>
        
        {walletAddress && (
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-md flex items-center gap-2">
              <Building2 className="h-4 w-4" />
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
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Raised</h3>
          </div>
          <p className="text-2xl font-bold">{totalRaised} ETH</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Active Fundraisers</h3>
          </div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-semibold">Pending Approval</h3>
          </div>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Organization Status</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{verificationStatus}</p>
        </div>
      </div>

      {/* Create Fundraiser Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Fundraiser
        </button>
      </div>

      {/* Tabs for different fundraiser statuses */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'active'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'pending'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approval ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'rejected'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'completed'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Fundraisers Grid */}
      <div className="grid gap-6">
        {filteredFundraisers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No fundraisers in this category. Create a new fundraiser to get started.</p>
          </div>
        ) : (
          filteredFundraisers.map((fundraiser) => (
            <div key={fundraiser.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold mb-1">{fundraiser.title}</h3>
                    {fundraiser.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                      fundraiser.status === 'active' ? 'bg-green-100 text-green-800' :
                      fundraiser.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      fundraiser.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {fundraiser.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {fundraiser.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {fundraiser.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                      {fundraiser.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {fundraiser.status.charAt(0).toUpperCase() + fundraiser.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {fundraiser.startDate} to {fundraiser.endDate}
                    </span>
                  </div>
                </div>
                
                {fundraiser.status === 'active' && (
                  <button
                    onClick={() => handlePostUpdate(fundraiser.id)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Post Update
                  </button>
                )}
                
                {fundraiser.status === 'rejected' && (
                  <button
                    onClick={() => handleResubmit(fundraiser.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Resubmit
                  </button>
                )}
              </div>
              
              {fundraiser.status === 'rejected' && fundraiser.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-md mb-4">
                  <h4 className="font-medium text-red-700 mb-1">Rejection Reason</h4>
                  <p className="text-red-600">{fundraiser.rejectionReason}</p>
                </div>
              )}
              
              <p className="text-gray-700 mb-4">{fundraiser.description}</p>
              
              {/* Progress Bar (only for active fundraisers) */}
              {fundraiser.status === 'active' && (
                <div className="mb-6">
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
              )}

              {/* Documents Section */}
              {fundraiser.documents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Submitted Documents</h4>
                  <div className="space-y-2">
                    {fundraiser.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <a href={doc.url} className="text-purple-600 hover:underline">
                          {doc.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Updates Section (only for active fundraisers) */}
              {fundraiser.status === 'active' && fundraiser.updates.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Updates</h4>
                  <div className="space-y-3">
                    {fundraiser.updates.map((update) => (
                      <div key={update.id} className={`p-3 rounded-md ${
                        update.type === 'milestone' ? 'bg-purple-50' : 'bg-gray-50'
                      }`}>
                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          {update.type === 'text' && <Send className="h-3 w-3" />}
                          {update.type === 'milestone' && <CheckCircle className="h-3 w-3 text-purple-600" />}
                          {update.type === 'image' && <Image className="h-3 w-3" />}
                          {update.date}
                        </div>
                        {update.type === 'image' ? (
                          <div className="mt-2">
                            <img 
                              src={update.content}
                              alt="Update"
                              className="rounded-md max-h-48"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-800">{update.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Fundraiser Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Fundraiser</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFundraiser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="disaster">Disaster Relief</option>
                  <option value="poverty">Poverty Alleviation</option>
                  <option value="community">Community Development</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal (ETH)
                  </label>
                  <input
                    type="number"
                    name="goal"
                    step="0.01"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleDocumentUpload}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload relevant documents (registration, project plan, etc.)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="pt-4">
                <div className="bg-yellow-50 p-4 rounded-md mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Note: Verification Required
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your fundraiser will be submitted to auditors for verification. It will not be visible to donors until approved. Make sure all information is accurate and upload all required documents.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Submit for Verification
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Post Update</h2>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Type
                </label>
                <select
                  name="type"
                 
                    value={updateData.type}
                    onChange={handleUpdateInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="text">Text Update</option>
                    <option value="milestone">Milestone Achievement</option>
                    <option value="image">Image Update</option>
                  </select>
                </div>
                
                {updateData.type === 'image' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={updateData.imageUrl}
                      onChange={handleUpdateInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter image URL"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Content
                    </label>
                    <textarea
                      name="content"
                      value={updateData.content}
                      onChange={handleUpdateInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={4}
                      required
                    ></textarea>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitUpdate}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Post Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default NGODashboard;