import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { eventsAPI, notificationsAPI, mediaAPI, validationAPI } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Calendar, MapPin, Users, DollarSign, Loader2, Wallet, CheckCircle, AlertCircle, Network } from 'lucide-react';

const Organize = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    venue: '',
    spline3dUrl: '',
    capacity: '',
    price: '',
    imageFile: null as File | null,
    imageUrl: '',
    imageGallery: [] as File[]
  });

  // Web3 form data
  const [web3FormData, setWeb3FormData] = useState({
    eventName: '',
    eventDescription: '',
    maxOccupancy: '',
    tierPrices: [''],
    tierNames: [''],
    eventDate: '',
    tierQuantities: ['']
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('traditional');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    isConnected, 
    connectWallet, 
    createEvent: createWeb3Event, 
    isCreatingEvent, 
    currentNetwork,
    account,
    balance
  } = useWallet();

  // Validate Spline 3D URL
  const isValidSplineUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && 
             (urlObj.hostname.includes('spline.design') || 
              urlObj.hostname.includes('my.spline.design') ||
              urlObj.hostname.includes('spline.com'));
    } catch {
      return false;
    }
  };

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

  const handleWeb3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a Web3 event",
        variant: "destructive",
      });
      return;
    }

    if (!web3FormData.eventName || !web3FormData.eventDescription || !web3FormData.eventDate) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare event configuration for smart contract
      const eventConfig = {
        eventName: web3FormData.eventName,
        eventDescription: web3FormData.eventDescription,
        maxOccupancy: web3FormData.maxOccupancy ? parseInt(web3FormData.maxOccupancy) : 0,
        tierPrices: web3FormData.tierPrices.filter(price => price !== '').map(price => parseFloat(price) * 1e18), // Convert to wei
        tierNames: web3FormData.tierNames.filter(name => name !== ''),
        eventDate: Math.floor(new Date(web3FormData.eventDate).getTime() / 1000), // Convert to Unix timestamp
        tierQuantities: web3FormData.tierQuantities.filter(qty => qty !== '').map(qty => parseInt(qty))
      };

      // Create event on blockchain
      const result = await createWeb3Event(eventConfig);
      
      if (result.success) {
        toast({
          title: "Web3 Event Created Successfully!",
          description: `Your event has been deployed on the blockchain. Transaction Hash: ${result.txHash?.substring(0, 10)}...`,
        });

        // Reset form
        setWeb3FormData({
          eventName: '',
          eventDescription: '',
          maxOccupancy: '',
          tierPrices: [''],
          tierNames: [''],
          eventDate: '',
          tierQuantities: ['']
        });

        // Redirect to events page after a short delay
        setTimeout(() => {
          navigate('/events');
        }, 3000);
      } else {
        toast({
          title: "Web3 Event Creation Failed",
          description: result.error || "Failed to create event on blockchain",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Web3 event creation error:', error);
      toast({
        title: "Web3 Event Creation Failed",
        description: "An error occurred while creating the event on blockchain",
        variant: "destructive",
      });
    }
  };

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
        imageUrl: formData.imageUrl || '',
        imageGallery: formData.imageGallery.length > 0 ? formData.imageGallery : (formData.imageFile ? [formData.imageFile] : []),
        spline3dUrl: formData.spline3dUrl || '',
        status: 'draft'
      };

      console.log('Event data being sent:', eventData);
      const createdEvent = await eventsAPI.create(eventData);
      
      // Send confirmation email to organizer
      try {
        await notificationsAPI.sendEmail({
          to: user?.email,
          subject: `Event Created: ${formData.title}`,
          template: 'event-created',
          data: {
            eventTitle: formData.title,
            eventDate: formData.date,
            eventVenue: formData.venue,
            organizerName: user?.name
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the event creation if email fails
      }
      
      toast({
        title: "Success",
        description: "Event created successfully! Check your email for confirmation. Redirecting to events page...",
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
        price: '',
        imageFile: null,
        imageUrl: '',
        imageGallery: []
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="traditional">Traditional</TabsTrigger>
              <TabsTrigger value="web3">Web3</TabsTrigger>
            </TabsList>

            <TabsContent value="traditional">
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
                          <Label htmlFor="eventImage" className="text-sm font-medium">
                            Event Image
                          </Label>
                          <Input
                            id="eventImage"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // File validation
                                const maxSize = 5 * 1024 * 1024; // 5MB
                                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                
                                if (file.size > maxSize) {
                                  toast({
                                    title: "File Too Large",
                                    description: "Please select an image smaller than 5MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                if (!allowedTypes.includes(file.type)) {
                                  toast({
                                    title: "Invalid File Type",
                                    description: "Please select a JPEG, PNG, or WebP image",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                // Upload image to backend
                                try {
                                  const response = await mediaAPI.uploadImage(file, 'event') as any;
                                  if (response && response.success) {
                                    setFormData(prev => ({
                                      ...prev,
                                      imageFile: file,
                                      imageUrl: response.data.imageUrl || URL.createObjectURL(file)
                                    }));
                                    toast({
                                      title: "Image uploaded",
                                      description: "Event image uploaded successfully",
                                    });
                                  } else {
                                    // Fallback to local preview if backend fails
                                    setFormData(prev => ({
                                      ...prev,
                                      imageFile: file,
                                      imageUrl: URL.createObjectURL(file)
                                    }));
                                    toast({
                                      title: "Upload warning",
                                      description: "Image uploaded locally (backend unavailable)",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  console.error('Image upload error:', error);
                                  // Fallback to local preview
                                  setFormData(prev => ({
                                    ...prev,
                                    imageFile: file,
                                    imageUrl: URL.createObjectURL(file)
                                  }));
                                  toast({
                                    title: "Upload failed",
                                    description: "Image uploaded locally (backend error)",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                          />
                          {formData.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={formData.imageUrl} 
                                alt="Preview" 
                                className="w-32 h-24 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Upload an image for your event. Recommended size: 1200x800 pixels.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="imageGallery" className="text-sm font-medium">
                            Additional Images (Optional)
                          </Label>
                          <Input
                            id="imageGallery"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              
                              // File validation
                              const maxSize = 5 * 1024 * 1024; // 5MB
                              const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                              const maxFiles = 5;
                              
                              if (formData.imageGallery.length + files.length > maxFiles) {
                                toast({
                                  title: "Too Many Files",
                                  description: `You can only upload up to ${maxFiles} images`,
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              const validFiles = files.filter(file => {
                                if (file.size > maxSize) {
                                  toast({
                                    title: "File Too Large",
                                    description: `${file.name} is larger than 5MB`,
                                    variant: "destructive",
                                  });
                                  return false;
                                }
                                
                                if (!allowedTypes.includes(file.type)) {
                                  toast({
                                    title: "Invalid File Type",
                                    description: `${file.name} is not a supported image type`,
                                    variant: "destructive",
                                  });
                                  return false;
                                }
                                
                                return true;
                              });
                              
                              setFormData(prev => ({
                                ...prev,
                                imageGallery: [...prev.imageGallery, ...validFiles]
                              }));
                            }}
                            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                          />
                          {formData.imageGallery.length > 0 && (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-muted-foreground">
                                {formData.imageGallery.length} image(s) selected
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {formData.imageGallery.map((file, index) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={`Gallery ${index + 1}`} 
                                      className="w-20 h-16 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          imageGallery: prev.imageGallery.filter((_, i) => i !== index)
                                        }));
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Add up to 5 additional images for your event gallery.
                          </p>
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
                            onChange={(e) => {
                              const url = e.target.value;
                              handleInputChange('spline3dUrl', url);
                              
                              // Validate URL if provided
                              if (url && !isValidSplineUrl(url)) {
                                toast({
                                  title: "Invalid URL",
                                  description: "Please enter a valid Spline 3D model URL",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                              formData.spline3dUrl && !isValidSplineUrl(formData.spline3dUrl) 
                                ? 'border-red-500' 
                                : ''
                            }`}
                          />
                          {formData.spline3dUrl && (
                            <div className="flex items-center gap-2">
                              {isValidSplineUrl(formData.spline3dUrl) ? (
                                <div className="flex items-center gap-2 text-green-600">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs">Valid 3D model URL</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-xs">Invalid URL format</span>
                                </div>
                              )}
                            </div>
                          )}
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
            </TabsContent>

            <TabsContent value="web3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Web3 Form */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader className="border-b border-border/20 pb-6">
                      <div className="flex items-center justify-between mb-4">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          <Wallet className="h-6 w-6 text-primary" />
                          Web3 Event Details
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="font-medium">Wallet Connected</span>
                        </div>
                      </div>
                      <CardDescription className="text-base">
                        Fill in the details below to create your Web3 event. All fields marked with * are required.
                      </CardDescription>
                    </CardHeader>
                                         <CardContent>
                       {/* Wallet Connection Status */}
                       {!isConnected ? (
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
                           <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                           <h3 className="text-lg font-semibold text-blue-800 mb-2">Connect Your Wallet</h3>
                           <p className="text-blue-600 mb-4">
                             To create a Web3 event, you need to connect your MetaMask wallet first.
                           </p>
                           <Button 
                             onClick={connectWallet}
                             className="bg-blue-600 hover:bg-blue-700 text-white"
                           >
                             <Wallet className="h-4 w-4 mr-2" />
                             Connect Wallet
                           </Button>
                         </div>
                       ) : (
                         <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-green-800">
                               <CheckCircle className="h-5 w-5" />
                               <span className="font-medium">Wallet Connected</span>
                             </div>
                             <div className="text-sm text-green-600">
                               {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                             </div>
                           </div>
                           <div className="mt-2 text-xs text-green-600">
                             Network: {currentNetwork} | Balance: {balance ? `${parseFloat(balance).toFixed(4)} AVAX` : 'Loading...'}
                           </div>
                         </div>
                       )}

                       <form onSubmit={handleWeb3Submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventName" className="text-sm font-medium">
                              Event Name *
                            </Label>
                                                         <Input
                               id="web3EventName"
                               placeholder="e.g., CryptoCon 2024"
                               value={web3FormData.eventName}
                               onChange={(e) => setWeb3FormData(prev => ({ ...prev, eventName: e.target.value }))}
                               required
                               disabled={!isConnected}
                               className="bg-background/50 border-border/50 focus:border-primary transition-colors disabled:opacity-50"
                             />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventDescription" className="text-sm font-medium">
                              Event Description *
                            </Label>
                            <Textarea
                              id="web3EventDescription"
                              placeholder="Describe your Web3 event, its purpose, and what attendees can expect."
                              value={web3FormData.eventDescription}
                              onChange={(e) => setWeb3FormData(prev => ({ ...prev, eventDescription: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                              {web3FormData.eventDescription.length}/500 characters
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventDate" className="text-sm font-medium">
                              Event Date & Time *
                            </Label>
                            <Input
                              id="web3EventDate"
                              type="datetime-local"
                              value={web3FormData.eventDate}
                              onChange={(e) => setWeb3FormData(prev => ({ ...prev, eventDate: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3MaxOccupancy" className="text-sm font-medium">
                              Max Occupancy (Optional)
                            </Label>
                            <Input
                              id="web3MaxOccupancy"
                              type="number"
                              min="0"
                              placeholder="e.g., 100"
                              value={web3FormData.maxOccupancy}
                              onChange={(e) => setWeb3FormData(prev => ({ ...prev, maxOccupancy: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty for unlimited capacity
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3TierPrices" className="text-sm font-medium">
                              Tier Prices (₹) (Optional)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {web3FormData.tierPrices.map((price, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={`Tier ${index + 1} Price`}
                                    value={price}
                                    onChange={(e) => {
                                      const newPrices = [...web3FormData.tierPrices];
                                      newPrices[index] = e.target.value;
                                      setWeb3FormData(prev => ({ ...prev, tierPrices: newPrices }));
                                    }}
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setWeb3FormData(prev => ({
                                        ...prev,
                                        tierPrices: prev.tierPrices.filter((_, i) => i !== index)
                                      }));
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setWeb3FormData(prev => ({ ...prev, tierPrices: [...prev.tierPrices, ''] }))}
                              className="w-full"
                            >
                              Add Tier Price
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3TierNames" className="text-sm font-medium">
                              Tier Names (Optional)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {web3FormData.tierNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    placeholder={`Tier ${index + 1} Name`}
                                    value={name}
                                    onChange={(e) => {
                                      const newNames = [...web3FormData.tierNames];
                                      newNames[index] = e.target.value;
                                      setWeb3FormData(prev => ({ ...prev, tierNames: newNames }));
                                    }}
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setWeb3FormData(prev => ({
                                        ...prev,
                                        tierNames: prev.tierNames.filter((_, i) => i !== index)
                                      }));
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setWeb3FormData(prev => ({ ...prev, tierNames: [...prev.tierNames, ''] }))}
                              className="w-full"
                            >
                              Add Tier Name
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3TierQuantities" className="text-sm font-medium">
                              Tier Quantities (Optional)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {web3FormData.tierQuantities.map((quantity, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={`Tier ${index + 1} Quantity`}
                                    value={quantity}
                                    onChange={(e) => {
                                      const newQuantities = [...web3FormData.tierQuantities];
                                      newQuantities[index] = e.target.value;
                                      setWeb3FormData(prev => ({ ...prev, tierQuantities: newQuantities }));
                                    }}
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setWeb3FormData(prev => ({
                                        ...prev,
                                        tierQuantities: prev.tierQuantities.filter((_, i) => i !== index)
                                      }));
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setWeb3FormData(prev => ({ ...prev, tierQuantities: [...prev.tierQuantities, ''] }))}
                              className="w-full"
                            >
                              Add Tier Quantity
                            </Button>
                          </div>
                        </div>
                        <div className="pt-4">
                                                     <Button 
                             type="submit" 
                             size="lg"
                             className="w-full bg-primary hover:bg-primary/90 text-lg font-semibold py-6"
                             disabled={isCreatingEvent || !isConnected}
                           >
                            {isCreatingEvent ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Web3 Event...
                              </>
                            ) : (
                              <>
                                <Wallet className="mr-2 h-5 w-5" />
                                Create Web3 Event
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Your Web3 event will be created as a draft. You can edit and publish it later.
                          </p>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Web3 Info Cards */}
                <div className="space-y-6">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                                                 <Network className="h-5 w-5 text-primary" />
                        Web3 Event Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Seamless integration with blockchain technology
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Transparent and immutable event records
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Secure and immutable ticket ownership
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Built-in anti-scalping measures
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Scalable and customizable ticket tiers
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Web3 Event Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Smart contract deployment for event management
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Immutable ticket metadata on the blockchain
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Secure payment processing with blockchain
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Scalable and customizable ticket tiers
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Web3 Event Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          High gas fees for blockchain transactions
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Complexity of smart contract development
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Legal and regulatory compliance requirements
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Scalable and customizable ticket tiers
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Organize;
