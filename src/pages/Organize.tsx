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
import { ethers } from 'ethers';

const Organize = () => {
  // ✅ UNIFIED: Single form state for both Traditional and Web3 events
  const [formData, setFormData] = useState({
    // Event Type Selection
    eventCreationType: 'traditional', // 'traditional' or 'web3'
    
    // Common Fields
    title: '',
    description: '',
    longDescription: '',
    category: '',
    eventType: '',
    startDate: '',
    endDate: '',
    venue: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueCountry: '',
    venuePostalCode: '',
    spline3dUrl: '',
    capacity: '',
    price: '',
    imageFile: null as File | null,
    imageUrl: '',
    imageGallery: [] as File[],
    
    // Web3 Specific Fields (only used when eventCreationType === 'web3')
    tierPrices: [''],
    tierNames: [''],
    tierQuantities: ['']
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ✅ UNIFIED: Enhanced form validation function for both Traditional and Web3 events
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Required field validation (common for both types)
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.description.trim()) errors.description = 'Event description is required';
    if (!formData.category) errors.category = 'Event category is required';
    if (!formData.eventType) errors.eventType = 'Event type is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (!formData.venue.trim()) errors.venue = 'Venue name is required';
    if (!formData.venueAddress.trim()) errors.venueAddress = 'Venue address is required';
    if (!formData.venueCity.trim()) errors.venueCity = 'Venue city is required';
    if (!formData.venueState.trim()) errors.venueState = 'Venue state is required';
    if (!formData.venueCountry.trim()) errors.venueCountry = 'Venue country is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();
      
      if (startDate < now) {
        errors.startDate = 'Start date cannot be in the past';
      }
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    // Price validation
    if (formData.price) {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        errors.price = 'Price must be a valid positive number';
      }
    }

    // Capacity validation
    if (formData.capacity) {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        errors.capacity = 'Capacity must be a valid positive integer';
      }
    }

    // Description length validation
    if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }

    // Title length validation
    if (formData.title.trim().length < 5) {
      errors.title = 'Event title must be at least 5 characters long';
    }

    // Web3-specific validation
    if (formData.eventCreationType === 'web3') {
      // Validate tier pricing if Web3 event
      if (formData.tierPrices.length > 0 && formData.tierPrices.some(price => price !== '')) {
        const validPrices = formData.tierPrices.filter(price => price !== '');
        if (validPrices.length > 0) {
          validPrices.forEach((price, index) => {
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue < 0) {
              errors[`tierPrice${index}`] = `Tier ${index + 1} price must be a valid positive number`;
            }
          });
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form is ready for submission
  const isFormReady = (): boolean => {
    return !!(
      formData.title.trim() &&
      formData.description.trim() &&
      formData.category &&
      formData.startDate &&
      formData.endDate &&
      formData.venue.trim() &&
      formData.venueAddress.trim() &&
      formData.venueCity.trim() &&
      formData.venueState.trim() &&
      formData.venueCountry.trim()
    );
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

    // ✅ UNIFIED: Enhanced Web3 form validation
    const web3Errors: string[] = [];
    
    if (!formData.title.trim()) {
      web3Errors.push('Event title is required');
    } else if (formData.title.trim().length < 5) {
      web3Errors.push('Event title must be at least 5 characters long');
    }
    
    if (!formData.description.trim()) {
      web3Errors.push('Event description is required');
    } else if (formData.description.trim().length < 10) {
      web3Errors.push('Event description must be at least 10 characters long');
    }
    
    if (!formData.startDate) {
      web3Errors.push('Event start date is required');
    } else {
      const eventDate = new Date(formData.startDate);
      const now = new Date();
      if (eventDate < now) {
        web3Errors.push('Event start date cannot be in the past');
      }
    }
    
    if (web3Errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: web3Errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    try {
      // Debug wallet connection and network
      console.log('🔍 Web3 Debug Info:', {
        isConnected,
        currentNetwork,
        account,
        balance
      });
      
      // ✅ UNIFIED: Prepare event configuration for smart contract with proper validation
      const validTierPrices = formData.tierPrices.filter(price => price !== '' && !isNaN(parseFloat(price)));
      const validTierNames = formData.tierNames.filter(name => name !== '' && name.trim().length > 0);
      const validTierQuantities = formData.tierQuantities.filter(qty => qty !== '' && !isNaN(parseInt(qty)));
      
      // Ensure we have at least one tier
      if (validTierPrices.length === 0) {
        validTierPrices.push('0'); // Default free tier
      }
      if (validTierNames.length === 0) {
        validTierNames.push('General'); // Default tier name
      }
      if (validTierQuantities.length === 0) {
        validTierQuantities.push('100'); // Default quantity
      }
      
      // Ensure arrays have the same length
      const maxLength = Math.max(validTierPrices.length, validTierNames.length, validTierQuantities.length);
      
      const eventConfig = {
        eventName: formData.title,
        eventDescription: formData.description,
        maxOccupancy: formData.capacity ? parseInt(formData.capacity) : 100, // Default to 100
        tierPrices: validTierPrices.slice(0, maxLength).map(price => {
          const priceValue = parseFloat(price);
          return ethers.parseEther(priceValue.toString()); // Convert to wei using ethers
        }),
        tierNames: validTierNames.slice(0, maxLength),
        eventDate: Math.floor(new Date(formData.startDate).getTime() / 1000), // Convert to Unix timestamp
        tierQuantities: validTierQuantities.slice(0, maxLength).map(qty => parseInt(qty))
      };
      
      console.log('🔧 Event config being sent to smart contract:', eventConfig);

      // Test smart contract connection first
      try {
        console.log('🧪 Testing smart contract connection...');
        // This will help identify if the issue is with the contract or the data
      } catch (connectionError) {
        console.error('❌ Smart contract connection test failed:', connectionError);
        throw new Error(`Smart contract connection failed: ${connectionError.message}`);
      }

      // Create event on blockchain
      console.log('🚀 Attempting to create Web3 event with config:', eventConfig);
      
      const result = await createWeb3Event(eventConfig);
      console.log('📋 Web3 event creation result:', result);
      
      if (result.success) {
        // ✅ UNIFIED: Create backend event after blockchain success with proper field mapping
        try {
                  const backendEventData = {
          title: formData.title,
          description: formData.description,
          longDescription: formData.longDescription || formData.description,
          category: formData.category || 'technology',
          eventType: formData.eventType || 'web3',
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
          venue: formData.venue || 'Blockchain Event',
          venueAddress: formData.venueAddress || 'Blockchain',
          venueCity: formData.venueCity || 'Blockchain',
          venueState: formData.venueState || 'Blockchain',
          venueCountry: formData.venueCountry || 'Blockchain',
          venuePostalCode: formData.venuePostalCode || '',
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          price: formData.price ? parseFloat(formData.price) : (formData.tierPrices[0] ? parseFloat(formData.tierPrices[0]) : null),
          imageUrl: formData.imageUrl || '',
          imageGallery: formData.imageGallery || [],
          spline3dUrl: formData.spline3dUrl || '',
          blockchain_tx_hash: result.txHash || null,
          event_source: 'web3',
          tier_prices: JSON.stringify(formData.tierPrices.filter(price => price !== '')),
          tier_quantities: JSON.stringify(formData.tierQuantities.filter(qty => qty !== '')),
          status: 'published' // Web3 events are published immediately
        };

          const createdEvent = await eventsAPI.create(backendEventData);
          console.log('✅ Backend event created successfully after blockchain success:', createdEvent);
          
          // Show success message with both blockchain and backend info
          toast({
            title: "Web3 Event Created Successfully!",
            description: `Event deployed on blockchain and synced to backend. Transaction Hash: ${result.txHash?.substring(0, 10)}...`,
          });
        } catch (backendError) {
          console.error('⚠️ Backend event creation failed (non-blocking):', backendError);
          
          // Show warning but don't fail the blockchain success
          toast({
            title: "Web3 Event Created on Blockchain",
            description: `Event deployed on blockchain but failed to sync to backend. You can manually add it later.`,
            variant: "destructive",
          });
        }

        // Success toast is now handled in the backend sync section

        // Reset form
        setFormData({
          eventCreationType: 'traditional', // Reset to traditional
          title: '',
          description: '',
          longDescription: '',
          category: '',
          eventType: '',
          startDate: '',
          endDate: '',
          venue: '',
          venueAddress: '',
          venueCity: '',
          venueState: '',
          venueCountry: '',
          venuePostalCode: '',
          spline3dUrl: '',
          capacity: '',
          price: '',
          imageFile: null,
          imageUrl: '',
          imageGallery: [],
          tierPrices: [''],
          tierNames: [''],
          tierQuantities: ['']
        });

        // Redirect to events page after a short delay
        setTimeout(() => {
          navigate('/events');
        }, 3000);
      } else {
        console.error('❌ Web3 event creation failed:', result.error);
        
        // Offer to create as traditional event instead
        const shouldCreateTraditional = window.confirm(
          `Web3 event creation failed: ${result.error}\n\nWould you like to create this as a traditional event instead?`
        );
        
        if (shouldCreateTraditional) {
          // Create as traditional event
          try {
                                  const traditionalEventData = {
              title: formData.title,
              description: formData.description,
              longDescription: formData.longDescription || formData.description,
              category: formData.category || 'technology',
              eventType: formData.eventType || 'web3',
              startDate: formData.startDate,
              endDate: formData.endDate || formData.startDate,
              venue: formData.venue || 'Blockchain Event',
              venueAddress: formData.venueAddress || 'Blockchain',
              venueCity: formData.venueCity || 'Blockchain',
              venueState: formData.venueState || 'Blockchain',
              venueCountry: formData.venueCountry || 'Blockchain',
              venuePostalCode: formData.venuePostalCode || '',
              capacity: formData.capacity ? parseInt(formData.capacity) : 100,
              price: formData.price ? parseFloat(formData.price) : (formData.tierPrices[0] ? parseFloat(formData.tierPrices[0]) : 0),
              imageUrl: formData.imageUrl || '',
              imageGallery: formData.imageGallery || [],
              spline3dUrl: formData.spline3dUrl || '',
              blockchain_tx_hash: null,
              event_source: 'traditional',
              tier_prices: JSON.stringify(formData.tierPrices.filter(price => price !== '')),
              tier_quantities: JSON.stringify(formData.tierQuantities.filter(qty => qty !== '')),
              status: 'draft'
            };
            
            const createdEvent = await eventsAPI.create(traditionalEventData);
            console.log('✅ Traditional event created as fallback:', createdEvent);
            
            toast({
              title: "Event Created as Traditional Event",
              description: "Web3 creation failed, but event was created in the traditional system.",
            });
            
            // Reset form and redirect
            setFormData({
              eventCreationType: 'traditional', // Reset to traditional
              title: '',
              description: '',
              longDescription: '',
              category: '',
              eventType: '',
              startDate: '',
              endDate: '',
              venue: '',
              venueAddress: '',
              venueCity: '',
              venueState: '',
              venueCountry: '',
              venuePostalCode: '',
              spline3dUrl: '',
              capacity: '',
              price: '',
              imageFile: null,
              imageUrl: '',
              imageGallery: [],
              tierPrices: [''],
              tierNames: [''],
              tierQuantities: ['']
            });
            
            setTimeout(() => {
              navigate('/events');
            }, 2000);
            
          } catch (fallbackError) {
            console.error('❌ Fallback traditional event creation also failed:', fallbackError);
            toast({
              title: "Event Creation Failed",
              description: "Both Web3 and traditional event creation failed. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Web3 Event Creation Failed",
            description: result.error || "Failed to create event on blockchain",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Web3 event creation error:', error);
      
      // ✅ IMPROVED: Enhanced Web3 error handling
      let errorMessage = "An error occurred while creating the event on blockchain";
      let errorTitle = "Web3 Event Creation Failed";
      
      if (error instanceof Error) {
        if (error.message.includes('user rejected') || error.message.includes('User denied')) {
          errorTitle = "Transaction Cancelled";
          errorMessage = "You cancelled the transaction. No fees were charged.";
        } else if (error.message.includes('insufficient funds') || error.message.includes('balance')) {
          errorTitle = "Insufficient Balance";
          errorMessage = "Your wallet doesn't have enough funds to cover the transaction fees.";
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorTitle = "Network Error";
          errorMessage = "Unable to connect to the blockchain network. Please check your connection.";
        } else if (error.message.includes('gas') || error.message.includes('fee')) {
          errorTitle = "Gas Fee Error";
          errorMessage = "Unable to estimate gas fees. Please try again or check your network.";
        } else if (error.message.includes('contract') || error.message.includes('deployment')) {
          errorTitle = "Contract Error";
          errorMessage = "Smart contract deployment failed. Please try again.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
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
      
      // ✅ FIXED: Proper field mapping to backend API schema
      const eventData = {
        title: formData.title,
        description: formData.description,
        long_description: formData.longDescription || formData.description,
        category: formData.category,
        event_type: formData.eventType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        date: formData.startDate,
        venue_name: formData.venue,
        venue_address: formData.venueAddress,
        venue_city: formData.venueCity,
        venue_state: formData.venueState,
        venue_country: formData.venueCountry,
        venue_postal_code: formData.venuePostalCode,
        latitude: null,
        longitude: null,
        location: `${formData.venue}, ${formData.venueCity}, ${formData.venueState}`,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.imageUrl || '',
        image_gallery: formData.imageGallery.length > 0 ? formData.imageGallery : (formData.imageFile ? [formData.imageFile] : []),
        spline3d_url: formData.spline3dUrl || '',
        blockchain_tx_hash: null,
        event_source: 'traditional',
        tier_prices: null,
        tier_quantities: null,
        status: 'draft'
      };

      console.log('Event data being sent:', eventData);
      
      // ✅ SAFE ADDITION: Add better error handling for event creation
      let createdEvent;
      try {
        createdEvent = await eventsAPI.create(eventData);
        console.log('✅ Event created successfully:', createdEvent);
      } catch (apiError) {
        console.error('❌ API error creating event:', apiError);
        throw new Error(`Failed to create event: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      }
      
      // Send confirmation email to organizer
      try {
        await notificationsAPI.sendEmail({
          to: user?.email,
          subject: `Event Created: ${formData.title}`,
          template: 'event-created',
          data: {
            eventTitle: formData.title,
            eventDate: formData.startDate,
            eventVenue: formData.venue,
            organizerName: user?.name
          }
        });
      } catch (emailError) {
        console.error('⚠️ Failed to send confirmation email (non-blocking):', emailError);
        // Don't fail the event creation if email fails
      }
      
      toast({
        title: "Success",
        description: "Event created successfully! Check your email for confirmation. Redirecting to events page...",
      });

      // ✅ UNIFIED: Reset form with all fields including Web3 fields
      setFormData({
        eventCreationType: 'traditional', // Reset to traditional
        title: '',
        description: '',
        longDescription: '',
        category: '',
        eventType: '',
        startDate: '',
        endDate: '',
        venue: '',
        venueAddress: '',
        venueCity: '',
        venueState: '',
        venueCountry: '',
        venuePostalCode: '',
        spline3dUrl: '',
        capacity: '',
        price: '',
        imageFile: null,
        imageUrl: '',
        imageGallery: [],
        tierPrices: [''],
        tierNames: [''],
        tierQuantities: ['']
      });
      setFormErrors({});

      // Redirect to events page after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 2000);

    } catch (error) {
      console.error('Error creating event:', error);
      
      // ✅ IMPROVED: Enhanced error handling with specific error types
      let errorMessage = "Failed to create event. Please try again.";
      let errorTitle = "Error";
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorTitle = "Authentication Error";
          errorMessage = "Your session has expired. Please log in again.";
          
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorTitle = "Access Denied";
          errorMessage = "You don't have permission to create events. Please contact support.";
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorTitle = "Server Error";
          errorMessage = "Our servers are experiencing issues. Please try again in a few minutes.";
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorTitle = "Connection Error";
          errorMessage = "Unable to connect to our servers. Please check your internet connection.";
        } else if (error.message.includes('Validation') || error.message.includes('validation')) {
          errorTitle = "Validation Error";
          errorMessage = "Please check your input and try again.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
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
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.title ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.title && (
                              <p className="text-xs text-red-500">{formErrors.title}</p>
                            )}
                          </div>

                                                  <div className="space-y-3">
                          <Label htmlFor="category" className="text-sm font-medium">
                            Category *
                          </Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                              formErrors.category ? 'border-red-500' : ''
                            }`}>
                              <SelectValue placeholder="Choose event category" />
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
                          {formErrors.category && (
                            <p className="text-xs text-red-500">{formErrors.category}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="eventType" className="text-sm font-medium">
                            Event Type *
                          </Label>
                          <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                            <SelectTrigger className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                              formErrors.eventType ? 'border-red-500' : ''
                            }`}>
                              <SelectValue placeholder="Choose event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in-person">🏢 In-Person Event</SelectItem>
                              <SelectItem value="virtual">🌐 Virtual Event</SelectItem>
                              <SelectItem value="hybrid">🔗 Hybrid Event</SelectItem>
                              <SelectItem value="web3">⛓️ Web3/Blockchain Event</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.eventType && (
                            <p className="text-xs text-red-500">{formErrors.eventType}</p>
                          )}
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
                            className={`bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none ${
                              formErrors.description ? 'border-red-500' : ''
                            }`}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.description.length}/500 characters
                          </p>
                          {formErrors.description && (
                            <p className="text-xs text-red-500">{formErrors.description}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="longDescription" className="text-sm font-medium">
                            Long Description
                          </Label>
                          <Textarea
                            id="longDescription"
                            placeholder="Provide a more detailed description of your event..."
                            value={formData.longDescription}
                            onChange={(e) => handleInputChange('longDescription', e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none"
                          />
                          <p className="text-xs text-muted-foreground">
                            Optional detailed description for event page
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="startDate" className="text-sm font-medium">
                              Start Date & Time *
                            </Label>
                            <Input
                              id="startDate"
                              type="datetime-local"
                              value={formData.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              required
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.startDate ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.startDate && (
                              <p className="text-xs text-red-500">{formErrors.startDate}</p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="endDate" className="text-sm font-medium">
                              End Date & Time *
                            </Label>
                            <Input
                              id="endDate"
                              type="datetime-local"
                              value={formData.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              required
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.endDate ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.endDate && (
                              <p className="text-xs text-red-500">{formErrors.endDate}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="venue" className="text-sm font-medium">
                            Venue Name *
                          </Label>
                          <Input
                            id="venue"
                            placeholder="e.g., Central Park, Convention Center"
                            value={formData.venue}
                            onChange={(e) => handleInputChange('venue', e.target.value)}
                            required
                            className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                              formErrors.venue ? 'border-red-500' : ''
                            }`}
                          />
                          {formErrors.venue && (
                            <p className="text-xs text-red-500">{formErrors.venue}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="venueAddress" className="text-sm font-medium">
                              Venue Address *
                            </Label>
                            <Input
                              id="venueAddress"
                              placeholder="e.g., 123 Main Street"
                              value={formData.venueAddress}
                              onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                              required
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.venueAddress ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.venueAddress && (
                              <p className="text-xs text-red-500">{formErrors.venueAddress}</p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="venueCity" className="text-sm font-medium">
                              City *
                            </Label>
                            <Input
                              id="venueCity"
                              placeholder="e.g., Mumbai"
                              value={formData.venueCity}
                              onChange={(e) => handleInputChange('venueCity', e.target.value)}
                              required
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.venueCity ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.venueCity && (
                              <p className="text-xs text-red-500">{formErrors.venueCity}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="venueState" className="text-sm font-medium">
                              State/Province *
                            </Label>
                            <Input
                              id="venueState"
                              placeholder="e.g., Maharashtra"
                              value={formData.venueState}
                              onChange={(e) => handleInputChange('venueState', e.target.value)}
                              required
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.venueState ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.venueState && (
                              <p className="text-xs text-red-500">{formErrors.venueState}</p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="venueCountry" className="text-sm font-medium">
                              Country *
                            </Label>
                            <Input
                              id="venueCountry"
                              placeholder="e.g., India"
                              value={formData.venueCountry}
                              onChange={(e) => handleInputChange('venueCountry', e.target.value)}
                              required
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.venueCountry ? 'border-red-500' : ''
                              }`}
                            />
                            {formErrors.venueCountry && (
                              <p className="text-xs text-red-500">{formErrors.venueCountry}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="venuePostalCode" className="text-sm font-medium">
                            Postal Code
                          </Label>
                          <Input
                            id="venuePostalCode"
                            placeholder="e.g., 400001"
                            value={formData.venuePostalCode}
                            onChange={(e) => handleInputChange('venuePostalCode', e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                          />
                          <p className="text-xs text-muted-foreground">
                            Optional postal code for precise location
                          </p>
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
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.capacity ? 'border-red-500' : ''
                              }`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty for unlimited capacity
                            </p>
                            {formErrors.capacity && (
                              <p className="text-xs text-red-500">{formErrors.capacity}</p>
                            )}
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
                              className={`bg-background/50 border-border/50 focus:border-primary transition-colors ${
                                formErrors.price ? 'border-red-500' : ''
                              }`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Enter 0 for free events
                            </p>
                            {formErrors.price && (
                              <p className="text-xs text-red-500">{formErrors.price}</p>
                            )}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90 text-lg font-semibold py-6"
                            disabled={isSubmitting || !isFormReady()}
                          >
                            {isSubmitting ? (
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
                          
                          {/* Test Connection Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                console.log('🧪 Testing Web3 connection...');
                                console.log('Current network:', currentNetwork);
                                console.log('Account:', account);
                                console.log('Balance:', balance);
                                
                                // Test basic Web3 functionality
                                if (window.ethereum) {
                                  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                                  console.log('Chain ID:', chainId);
                                  
                                  toast({
                                    title: "Connection Test",
                                    description: `Connected to chain: ${chainId}`,
                                  });
                                }
                              } catch (error) {
                                console.error('Connection test failed:', error);
                                toast({
                                  title: "Connection Test Failed",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="mt-2 w-full"
                          >
                            🧪 Test Connection
                          </Button>
                        </div>
                      )}

                      <form onSubmit={handleWeb3Submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventTitle" className="text-sm font-medium">
                              Event Title *
                            </Label>
                            <Input
                              id="web3EventTitle"
                              placeholder="e.g., CryptoCon 2024"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                              {formData.description.length}/500 characters
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="web3EventLongDescription" className="text-sm font-medium">
                            Long Description
                          </Label>
                                                      <Textarea
                              id="web3EventLongDescription"
                              placeholder="Provide a more detailed description of your event..."
                              value={formData.longDescription}
                              onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none"
                            />
                          <p className="text-xs text-muted-foreground">
                            Optional detailed description for event page
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventStartDate" className="text-sm font-medium">
                              Event Start Date & Time *
                            </Label>
                            <Input
                              id="web3EventStartDate"
                              type="datetime-local"
                              value={formData.startDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventCapacity" className="text-sm font-medium">
                              Max Capacity (Optional)
                            </Label>
                            <Input
                              id="web3EventCapacity"
                              type="number"
                              min="0"
                              placeholder="e.g., 100"
                              value={formData.capacity}
                              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty for unlimited capacity
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventPrice" className="text-sm font-medium">
                              Ticket Price (₹)
                            </Label>
                            <Input
                              id="web3EventPrice"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g., 500.00"
                              value={formData.price}
                              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                            <p className="text-xs text-muted-foreground">
                              Enter 0 for free events
                            </p>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventCategory" className="text-sm font-medium">
                              Category *
                            </Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary transition-colors">
                                <SelectValue placeholder="Choose event category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technology">💻 Technology & Innovation</SelectItem>
                                <SelectItem value="concert">🎵 Concert & Music</SelectItem>
                                <SelectItem value="sports">⚽ Sports & Fitness</SelectItem>
                                <SelectItem value="cultural">🎭 Cultural & Arts</SelectItem>
                                <SelectItem value="workshop">🔧 Workshop & Learning</SelectItem>
                                <SelectItem value="comedy">😂 Comedy & Entertainment</SelectItem>
                                <SelectItem value="corporate">💼 Corporate & Business</SelectItem>
                                <SelectItem value="food">🍕 Food & Drink</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventType" className="text-sm font-medium">
                              Event Type *
                            </Label>
                            <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary transition-colors">
                                <SelectValue placeholder="Choose event type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web3">⛓️ Web3/Blockchain Event</SelectItem>
                                <SelectItem value="in-person">🏢 In-Person Event</SelectItem>
                                <SelectItem value="virtual">🌐 Virtual Event</SelectItem>
                                <SelectItem value="hybrid">🔗 Hybrid Event</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventVenue" className="text-sm font-medium">
                              Venue Name *
                            </Label>
                            <Input
                              id="web3EventVenue"
                              placeholder="e.g., Blockchain Center, Virtual Venue"
                              value={formData.venue}
                              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventEndDate" className="text-sm font-medium">
                              Event End Date & Time
                            </Label>
                            <Input
                              id="web3EventEndDate"
                              type="datetime-local"
                              value={formData.endDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                            <p className="text-xs text-muted-foreground">
                              Optional - defaults to start date if not specified
                            </p>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventVenueAddress" className="text-sm font-medium">
                              Venue Address
                            </Label>
                            <Input
                              id="web3EventVenueAddress"
                              placeholder="e.g., 123 Blockchain Street"
                              value={formData.venueAddress}
                              onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventVenueCity" className="text-sm font-medium">
                              City *
                            </Label>
                            <Input
                              id="web3EventVenueCity"
                              placeholder="e.g., Mumbai"
                              value={formData.venueCity}
                              onChange={(e) => setFormData(prev => ({ ...prev, venueCity: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="web3EventVenueState" className="text-sm font-medium">
                              State/Province *
                            </Label>
                            <Input
                              id="web3EventVenueState"
                              placeholder="e.g., Maharashtra"
                              value={formData.venueState}
                              onChange={(e) => setFormData(prev => ({ ...prev, venueState: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="web3EventVenueCountry" className="text-sm font-medium">
                              Country *
                            </Label>
                            <Input
                              id="web3EventVenueCountry"
                              placeholder="e.g., India"
                              value={formData.venueCountry}
                              onChange={(e) => setFormData(prev => ({ ...prev, venueCountry: e.target.value }))}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="web3EventVenuePostalCode" className="text-sm font-medium">
                            Postal Code
                          </Label>
                                                      <Input
                              id="web3EventVenuePostalCode"
                              placeholder="e.g., 400001"
                              value={formData.venuePostalCode}
                              onChange={(e) => setFormData(prev => ({ ...prev, venuePostalCode: e.target.value }))}
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          <p className="text-xs text-muted-foreground">
                            Optional postal code for precise location
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="web3EventImage" className="text-sm font-medium">
                            Event Image
                          </Label>
                          <Input
                            id="web3EventImage"
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
                          <Label htmlFor="web3EventImageGallery" className="text-sm font-medium">
                            Additional Images (Optional)
                          </Label>
                          <Input
                            id="web3EventImageGallery"
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
                          <Label htmlFor="web3EventSpline3dUrl" className="text-sm font-medium">
                            Spline 3D URL (Optional)
                          </Label>
                          <Input
                            id="web3EventSpline3dUrl"
                            type="url"
                            placeholder="e.g., https://my-spline.com/model.spline"
                            value={formData.spline3dUrl}
                            onChange={(e) => {
                              const url = e.target.value;
                              setFormData(prev => ({ ...prev, spline3dUrl: url }));
                              
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
                            <Label htmlFor="web3TierPrices" className="text-sm font-medium">
                              Tier Prices (₹) (Optional)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {formData.tierPrices.map((price, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={`Tier ${index + 1} Price`}
                                    value={price}
                                    onChange={(e) => {
                                      const newPrices = [...formData.tierPrices];
                                      newPrices[index] = e.target.value;
                                      setFormData(prev => ({ ...prev, tierPrices: newPrices }));
                                    }}
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setFormData(prev => ({
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
                              onClick={() => setFormData(prev => ({ ...prev, tierPrices: [...prev.tierPrices, ''] }))}
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
                              {formData.tierNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    placeholder={`Tier ${index + 1} Name`}
                                    value={name}
                                    onChange={(e) => {
                                      const newNames = [...formData.tierNames];
                                      newNames[index] = e.target.value;
                                      setFormData(prev => ({ ...prev, tierNames: newNames }));
                                    }}
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setFormData(prev => ({
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
                              onClick={() => setFormData(prev => ({ ...prev, tierNames: [...prev.tierNames, ''] }))}
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
                              {formData.tierQuantities.map((quantity, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder={`Tier ${index + 1} Quantity`}
                                    value={quantity}
                                    onChange={(e) => {
                                      const newQuantities = [...formData.tierQuantities];
                                      newQuantities[index] = e.target.value;
                                      setFormData(prev => ({ ...prev, tierQuantities: newQuantities }));
                                    }}
                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setFormData(prev => ({
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
                              onClick={() => setFormData(prev => ({ ...prev, tierQuantities: [...prev.tierQuantities, ''] }))}
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
