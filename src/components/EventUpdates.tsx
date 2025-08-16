import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, Mail } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import pushNotifications from "@/lib/pushNotifications";

interface EventUpdatesProps {
  eventId: string;
  eventTitle: string;
  attendeeCount: number;
}

export function EventUpdates({ eventId, eventTitle, attendeeCount }: EventUpdatesProps) {
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  // Check notification permission on mount
  useEffect(() => {
    setNotificationPermission(pushNotifications.getPermissionStatus());
  }, []);

  const requestNotificationPermission = async () => {
    const granted = await pushNotifications.requestPermission();
    setNotificationPermission(pushNotifications.getPermissionStatus());
    
    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for event updates",
      });
    } else {
      toast({
        title: "Notifications Disabled",
        description: "You can enable notifications in your browser settings",
        variant: "destructive",
      });
    }
  };

  const handleSendUpdate = async () => {
    if (!updateTitle.trim() || !updateMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await notificationsAPI.sendEventUpdate(eventId, {
        title: updateTitle,
        message: updateMessage,
        timestamp: new Date().toISOString()
      });

      // Show push notification to organizer
      await pushNotifications.showEventUpdate(eventTitle, updateMessage);

      toast({
        title: "Update Sent",
        description: `Event update sent to ${attendeeCount} attendees`,
      });

      // Reset form
      setUpdateTitle("");
      setUpdateMessage("");
    } catch (error) {
      console.error('Failed to send event update:', error);
      toast({
        title: "Failed to Send",
        description: "Could not send event update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Event Updates & Communications
        </CardTitle>
        <CardDescription>
          Send important updates to all event attendees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{attendeeCount} attendees will receive this update</span>
          </div>
          
          {notificationPermission !== 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
              className="text-xs"
            >
              Enable Notifications
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Update title (e.g., Venue Change, Time Update)"
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
            className="bg-background/50 border-border/50"
          />
          
          <Textarea
            placeholder="Detailed message for attendees..."
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            className="bg-background/50 border-border/50 min-h-[100px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>Update will be sent via email</span>
          </div>
          
          <Button
            onClick={handleSendUpdate}
            disabled={isSending || !updateTitle.trim() || !updateMessage.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Update
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Updates are sent immediately to all registered attendees</p>
          <p>• Use this for important changes like venue, time, or cancellation</p>
          <p>• Attendees can opt out of notifications in their profile settings</p>
        </div>
      </CardContent>
    </Card>
  );
}
