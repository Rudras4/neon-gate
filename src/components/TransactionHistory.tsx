import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Calendar, GasPump, Hash } from 'lucide-react';
import { transactionTracker, TransactionDetails } from '@/lib/transactionTracker';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const { account } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    // Load transactions from storage
    transactionTracker.loadFromStorage();
    setTransactions(transactionTracker.getTransactions());
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getTransactionTypeColor = (type: TransactionDetails['type']) => {
    switch (type) {
      case 'EVENT_CREATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TICKET_PURCHASE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TICKET_RESALE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TICKET_BUY_RESALE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: string) => {
    const ethValue = parseFloat(value) / 1e18;
    return ethValue.toFixed(6);
  };

  const formatGas = (gasUsed: string, gasPrice: string) => {
    const gasUsedNum = parseFloat(gasUsed);
    const gasPriceNum = parseFloat(gasPrice) / 1e9; // Convert from wei to gwei
    const totalGasCost = (gasUsedNum * gasPriceNum * 1e9) / 1e18; // Convert to ETH
    return totalGasCost.toFixed(6);
  };

  const getTransactionTypeLabel = (type: TransactionDetails['type']) => {
    switch (type) {
      case 'EVENT_CREATION':
        return 'Event Creation';
      case 'TICKET_PURCHASE':
        return 'Ticket Purchase';
      case 'TICKET_RESALE':
        return 'Ticket Resale';
      case 'TICKET_BUY_RESALE':
        return 'Buy Resale Ticket';
      default:
        return type;
    }
  };

  const filteredTransactions = account 
    ? transactionTracker.getTransactionsByAddress(account)
    : transactions;

  if (filteredTransactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No transactions found. Start by creating an event or purchasing tickets!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Transaction History
          {account && (
            <Badge variant="secondary">
              {filteredTransactions.length} transactions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredTransactions.map((tx, index) => (
          <div key={tx.txHash} className="border rounded-lg p-4 space-y-3">
            {/* Transaction Header */}
            <div className="flex items-center justify-between">
              <Badge className={getTransactionTypeColor(tx.type)}>
                {getTransactionTypeLabel(tx.type)}
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(tx.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Transaction Hash */}
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-sm text-gray-600">
                {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(tx.txHash)}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">From:</span>
                <span className="ml-2 font-mono">
                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">To:</span>
                <span className="ml-2 font-mono">
                  {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Contract'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Value:</span>
                <span className="ml-2 font-semibold">
                  {formatValue(tx.value)} ETH
                </span>
              </div>
              <div>
                <span className="text-gray-500">Gas Used:</span>
                <span className="ml-2">
                  {parseInt(tx.gasUsed).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Gas Cost */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GasPump className="h-4 w-4" />
              <span>
                Gas Cost: {formatGas(tx.gasUsed, tx.gasPrice)} ETH
              </span>
            </div>

            {/* Block Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Block #{tx.blockNumber}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
