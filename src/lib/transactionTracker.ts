export interface TransactionDetails {
  txHash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
  type: 'EVENT_CREATION' | 'TICKET_PURCHASE' | 'TICKET_RESALE' | 'TICKET_BUY_RESALE';
  eventId?: string;
  ticketId?: string;
  metadata?: any;
}

export class TransactionTracker {
  private static instance: TransactionTracker;
  private transactions: TransactionDetails[] = [];

  static getInstance(): TransactionTracker {
    if (!TransactionTracker.instance) {
      TransactionTracker.instance = new TransactionTracker();
    }
    return TransactionTracker.instance;
  }

  async trackTransaction(
    txHash: string,
    type: TransactionDetails['type'],
    metadata?: any
  ): Promise<TransactionDetails> {
    try {
      // Get transaction details from blockchain
      const provider = new (await import('ethers')).JsonRpcProvider('http://127.0.0.1:8545');
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!tx || !receipt) {
        throw new Error('Transaction not found');
      }

      const transaction: TransactionDetails = {
        txHash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value.toString(),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        type,
        metadata
      };

      this.transactions.push(transaction);
      
      // Save to localStorage for persistence
      this.saveToStorage();
      
      return transaction;
    } catch (error) {
      console.error('Error tracking transaction:', error);
      throw error;
    }
  }

  getTransactions(): TransactionDetails[] {
    return this.transactions;
  }

  getTransactionsByType(type: TransactionDetails['type']): TransactionDetails[] {
    return this.transactions.filter(tx => tx.type === type);
  }

  getTransactionsByAddress(address: string): TransactionDetails[] {
    return this.transactions.filter(tx => 
      tx.from.toLowerCase() === address.toLowerCase() || 
      tx.to.toLowerCase() === address.toLowerCase()
    );
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('transactionHistory', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error saving transactions to storage:', error);
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('transactionHistory');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading transactions from storage:', error);
    }
  }
}

export const transactionTracker = TransactionTracker.getInstance();
