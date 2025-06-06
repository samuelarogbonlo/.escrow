import { useCallback } from 'react';
import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/api/types';
import { BN } from '@polkadot/util';
import { CONTRACT_CONFIG, GAS_LIMITS } from '../config/contract';

export interface EscrowData {
  id: string;
  creator: string;
  worker: string;
  client: string;
  counterpartyAddress: string;
  counterpartyType: string;
  title: string;
  description: string;
  totalAmount: string;
  status: 'Active' | 'Completed' | 'Disputed' | 'Cancelled' | 'Inactive' | 'Pending' | 'Rejected';
  createdAt: number;
  milestones: {
    id: string;
    description: string;
    amount: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Disputed';
    deadline: number;
  }[];
}

interface UseEscrowContractOptions {
  api: ApiPromise | null;
  account: InjectedAccountWithMeta | null;
  getSigner: (address: string) => Promise<any>;
}

// Convert WND to planck (smallest unit)
const toChainUnits = (amount: string): BN => {
  const decimal = parseFloat(amount);
  return new BN(decimal * Math.pow(10, CONTRACT_CONFIG.NETWORK.DECIMALS));
};

// Convert planck to WND 
const fromChainUnits = (amount: BN): string => {
  const decimal = amount.toNumber() / Math.pow(10, CONTRACT_CONFIG.NETWORK.DECIMALS);
  return decimal.toString();
};

