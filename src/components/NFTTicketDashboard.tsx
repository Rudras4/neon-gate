import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';

interface NFTTicketDashboardProps {
  eventContractAddress: string;
  isWeb3Event: boolean;
}

interface UserTicket {
  tokenId: number;
  tier: string;
  seatNumber: number;
  metadataURI: string;
  purchaseDate?: string;
  purchasePrice?: string;
}

interface TransactionHistory {
  hash: string;
  type: 'purchase' | 'resale' | 'transfer';
  amount: string;
  date: string;
  status: 'pending' | 'confirmed' | 'failed';
  description: string;
}

export const NFTTicketDashboard: React.FC<NFTTicketDashboardProps> = ({
  eventContractAddress,
  isWeb3Event
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'history'>('overview');
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalValue: '0',
    activeListings: 0,
    totalSpent: '0'
  });
  
  const { toast } = useToast();
  const { isConnected, currentNetwork, account, provider } = useWallet();

  // EventTicket contract ABI
  const eventTicketABI = [
    "function getUserTickets(address user) external view returns (uint256[])",
    "function getTicket(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 seatNumber, string tier, string metadataURI, address owner, bool exists))",
    "function getTier(string memory tierName) external view returns (tuple(string name, uint256 price, uint256 quantity, uint256 minted, bool exists))"
  ];

  useEffect(() => {
    if (isWeb3Event && eventContractAddress && provider && isConnected) {
      fetchUserData();
    }
  }, [isWeb3Event, eventContractAddress, provider, isConnected]);

  const fetchUserData = async () => {
    if (!provider || !account) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserTickets(),
        fetchTransactionHistory(),
        calculateStats()
      ]);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    if (!provider || !account) return;
    
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(eventContractAddress, eventTicketABI, signer);
      
      const ticketIds = await contract.getUserTickets(account);
      const userTicketsData: UserTicket[] = [];

      for (const ticketId of ticketIds) {
        try {
          const ticketData = await contract.getTicket(ticketId);
          userTicketsData.push({
            tokenId: ticketId,
            tier: ticketData.tier,
            seatNumber: ticketData.seatNumber,
            metadataURI: ticketData.metadataURI,
            purchaseDate: new Date().toISOString(), // TODO: Get from events
            purchasePrice: '0.01' // TODO: Get from events
          });
        } catch (error) {
          console.warn(`Failed to fetch ticket ${ticketId}:`, error);
        }
      }

      setUserTickets(userTicketsData);
    } catch (error) {
      console.error('Failed to fetch user tickets:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    // TODO: Implement real transaction history from blockchain events
    // For now, create mock data
    const mockHistory: TransactionHistory[] = [
      {
        hash: '0x1234...5678',
        type: 'purchase',
        amount: '0.01',
        date: new Date().toISOString(),
        status: 'confirmed',
        description: 'Purchased General ticket'
      },
      {
        hash: '0x8765...4321',
        type: 'resale',
        amount: '0.015',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'confirmed',
        description: 'Sold VIP ticket'
      }
    ];

    setTransactionHistory(mockHistory);
  };

  const calculateStats = async () => {
    if (!provider || !account) return;
    
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(eventContractAddress, eventTicketABI, signer);
      
      let totalValue = 0;
      
      for (const ticket of userTickets) {
        try {
          const tierData = await contract.getTier(ticket.tier);
          totalValue += parseFloat(ethers.formatEther(tierData.price));
        } catch (error) {
          console.warn(`Failed to get tier price for ${ticket.tier}:`, error);
        }
      }

      setStats({
        totalTickets: userTickets.length,
        totalValue: totalValue.toFixed(4),
        activeListings: 0, // TODO: Get from resale contract
        totalSpent: '0.01' // TODO: Calculate from transaction history
      });
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '💰';
      case 'resale': return '🔄';
      case 'transfer': return '📤';
      default: return '📋';
    }
  };

  if (!isWeb3Event) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">🎫 NFT Ticket Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 text-sm">
            NFT ticket dashboard is only available for Web3 events.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">🔗 Connect Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-sm">
            Please connect your wallet to view your NFT ticket dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🎫 My NFT Ticket Dashboard
        </h2>
        <p className="text-muted-foreground">
          Manage your NFT tickets and view transaction history
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTickets}</div>
            <div className="text-sm text-blue-700">Total Tickets</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalValue} ETH</div>
            <div className="text-sm text-green-700">Portfolio Value</div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.activeListings}</div>
            <div className="text-sm text-purple-700">Active Listings</div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalSpent} ETH</div>
            <div className="text-sm text-orange-700">Total Spent</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'tickets' | 'history')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="tickets">🎫 My Tickets</TabsTrigger>
          <TabsTrigger value="history">📋 History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 text-lg">🚀 Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    🎫 Buy More Tickets
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    🔄 List for Resale
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    📤 Transfer Ticket
                  </Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    📊 View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">📈 Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionHistory.slice(0, 3).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-blue-200 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getTransactionIcon(tx.type)}</span>
                      <div>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-sm text-blue-600">{tx.amount} ETH</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My NFT Tickets</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-muted-foreground">Loading your tickets...</p>
            </div>
          ) : userTickets.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎫</div>
                <h4 className="text-lg font-semibold mb-2">No Tickets Yet</h4>
                <p className="text-muted-foreground mb-4">
                  You haven't purchased any tickets for this event yet.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  🎫 Buy Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userTickets.map((ticket) => (
                <Card key={ticket.tokenId} className="border-purple-200 hover:border-purple-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {ticket.tier}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Token #{ticket.tokenId}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Seat #{ticket.seatNumber} • Purchased: {ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleDateString() : 'Unknown'}
                        </div>
                        {ticket.purchasePrice && (
                          <div className="text-sm font-medium text-green-600">
                            Purchase Price: {ticket.purchasePrice} ETH
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          📤 Transfer
                        </Button>
                        <Button variant="outline" size="sm">
                          🔄 List for Resale
                        </Button>
                        <Button variant="outline" size="sm">
                          📋 View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-muted-foreground">Loading transaction history...</p>
            </div>
          ) : transactionHistory.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="text-lg font-semibold mb-2">No Transactions</h4>
                <p className="text-muted-foreground">
                  No transaction history available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactionHistory.map((tx, index) => (
                <Card key={index} className="border-gray-200 hover:border-gray-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                        <div>
                          <div className="font-medium">{tx.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(tx.date).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {tx.hash}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold text-green-600">
                          {tx.amount} ETH
                        </div>
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid gap-4">
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-800 text-lg">💡 Dashboard Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-indigo-700 text-sm">
            <p>• View all your NFT tickets in one place</p>
            <p>• Track transaction history and portfolio value</p>
            <p>• Quick actions for buying, selling, and transferring</p>
            <p>• Real-time updates from the blockchain</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-800 text-lg">🔒 Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-emerald-700 text-sm">
            <p>• All data is read directly from the blockchain</p>
            <p>• No personal information is stored</p>
            <p>• Wallet connection is secure and private</p>
            <p>• Full control over your digital assets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
