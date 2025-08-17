import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  date: string;
  location?: string;
  venue_name?: string;
  venue_city?: string;
  venue_state?: string;
  venue_country?: string;
  capacity: number;
  price: number;
  image_url?: string;
  category: string;
  event_type: string;
  status: string;
  organizer_id: number;
  organizer_name?: string;
  organizer_avatar?: string;
  // Web3 specific fields
  blockchain_tx_hash?: string;
  event_contract_address?: string;
  event_source?: 'traditional' | 'web3';
  tier_prices?: string;
  tier_quantities?: string;
  // Computed fields
  isWeb3Event: boolean;
  attendees: number;
  maxAttendees: number;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch events from backend API
      const response = await fetch('/api/events?includeNFTStats=true');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data to frontend format
      const transformedEvents: Event[] = data.map((event: any) => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description || event.long_description || '',
        long_description: event.long_description,
        date: event.date,
        location: event.venue_name || event.venue_city || event.location || 'Location TBD',
        venue_name: event.venue_name,
        venue_city: event.venue_city,
        venue_state: event.venue_state,
        venue_country: event.venue_country,
        capacity: event.capacity || 0,
        price: event.price || 0,
        image_url: event.image_url,
        category: event.category,
        event_type: event.event_type,
        status: event.status,
        organizer_id: event.organizer_id,
        organizer_name: event.organizer_name,
        organizer_avatar: event.organizer_avatar,
        blockchain_tx_hash: event.blockchain_tx_hash,
        event_contract_address: event.event_contract_address,
        event_source: event.event_source || 'traditional',
        tier_prices: event.tier_prices,
        tier_quantities: event.tier_quantities,
        // Computed fields
        isWeb3Event: event.event_source === 'web3' && !!event.event_contract_address,
        attendees: event.nftStats?.total || 0,
        maxAttendees: event.capacity || 0,
      }));
      
      setEvents(transformedEvents);
      
    } catch (err: any) {
      console.error('❌ Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      
      toast({
        title: "Error Loading Events",
        description: "Failed to load events from the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const refetch = () => {
    fetchEvents();
  };

  return {
    events,
    loading,
    error,
    refetch,
  };
}
