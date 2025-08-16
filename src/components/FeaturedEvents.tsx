import { EventCard } from "./EventCard";
import venueTheater from "@/assets/venue-theater.jpg";
import heroConcert from "@/assets/hero-concert.jpg";
import heroCorporate from "@/assets/hero-corporate.jpg";
import web3Features from "@/assets/web3-features.jpg";

const demoEvents = [
  {
    title: "Tech Summit 2024",
    description: "The biggest technology conference of the year featuring keynotes from industry leaders and networking opportunities.",
    date: "March 15, 2024",
    location: "Convention Center, San Francisco",
    price: "0.5",
    image: heroCorporate,
    tier: "Gold" as const,
    attendees: 1250,
    maxAttendees: 2000,
    isPopular: true,
  },
  {
    title: "Electronic Dreams Festival",
    description: "A three-day electronic music festival with world-class DJs and immersive visual experiences.",
    date: "April 20-22, 2024",
    location: "Desert Valley, Nevada",
    price: "1.2",
    image: heroConcert,
    tier: "Platinum" as const,
    attendees: 8500,
    maxAttendees: 10000,
    isPopular: true,
  },
  {
    title: "Shakespeare in the Park",
    description: "Classic theater performance under the stars featuring Romeo and Juliet with modern interpretations.",
    date: "May 5, 2024",
    location: "Central Park Theater",
    price: "0.3",
    image: venueTheater,
    tier: "Silver" as const,
    attendees: 450,
    maxAttendees: 800,
  },
  {
    title: "Web3 Innovation Workshop",
    description: "Hands-on workshop covering blockchain development, NFTs, and decentralized applications.",
    date: "March 30, 2024",
    location: "Tech Hub, Austin",
    price: "0.8",
    image: web3Features,
    tier: "Bronze" as const,
    attendees: 120,
    maxAttendees: 200,
  },
];

export function FeaturedEvents() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing events powered by blockchain technology. Secure, transparent, and memorable experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoEvents.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-primary hover:text-primary-glow font-medium">
            View All Events →
          </button>
        </div>
      </div>
    </section>
  );
}