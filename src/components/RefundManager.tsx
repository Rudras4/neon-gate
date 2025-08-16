import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { paymentsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface RefundRequest {
  id: string;
  ticketId: string;
  eventTitle: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  createdAt: string;
}

interface RefundManagerProps {
  userId: string;
}

export function RefundManager({ userId }: RefundManagerProps) {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch refund requests from backend
  useEffect(() => {
    const fetchRefundRequests = async () => {
      try {
        setIsLoading(true);
        const response = await paymentsAPI.getRefundRequests() as any;
        if (response && response.success) {
          setRefundRequests(response.refunds || []);
        } else {
          setRefundRequests([]); // Empty if API fails
        }
      } catch (error) {
        console.error('Error fetching refund requests:', error);
        setRefundRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRefundRequests();
  }, [userId]);

  const handleRequestRefund = async (ticketId: string) => {
    if (!refundReason.trim()) {
      toast({
        title: "Missing Reason",
        description: "Please provide a reason for the refund request",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await paymentsAPI.requestRefund(ticketId, refundReason) as any;
      
      if (response.success) {
        toast({
          title: "Refund Requested",
          description: "Your refund request has been submitted successfully",
        });
        
        // Add to local state
        const newRequest: RefundRequest = {
          id: response.refundId,
          ticketId,
          eventTitle: "Event Title", // Get from context
          amount: "0", // Get from context
          status: 'pending',
          reason: refundReason,
          createdAt: new Date().toISOString()
        };
        
        setRefundRequests(prev => [newRequest, ...prev]);
        setRefundReason("");
        setSelectedRequest(null);
      } else {
        toast({
          title: "Request Failed",
          description: response.error || "Failed to submit refund request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Refund request error:', error);
      toast({
        title: "Request Failed",
        description: "An error occurred while submitting the refund request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: RefreshCw, text: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Refund Management
        </CardTitle>
        <CardDescription>
          Request refunds for your tickets and track refund status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Refund Request Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-background/50">
          <h3 className="text-lg font-semibold">Request Refund</h3>
          <div className="space-y-3">
            <Input
              placeholder="Ticket ID or select from your tickets"
              className="bg-background/50 border-border/50"
            />
            <Select value={refundReason} onValueChange={setRefundReason}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Select refund reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule-conflict">Schedule Conflict</SelectItem>
                <SelectItem value="event-cancelled">Event Cancelled</SelectItem>
                <SelectItem value="venue-change">Venue Change</SelectItem>
                <SelectItem value="personal-emergency">Personal Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {refundReason === 'other' && (
              <Textarea
                placeholder="Please specify the reason..."
                className="bg-background/50 border-border/50"
              />
            )}
            <Button
              onClick={() => handleRequestRefund("ticket-123")}
              disabled={isProcessing || !refundReason}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Request Refund"
              )}
            </Button>
          </div>
        </div>

        {/* Refund Requests List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Refund Requests</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-muted-foreground">Loading refund requests...</span>
              </div>
            ) : refundRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No refund requests found</p>
              </div>
            ) : (
              refundRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg bg-background/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{request.eventTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      Ticket: {request.ticketId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{request.amount} AVAX</p>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="text-sm">
                  <p><strong>Reason:</strong> {request.reason}</p>
                  <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Cancel Request
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Update Reason
                    </Button>
                  </div>
                )}
                              </div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Refund requests are reviewed within 24-48 hours</p>
          <p>• Approved refunds are processed within 3-5 business days</p>
          <p>• Event cancellation refunds are processed automatically</p>
        </div>
      </CardContent>
    </Card>
  );
}
