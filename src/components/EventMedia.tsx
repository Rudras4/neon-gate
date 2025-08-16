import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface EventMediaProps {
  images: string[];
  spline3dUrl?: string;
}

export function EventMedia({ images, spline3dUrl }: EventMediaProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">Event Images</TabsTrigger>
          <TabsTrigger value="3d" disabled={!spline3dUrl}>
            3D Stadium View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="images" className="space-y-4">
          {/* Main Image Display */}
          <div className="relative bg-white rounded-lg overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={`Event image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
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
          )}
        </TabsContent>
        
        <TabsContent value="3d" className="space-y-4">
          {spline3dUrl ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={spline3dUrl}
                  title="3D Stadium View"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <a href={spline3dUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open 3D View in Full Screen
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3D View Not Available</h3>
              <p className="text-muted-foreground">
                This event doesn't have a 3D stadium view yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
