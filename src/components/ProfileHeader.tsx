import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User, Mail, Calendar, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { authAPI, usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileHeader() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    full_name: '',
    bio: '',
    avatar_url: ''
  });
  const [stats, setStats] = useState({
    eventsAttended: 0,
    activeTickets: 0,
    reviewsGiven: 0
  });
  const { toast } = useToast();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authAPI.getProfile();
        setUser(response.user);
        setEditForm({
          name: response.user.name || '',
          full_name: response.user.full_name || '',
          bio: response.user.bio || '',
          avatar_url: response.user.avatar_url || ''
        });
        
        // Fetch actual stats from backend
        try {
          const statsResponse = await usersAPI.getUserStats();
          if (statsResponse && statsResponse.success) {
            setStats({
              eventsAttended: statsResponse.data.eventsAttended || 0,
              activeTickets: statsResponse.data.activeTickets || 0,
              reviewsGiven: statsResponse.data.reviewsGiven || 0
            });
          } else {
            // Fallback to default stats if API fails
            setStats({
              eventsAttended: 0,
              activeTickets: 0,
              reviewsGiven: 0
            });
          }
        } catch (statsError) {
          console.error('Error fetching user stats:', statsError);
          // Keep default stats on error
          setStats({
            eventsAttended: 0,
            activeTickets: 0,
            reviewsGiven: 0
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleSaveProfile = async () => {
    try {
      const response = await usersAPI.updateProfile(editForm);
      setUser({ ...user, ...editForm });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      avatar_url: user?.avatar_url || ''
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="card-elevated p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-6"></div>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-32"></div>
              <div className="h-6 bg-muted rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card-elevated p-6 space-y-6">
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground">Unable to load profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveProfile}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <>
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xl">
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{user.name || user.full_name || 'User'}</h3>
                {user.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </div>
              <Badge variant="outline">{user.role || 'Attendee'}</Badge>
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
              <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
            </div>
            {user.bio && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Edit Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={editForm.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xl">
                  {editForm.name ? editForm.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={editForm.avatar_url}
                onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                placeholder="Enter avatar image URL"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
          </div>
        </>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.eventsAttended}</div>
          <div className="text-sm text-muted-foreground">Events Attended</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.activeTickets}</div>
          <div className="text-sm text-muted-foreground">Active Tickets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.reviewsGiven}</div>
          <div className="text-sm text-muted-foreground">Reviews Given</div>
        </div>
      </div>
    </div>
  );
}