// LocalStorageService.js
// This service will handle all localStorage operations for our fundraiser platform

class LocalStorageService {
    // Keys for our different storage items
    static KEYS = {
      PENDING_FUNDRAISERS: 'pendingFundraisers',
      APPROVED_FUNDRAISERS: 'approvedFundraisers',
      REJECTED_FUNDRAISERS: 'rejectedFundraisers',
      WALLET_ADDRESS: 'walletAddress',
      USER_ROLE: 'userRole'
    };
  
    // Get all pending fundraisers
    static getPendingFundraisers() {
      const stored = localStorage.getItem(this.KEYS.PENDING_FUNDRAISERS);
      return stored ? JSON.parse(stored) : [];
    }
  
    // Save a new pending fundraiser (from NGO Dashboard)
    static addPendingFundraiser(fundraiser) {
      const current = this.getPendingFundraisers();
      // Generate a unique ID
      const newId = current.length > 0 
        ? Math.max(...current.map(f => f.id)) + 1 
        : 1;
      
      const newFundraiser = {
        ...fundraiser,
        id: newId,
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      localStorage.setItem(
        this.KEYS.PENDING_FUNDRAISERS, 
        JSON.stringify([...current, newFundraiser])
      );
      
      return newFundraiser;
    }
  
    // Get all approved fundraisers
    static getApprovedFundraisers() {
      const stored = localStorage.getItem(this.KEYS.APPROVED_FUNDRAISERS);
      return stored ? JSON.parse(stored) : [];
    }
  
    // Add an approved fundraiser (from Auditor Dashboard)
    static approveFundraiser(fundraiserId) {
      const pendingFundraisers = this.getPendingFundraisers();
      const fundraiser = pendingFundraisers.find(f => f.id === fundraiserId);
      
      if (!fundraiser) return null;
      
      // Remove from pending
      this.removePendingFundraiser(fundraiserId);
      
      // Add to approved with additional fields
      const approvedFundraiser = {
        ...fundraiser,
        isVerified: true,
        verificationDate: new Date().toISOString().split('T')[0],
        status: 'approved',
        raised: 0, // Start with 0 ETH raised
        startDate: new Date().toISOString().split('T')[0],
        // Set end date to 60 days from now
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      const currentApproved = this.getApprovedFundraisers();
      localStorage.setItem(
        this.KEYS.APPROVED_FUNDRAISERS,
        JSON.stringify([...currentApproved, approvedFundraiser])
      );
      
      return approvedFundraiser;
    }
  
    // Reject a fundraiser (from Auditor Dashboard)
    static rejectFundraiser(fundraiserId, reason) {
      const pendingFundraisers = this.getPendingFundraisers();
      const fundraiser = pendingFundraisers.find(f => f.id === fundraiserId);
      
      if (!fundraiser) return null;
      
      // Remove from pending
      this.removePendingFundraiser(fundraiserId);
      
      // Add to rejected
      const rejectedFundraiser = {
        ...fundraiser,
        rejectionDate: new Date().toISOString().split('T')[0],
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      };
      
      const currentRejected = this.getRejectedFundraisers();
      localStorage.setItem(
        this.KEYS.REJECTED_FUNDRAISERS,
        JSON.stringify([...currentRejected, rejectedFundraiser])
      );
      
      return rejectedFundraiser;
    }
  
    // Remove a pending fundraiser
    static removePendingFundraiser(fundraiserId) {
      const pendingFundraisers = this.getPendingFundraisers();
      const updated = pendingFundraisers.filter(f => f.id !== fundraiserId);
      localStorage.setItem(this.KEYS.PENDING_FUNDRAISERS, JSON.stringify(updated));
    }
    
    // Get all rejected fundraisers
    static getRejectedFundraisers() {
      const stored = localStorage.getItem(this.KEYS.REJECTED_FUNDRAISERS);
      return stored ? JSON.parse(stored) : [];
    }
    
    // Make a donation to a fundraiser
    static donateTo(fundraiserId, amount) {
      const approvedFundraisers = this.getApprovedFundraisers();
      const fundraiserIndex = approvedFundraisers.findIndex(f => f.id === fundraiserId);
      
      if (fundraiserIndex === -1) return null;
      
      // Update the fundraiser with the new donation
      const updatedFundraiser = {
        ...approvedFundraisers[fundraiserIndex],
        raised: parseFloat(approvedFundraisers[fundraiserIndex].raised) + parseFloat(amount)
      };
      
      approvedFundraisers[fundraiserIndex] = updatedFundraiser;
      
      // Save back to localStorage
      localStorage.setItem(this.KEYS.APPROVED_FUNDRAISERS, JSON.stringify(approvedFundraisers));
      
      return updatedFundraiser;
    }
    
    // Delete an approved fundraiser (for auditor)
    static deleteApprovedFundraiser(fundraiserId) {
      const approvedFundraisers = this.getApprovedFundraisers();
      const updated = approvedFundraisers.filter(f => f.id !== fundraiserId);
      localStorage.setItem(this.KEYS.APPROVED_FUNDRAISERS, JSON.stringify(updated));
    }
  }
  
  export default LocalStorageService;