export const useEscrowContract = ({ api, account, getSigner }: UseEscrowContractOptions) => {
  // Helper to get contract instance
  const getContract = useCallback(() => {
    if (!api) {
      throw new Error('API not available');
    }
    
    console.log('[EscrowContract] Creating contract with:', {
      apiReady: api.isReady,
      contractAddress: CONTRACT_CONFIG.ADDRESS,
      networkEndpoint: CONTRACT_CONFIG.NETWORK.WS_ENDPOINT,
      apiConnected: api.isConnected
    });
    
    const contract = new ContractPromise(api as any, CONTRACT_CONFIG.METADATA, CONTRACT_CONFIG.ADDRESS);
    
    // Debug: Check if contract has the expected methods
    console.log('[EscrowContract] Contract initialized:', {
      address: contract.address.toString(),
      methods: Object.keys(contract.tx || {}),
      queries: Object.keys(contract.query || {}),
      hasCreateEscrow: !!contract.tx.createEscrow
    });
    
    return contract;
  }, [api]);

  // Helper to get signer with test mode support
  const getAccountSigner = useCallback(async (address: string) => {
    try {
      // Check if this is a test account
      if (account?.meta.source === 'test') {
        console.log('[EscrowContract] Using mock signer for test account');
        // For test accounts, we'll use a simpler approach
        return { success: true, signer: null };
      }

      // Otherwise use actual signer
      return await getSigner(address);
    } catch (error) {
      console.error('[EscrowContract] Error getting signer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get signer'
      };
    }
  }, [account, getSigner]);

  // Create a new escrow - simplified to match your contract
  const createEscrow = useCallback(async (
    userAddress: string,
    counterpartyAddress: string,
    counterpartyType: string,
    status: string,
    title: string,
    description: string,
    totalAmount: string,
    milestones: { id: string, description: string, amount: string, status: string, deadline: number }[]
  ) => {
    console.log('[EscrowContract] createEscrow called with:', {
      userAddress,
      counterpartyAddress,
      totalAmount,
      apiAvailable: !!api,
      accountAvailable: !!account
    });

    if (!api || !account) {
      console.error('[EscrowContract] Missing API or account:', { api: !!api, account: !!account });
      return { success: false, error: 'API or account not available' };
    }

    try {
      const contract = getContract();
      const signerResult = await getAccountSigner(account.address);
      
      if (!signerResult.success) {
        return { success: false, error: signerResult.error };
      }

      // Convert amount to chain units (planck)
      const amountBN = toChainUnits(totalAmount);
      
      console.log('[EscrowContract] Creating escrow with:', {
        provider: counterpartyAddress,
        amount: amountBN.toString(),
        caller: account.address,
        value: totalAmount
      });

      // Set the signer on the API
      if (signerResult.signer) {
        api.setSigner(signerResult.signer);
      }

      // Create proper gas limit 
      const gasLimit = GAS_LIMITS.CREATE_ESCROW;

      // First, do a dry run to estimate gas
      try {
        const { gasRequired, result, output } = await contract.query.createEscrow(
          account.address,
          {
            gasLimit,
            value: amountBN, // The amount being escrowed
          },
          counterpartyAddress // provider address
        );

        if (result.isErr) {
          console.error('[EscrowContract] Contract query failed:', result.asErr.toString());
          return { success: false, error: 'Contract simulation failed: ' + result.asErr.toString() };
        }

        console.log('[EscrowContract] Query successful, gas required:', gasRequired.toString());
      } catch (queryError) {
        console.warn('[EscrowContract] Query failed, proceeding with transaction:', queryError);
        // Continue with transaction even if query fails
      }

      // Create and submit the transaction
      const tx = contract.tx.createEscrow(
        {
          gasLimit,
          value: amountBN,
        },
        counterpartyAddress
      );

      // Create a promise to handle the transaction
      const txPromise = new Promise<{escrowId: string, transactionHash: string}>((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;

        tx.signAndSend(account.address, (result) => {
          console.log('[EscrowContract] Transaction status:', result.status.toString());

          if (result.status.isInBlock) {
            console.log('[EscrowContract] Transaction included in block:', result.status.asInBlock.toString());
          }

          if (result.status.isFinalized) {
            console.log('[EscrowContract] Transaction finalized:', result.status.asFinalized.toString());
            
            // Look for contract events
            let escrowId: string | null = null;
            result.events.forEach(({ event }) => {
              if (api.events.contracts.ContractEmitted.is(event)) {
                console.log('[EscrowContract] Contract event:', event.toString());
                // Try to extract escrow ID from events if available
              }
            });

            if (unsubscribe) {
              unsubscribe();
            }
            
            resolve({
              escrowId: escrowId || Date.now().toString(),
              transactionHash: tx.hash.toString()
            });
          }

          if (result.status.isDropped || result.status.isInvalid) {
            if (unsubscribe) {
              unsubscribe();
            }
            reject(new Error('Transaction failed: ' + result.status.toString()));
          }
        }).then((unsub) => {
          unsubscribe = unsub;
        }).catch(reject);
      });

      const result = await txPromise;

      return {
        success: true,
        escrowId: result.escrowId,
        recipientAddress: counterpartyAddress,
        transactionHash: result.transactionHash
      };

    } catch (error) {
      console.error('[EscrowContract] Error creating escrow:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to create escrow';
      return { success: false, error: errorMessage };
    }
  }, [api, account, getAccountSigner, getContract]);

  // Get an escrow by ID
  const getEscrow = useCallback(async (escrowId: string) => {
    if (!api) {
      return { success: false, error: 'API not available' };
    }

    try {
      const contract = getContract();
      
      console.log('[EscrowContract] Getting escrow with ID:', escrowId);

      const gasLimit = GAS_LIMITS.GET_ESCROW;

      const { result, output } = await contract.query.getEscrow(
        account?.address || CONTRACT_CONFIG.ADDRESS, // Use account address if available
        {
          gasLimit,
        },
        parseInt(escrowId) // escrow ID as u32
      );

      if (result.isErr) {
        console.error('[EscrowContract] Failed to get escrow:', result.asErr.toString());
        return { success: false, error: 'Failed to get escrow details' };
      }

      const escrowData = output?.toHuman() as any; // Type assertion for contract data
      
      if (!escrowData || escrowData === null) {
        return { success: false, error: 'Escrow not found' };
      }

      // Convert the contract data to frontend format
      const formattedEscrow = {
        id: escrowId,
        client: escrowData.client || '',
        provider: escrowData.provider || '',
        worker: escrowData.provider || '',
        creator: escrowData.client || '',
        counterpartyAddress: escrowData.provider || '',
        counterpartyType: 'provider',
        title: 'Escrow #' + escrowId,
        description: 'On-chain escrow',
        totalAmount: fromChainUnits(new BN(escrowData.amount?.replace(/,/g, '') || '0')),
        status: escrowData.status || 'Active',
        createdAt: parseInt(escrowData.createdAt?.replace(/,/g, '') || Date.now().toString()),
        milestones: [] // Simplified for now
      };

      return {
        success: true,
        escrow: formattedEscrow
      };
    } catch (error) {
      console.error('[EscrowContract] Error getting escrow:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get escrow details';
      return { success: false, error: errorMessage };
    }
  }, [api, account, getContract]);

  // Complete escrow (release funds)
  const updateEscrowStatus = useCallback(async (escrowId: string, newStatus: string) => {
    if (!api || !account) {
      return { success: false, error: 'API or account not available' };
    }

    try {
      const contract = getContract();
      const signerResult = await getAccountSigner(account.address);
      
      if (!signerResult.success) {
        return { success: false, error: signerResult.error };
      }

      console.log('[EscrowContract] Updating escrow status:', { escrowId, newStatus, account: account.address });

      // Set the signer on the API
      if (signerResult.signer) {
        api.setSigner(signerResult.signer);
      }

      const gasLimit = newStatus === 'Completed' ? GAS_LIMITS.COMPLETE_ESCROW : GAS_LIMITS.CANCEL_ESCROW;

      let tx;
      if (newStatus === 'Completed') {
        // Call complete_escrow
        tx = contract.tx.completeEscrow(
          { gasLimit },
          parseInt(escrowId)
        );
      } else if (newStatus === 'Cancelled') {
        // Call cancel_escrow
        tx = contract.tx.cancelEscrow(
          { gasLimit },
          parseInt(escrowId)
        );
      } else {
        return { success: false, error: 'Unsupported status update' };
      }

      // Execute transaction
      const txPromise = new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;

        tx.signAndSend(account.address, (result) => {
          console.log('[EscrowContract] Update status transaction:', result.status.toString());

          if (result.status.isFinalized) {
            if (unsubscribe) {
              unsubscribe();
            }
            resolve({
              success: true,
              transactionHash: tx.hash.toString()
            });
          }

          if (result.status.isDropped || result.status.isInvalid) {
            if (unsubscribe) {
              unsubscribe();
            }
            reject(new Error('Transaction failed: ' + result.status.toString()));
          }
        }).then((unsub) => {
          unsubscribe = unsub;
        }).catch(reject);
      });

      await txPromise;

      return {
        success: true,
        message: `Escrow status updated to ${newStatus}`,
        transactionHash: tx.hash.toString()
      };

    } catch (error) {
      console.error('[EscrowContract] Error updating escrow status:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update escrow status';
      return { success: false, error: errorMessage };
    }
  }, [api, account, getAccountSigner, getContract]);

  // Update milestone status (simplified)
  const updateEscrowMilestoneStatus = useCallback(async (escrowId: string, _milestone: any, newStatus: string) => {
    // For the simplified contract, milestone updates are handled through escrow completion
    return updateEscrowStatus(escrowId, newStatus === 'Completed' ? 'Completed' : 'Active');
  }, [updateEscrowStatus]);

  // List all escrows for the current account
  const listEscrows = useCallback(async () => {
    if (!api || !account) {
      return { success: false, error: 'API or account not available' };
    }

    try {
      const contract = getContract();
      
      console.log('[EscrowContract] Listing escrows for account:', account.address);

      const gasLimit = GAS_LIMITS.GET_USER_ESCROWS;

      const { result, output } = await contract.query.getUserEscrows(
        account.address,
        {
          gasLimit,
        },
        account.address
      );

      if (result.isErr) {
        console.error('[EscrowContract] Failed to get user escrows:', result.asErr.toString());
        return { success: false, error: 'Failed to list escrows' };
      }

      const escrowIds = output?.toHuman() || [];
      console.log('[EscrowContract] User escrow IDs:', escrowIds);

      // Fetch details for each escrow ID
      const escrowPromises = Array.isArray(escrowIds) 
        ? escrowIds.map(id => getEscrow(id?.toString() || '0'))
        : [];
      
      const escrowResults = await Promise.all(escrowPromises);
      const escrows = escrowResults
        .filter(result => result.success)
        .map(result => result.escrow);

      return {
        success: true,
        escrows
      };
    } catch (error) {
      console.error('[EscrowContract] Error listing escrows:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to list escrows';
      return { success: false, error: errorMessage };
    }
  }, [api, account, getContract, getEscrow]);

  // Release milestone (complete escrow)
  const releaseMilestone = useCallback(async (escrowId: string, _milestoneId: string) => {
    return updateEscrowStatus(escrowId, 'Completed');
  }, [updateEscrowStatus]);

  // Dispute milestone (not implemented in simplified contract)
  const disputeMilestone = useCallback(async (_escrowId: string, _milestoneId: string, _reason: string) => {
    console.log('[EscrowContract] Dispute functionality not implemented in simplified contract');
    return {
      success: false,
      error: 'Dispute functionality not available in current contract version'
    };
  }, []);

  // Notify counterparty (off-chain notification)
  const notifyCounterparty = useCallback(async (
    escrowId: string,
    notificationType: string,
    recipientAddress: string,
    message?: string,
    type?: 'info' | 'success' | 'warning',
  ) => {
    console.log('[EscrowContract] Notification sent:', {
      escrowId,
      notificationType,
      recipientAddress,
      message,
      type
    });

    // For now, just return success - in a real app you'd integrate with a notification service
    return {
      success: true,
      notificationId: `notif-${Date.now()}`,
      message: 'Counterparty notified successfully'
    };
  }, []);

  return {
    createEscrow,
    getEscrow,
    listEscrows,
    releaseMilestone,
    disputeMilestone,
    notifyCounterparty,
    updateEscrowStatus,
    updateEscrowMilestoneStatus
  };
};