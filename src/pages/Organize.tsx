import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Calendar, MapPin, Users, DollarSign, Loader2 } from 'lucide-react';

const Organize = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    venue: '',
    spline3dUrl: '',
    capacity: '',
    price: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create events",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background theme-transition flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Creating event with token:', token.substring(0, 20) + '...');
      
      // Prepare event data for backend
      const eventData = {
        title: formData.title,
        description: formData.description,
        longDescription: formData.description,
        category: formData.category,
        eventType: formData.category,
        startDate: formData.date,
        endDate: formData.date,
        date: formData.date,
        location: formData.venue || '',
        venueName: formData.venue || '',
        venueAddress: formData.venue || '',
        venueCity: '',
        venueState: '',
        venueCountry: '',
        venuePostalCode: '',
        latitude: null,
        longitude: null,
        venue: formData.venue || '',
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        imageUrl: '',
        imageGallery: '',
        spline3dUrl: formData.spline3dUrl || '',
        status: 'draft'
      };

      console.log('Event data being sent:', eventData);
      await eventsAPI.create(eventData);
      
      toast({
        title: "Success",
        description: "Event created successfully! Redirecting to events page...",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        venue: '',
        spline3dUrl: '',
        capacity: '',
        price: ''
      });

      // Redirect to events page after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 2000);

    } catch (error) {
      console.error('Error creating event:', error);
      
      // More detailed error handling
      let errorMessage = "Failed to create event. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.message.includes('403')) {
          errorMessage = "Access denied. You don't have permission to create events.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Limit description to 500 characters
    if (field === 'description' && value.length > 500) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Organize Your Event
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create amazing events and connect with your audience through TicketChain. 
              Fill out the form below to get started with your event creation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-border/20 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-primary" />
                      Event Details
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-medium">Authenticated</span>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    Fill in the details below to create your event. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="title" className="text-sm font-medium">
                          Event Title *
                        </Label>
                        <Input
                          id="title"
                          placeholder="e.g., Summer Music Festival 2024"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm font-medium">
                          Category *
                        </Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary transition-colors">
                            <SelectValue placeholder="Choose event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concert">🎵 Concert & Music</SelectItem>
                            <SelectItem value="sports">⚽ Sports & Fitness</SelectItem>
                            <SelectItem value="cultural">🎭 Cultural & Arts</SelectItem>
                            <SelectItem value="workshop">🔧 Workshop & Learning</SelectItem>
                            <SelectItem value="comedy">😂 Comedy & Entertainment</SelectItem>
                            <SelectItem value="corporate">💼 Corporate & Business</SelectItem>
                            <SelectItem value="food">🍕 Food & Drink</SelectItem>
                            <SelectItem value="technology">💻 Technology & Innovation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Tell attendees what to expect from your event. Include key highlights, special features, and what makes it unique..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.description.length}/500 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="date" className="text-sm font-medium">
                          Date & Time *
                        </Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          required
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="venue" className="text-sm font-medium">
                          Venue Name
                        </Label>
                        <Input
                          id="venue"
                          placeholder="e.g., Central Park, Convention Center"
                          value={formData.venue}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="spline3dUrl" className="text-sm font-medium">
                        Spline 3D URL (Optional)
                      </Label>
                      <Input
                        id="spline3dUrl"
                        type="url"
                        placeholder="e.g., https://my-spline.com/model.spline"
                        value={formData.spline3dUrl}
                        onChange={(e) => handleInputChange('spline3dUrl', e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add a link to a 3D model for a more immersive experience. This will be displayed in the 3D Stadium View tab on your event page.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="capacity" className="text-sm font-medium">
                          Maximum Capacity
                        </Label>
                        <Input
                          id="capacity"
                          type="number"
                          min="1"
                          placeholder="e.g., 100"
                          value={formData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty for unlimited capacity
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="price" className="text-sm font-medium">
                          Ticket Price (₹)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 500.00"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter 0 for free events
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-lg font-semibold py-6"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Event...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-5 w-5" />
                            Create Event
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Your event will be created as a draft. You can edit and publish it later.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Event Planning Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Choose a clear, descriptive title that captures attention
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Provide detailed event information and highlights
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Set realistic pricing and capacity limits
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Include venue details and directions for attendees
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Add 3D models for immersive venue previews
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Audience Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Use social media to promote your event effectively
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Create engaging event descriptions with visuals
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Offer early bird discounts to drive early sales
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Provide clear event updates and communication
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Pricing Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Research similar events in your area for competitive pricing
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Consider your target audience's budget and expectations
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Factor in venue and production costs for profitability
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      Offer multiple ticket tiers to maximize attendance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Organize;
