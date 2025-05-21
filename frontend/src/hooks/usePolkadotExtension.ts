import { useState, useEffect } from 'react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const APP_NAME = '.escrow';

export interface PolkadotExtensionStatus {
  isReady: boolean;
  accounts: InjectedAccountWithMeta[];
  error: string | null;
  selectedAccount: InjectedAccountWithMeta | null;
  isLoading: boolean;
}

export const usePolkadotExtension = () => {
  const [status, setStatus] = useState<PolkadotExtensionStatus>({
    isReady: false,
    accounts: [],
    error: null,
    selectedAccount: null,
    isLoading: false,
  });

  // Add debug function
  const debugLog = (message: string, data?: any) => {
    console.log(`[PolkadotExtension] ${message}`, data || '');
  };

  // Check if extension is installed
  const checkExtension = async (): Promise<boolean> => {
    try {
      const extensions = await web3Enable(APP_NAME);
      return extensions.length > 0;
    } catch (error) {
      debugLog('Error checking extension:', error);
      return false;
    }
  };

  // Load accounts from extension with retry
  const loadAccounts = async (retries = 3): Promise<InjectedAccountWithMeta[]> => {
    let attempt = 0;
    
    while (attempt < retries) {
      try {
        debugLog(`Attempting to load accounts, attempt ${attempt + 1}`);
        const accounts = await web3Accounts();
        debugLog(`Found ${accounts.length} accounts`);
        return accounts;
      } catch (error) {
        debugLog(`Failed to load accounts on attempt ${attempt + 1}:`, error);
        attempt++;
        
        // Wait before retrying
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    return [];
  };

  // Connect to the extension
  const connectExtension = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      debugLog('Connecting to Polkadot extension...');
      
      // First check if extension is installed
      const isExtensionAvailable = await checkExtension();
      
      if (!isExtensionAvailable) {
        throw new Error('No Polkadot extension found. Please install the Polkadot.js extension.');
      }
      
      // Load accounts with retry mechanism
      const accounts = await loadAccounts();
      
      // Add a small delay to ensure the authorization prompt is processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Try loading accounts again if none were found on first attempt
      const finalAccounts = accounts.length === 0 ? await loadAccounts(2) : accounts;
      
      if (finalAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in the Polkadot.js extension.');
      }
      
      debugLog('Extension connected successfully with accounts:', finalAccounts);
      
      setStatus({
        isReady: true,
        accounts: finalAccounts,
        error: null,
        selectedAccount: finalAccounts[0],
        isLoading: false,
      });
      
      return { success: true, accounts: finalAccounts };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Polkadot extension';
      debugLog('Connection error:', errorMessage);
      
      setStatus(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  // Manual account refresh function
  const refreshAccounts = async () => {
    if (!status.isReady) {
      try {
        // Try reconnecting from scratch if not ready
        debugLog('Extension not ready, attempting to connect...');
        return await connectExtension();
      } catch (error) {
        debugLog('Error connecting extension on refresh:', error);
        return { success: false, error: 'Failed to connect extension' };
      }
    }
    
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      debugLog('Manually refreshing accounts...');
      const accounts = await loadAccounts();
      
      if (accounts.length === 0) {
        const errorMsg = 'No accounts found after refresh';
        setStatus(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        return { success: false, error: errorMsg };
      }
      
      // Maintain selected account if it still exists
      const currentSelected = status.selectedAccount;
      const newSelected = currentSelected 
        ? accounts.find(acc => acc.address === currentSelected.address) || accounts[0]
        : accounts[0];
      
      setStatus(prev => ({
        ...prev,
        accounts,
        selectedAccount: newSelected,
        isLoading: false,
        error: null
      }));
      
      return { success: true, accounts };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to refresh accounts';
      debugLog('Error refreshing accounts:', error);
      setStatus(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  };

  const selectAccount = (address: string) => {
    const account = status.accounts.find(acc => acc.address === address);
    if (account) {
      debugLog('Selected account:', account.address);
      setStatus(prev => ({ ...prev, selectedAccount: account }));
      return true;
    }
    return false;
  };
  
  // Get the signer for a specific address (needed for transactions)
  const getSigner = async (address: string) => {
    try {
      debugLog('Getting signer for address:', address);
      const injector = await web3FromAddress(address);
      return { success: true, signer: injector.signer };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get signer';
      debugLog('Error getting signer:', errorMessage);
      setStatus(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Check for extension on initial load, but don't auto-connect
  useEffect(() => {
    const checkForExtension = async () => {
      const isAvailable = await checkExtension();
      debugLog(`Extension availability check: ${isAvailable ? 'Available' : 'Not available'}`);
    };
    
    checkForExtension();
  }, []);

  return {
    ...status,
    connectExtension,
    refreshAccounts,
    selectAccount,
    getSigner,
  };
}; 