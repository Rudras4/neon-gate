import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';

export const NFTTicketDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const { toast } = useToast();
  const { isConnected, currentNetwork, account } = useWallet();

  const demoSteps = [
    {
      id: 1,
      title: "🎭 Create Web3 Event",
      description: "Deploy smart contract for event with tier pricing",
      action: "Create Event",
      completed: false
    },
    {
      id: 2,
      title: "💰 User 1 Buys Ticket",
      description: "Purchase General tier ticket for 0.01 ETH",
      action: "Buy Ticket",
      completed: false
    },
    {
      id: 3,
      title: "💰 User 2 Buys Ticket",
      description: "Purchase VIP tier ticket for 0.02 ETH",
      action: "Buy Ticket",
      completed: false
    },
    {
      id: 4,
      title: "📝 User 1 Lists for Resale",
      description: "List ticket on resale marketplace for 0.015 ETH",
      action: "List for Resale",
      completed: false
    },
    {
      id: 5,
      title: "🔄 User 2 Buys Resale",
      description: "Purchase resale ticket from User 1",
      action: "Buy Resale",
      completed: false
    },
    {
      id: 6,
      title: "✅ Complete!",
      description: "NFT ticket successfully transferred between users",
      action: "View Results",
      completed: false
    }
  ];

  const handleDemoAction = async (step: any) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to test the demo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate the action
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark step as completed
      setDemoStep(prev => Math.min(prev + 1, demoSteps.length));
      
      toast({
        title: "Demo Step Complete!",
        description: `Successfully completed: ${step.title}`,
      });
      
    } catch (error) {
      toast({
        title: "Demo Step Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = () => {
    setDemoStep(1);
    demoSteps.forEach(step => step.completed = false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🎫 NFT Ticket Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          Experience the complete Web3 ticket buying and reselling flow
        </p>
        
        {!isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              🔗 Connect your wallet to start the demo
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✅ Wallet Connected: {account?.substring(0, 10)}... | Network: {currentNetwork}
            </p>
          </div>
        )}
      </div>

      {/* Demo Steps */}
      <div className="grid gap-4">
        {demoSteps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`border-2 transition-all ${
              step.id === demoStep 
                ? 'border-purple-500 bg-purple-50' 
                : step.id < demoStep 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={step.id === demoStep ? "default" : step.id < demoStep ? "secondary" : "outline"}
                      className={
                        step.id === demoStep 
                          ? 'bg-purple-600' 
                          : step.id < demoStep 
                          ? 'bg-green-600' 
                          : ''
                      }
                    >
                      {step.id < demoStep ? '✅' : step.id === demoStep ? '🔄' : '⏳'} Step {step.id}
                    </Badge>
                    {step.id < demoStep && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                <div className="space-x-2">
                  {step.id === demoStep && step.id < 6 ? (
                    <Button
                      onClick={() => handleDemoAction(step)}
                      disabled={isLoading || !isConnected}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Processing...
                        </>
                      ) : (
                        step.action
                      )}
                    </Button>
                  ) : step.id === 6 && step.id === demoStep ? (
                    <Button
                      onClick={resetDemo}
                      variant="outline"
                      className="border-green-500 text-green-700 hover:bg-green-50"
                    >
                      🔄 Reset Demo
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📚 How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">🎭 Event Creation</h4>
            <p className="text-sm">
              Smart contract deployed with tier pricing (General: 0.01 ETH, VIP: 0.02 ETH)
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">💰 Initial Purchase</h4>
            <p className="text-sm">
              Users buy tickets directly from the event organizer, receiving NFT tickets
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">📝 Resale Listing</h4>
            <p className="text-sm">
              Ticket owners can list their tickets on the resale marketplace
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">🔄 P2P Trading</h4>
            <p className="text-sm">
              Other users can buy resale tickets, transferring ownership via smart contract
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>🔧 Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Smart Contracts</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>EventFactory.sol - Creates and deploys event contracts</li>
                <li>EventTicket.sol - Manages ticket minting and ownership</li>
                <li>TicketResale.sol - Handles P2P resale marketplace</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Key Features</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>ERC-721 NFT tickets with seat mapping</li>
                <li>Automatic seat assignment</li>
                <li>Escrow-based resale system</li>
                <li>Platform fee collection (2.5%)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
