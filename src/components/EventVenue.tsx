import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventVenueProps {
  venue: {
    images: string[];
    splineUrl?: string;
  };
}

export function EventVenue({ venue }: EventVenueProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Mock additional images for gallery
  const galleryImages = [
    venue.images[0] || "/assets/venue-theater.jpg",
    "/assets/hero-corporate.jpg",
    "/placeholder.svg",
    "/assets/venue-theater.jpg"
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">Event Images</TabsTrigger>
          <TabsTrigger value="3d">3D Stadium View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images" className="space-y-4">
          {/* Main Image Display */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <img
                src={galleryImages[selectedImage]}
                alt={`Event image ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : galleryImages.length - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              ←
            </button>
            <button 
              onClick={() => setSelectedImage(prev => prev < galleryImages.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              →
            </button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="3d" className="space-y-4">
          {/* 3D Stadium Viewer */}
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            {venue.splineUrl ? (
              <iframe
                src={venue.splineUrl}
                frameBorder="0"
                className="w-full h-full"
                title="3D Stadium Preview"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🏟️</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-700">3D Stadium View</h3>
                    <p className="text-slate-500">Interactive 3D model coming soon</p>
                    <div className="text-sm text-slate-400">
                      Experience the venue in virtual reality
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 3D Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎮</div>
              <h4 className="font-semibold text-sm">Interactive Controls</h4>
              <p className="text-xs text-muted-foreground">Navigate and explore</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📐</div>
              <h4 className="font-semibold text-sm">Seat View</h4>
              <p className="text-xs text-muted-foreground">Preview your seat</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      
      {/* About this Event */}
      <div className="space-y-4 mt-8">
        <h2 className="text-2xl font-bold">About this Event</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            Experience an unforgettable evening with industry leaders sharing cutting-edge insights 
            into the latest technology trends. This conference brings together innovators, entrepreneurs, 
            and tech enthusiasts for a day of learning, networking, and inspiration.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Join us at the prestigious Convention Center in Mumbai for presentations, panel discussions, 
            and interactive workshops covering AI, blockchain, cloud computing, and emerging technologies 
            that are shaping our future.
          </p>
        </div>
      </div>
    </div>
  );
}