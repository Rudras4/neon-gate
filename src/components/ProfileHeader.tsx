import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User, Mail, Calendar } from "lucide-react";

export function ProfileHeader() {
  // Mock user data - replace with actual user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Attendee",
    joinedDate: "January 2024",
    avatar: "/placeholder.svg",
    verified: true
  };

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Avatar and Basic Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xl">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{user.name}</h3>
            {user.verified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            )}
          </div>
          <Badge variant="outline">{user.role}</Badge>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Joined {user.joinedDate}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-sm text-muted-foreground">Events Attended</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">3</div>
          <div className="text-sm text-muted-foreground">Active Tickets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">5</div>
          <div className="text-sm text-muted-foreground">Reviews Given</div>
        </div>
      </div>
    </div>
  );
}