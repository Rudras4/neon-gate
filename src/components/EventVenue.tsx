interface EventVenueProps {
  venue: {
    images: string[];
    splineUrl?: string;
  };
}

export function EventVenue({ venue }: EventVenueProps) {
  return (
    <section className="py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Venue</h2>
          
          <div className="space-y-8">
            {/* Venue Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venue.images.map((image, index) => (
                <div key={index} className="group">
                  <div className="aspect-video overflow-hidden rounded-xl">
                    <img
                      src={image}
                      alt={`Venue image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Venue Viewer */}
            {venue.splineUrl && (
              <div className="card-elevated p-6">
                <h3 className="text-xl font-semibold mb-4">3D Venue Tour</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={venue.splineUrl}
                    frameBorder="0"
                    className="w-full h-full"
                    title="3D Venue Preview"
                  />
                </div>
              </div>
            )}

            {/* Venue Features */}
            <div className="card-elevated p-6">
              <h3 className="text-xl font-semibold mb-4">Venue Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl mb-2">🎤</div>
                  <p className="text-sm font-medium">Sound System</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl mb-2">💡</div>
                  <p className="text-sm font-medium">Stage Lighting</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl mb-2">🅿️</div>
                  <p className="text-sm font-medium">Parking</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl mb-2">♿</div>
                  <p className="text-sm font-medium">Accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}