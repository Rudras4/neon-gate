// Mock Supabase client for now - replace with actual implementation
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  venue_link?: string;
  price?: any;
  capacity?: any;
}

// Mock events data - replace with actual Supabase query
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Mumbai CultureFest 2024',
    description: 'A celebration of diverse cultures with music, dance, and food',
    date: '2024-03-15T18:00:00Z',
    category: 'Cultural',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '50', 'silver': '100', 'gold': '200' },
    capacity: { 'bronze': '100', 'silver': '50', 'gold': '25' }
  },
  {
    id: '2',
    title: 'Delhi Heritage Festival',
    description: 'Experience the rich heritage of Delhi through traditional performances',
    date: '2024-03-20T19:00:00Z',
    category: 'Cultural',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '75', 'silver': '150', 'gold': '300' },
    capacity: { 'bronze': '80', 'silver': '40', 'gold': '20' }
  },
  {
    id: '3',
    title: 'Rock Concert 2024',
    description: 'Amazing rock music night with top artists',
    date: '2024-03-10T20:00:00Z',
    category: 'Concert',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '200', 'silver': '400', 'gold': '800' },
    capacity: { 'bronze': '200', 'silver': '100', 'gold': '50' }
  },
  {
    id: '4',
    title: 'Jazz Night',
    description: 'Smooth jazz evening with live band',
    date: '2024-03-16T21:00:00Z',
    category: 'Concert',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '150', 'silver': '300', 'gold': '600' },
    capacity: { 'bronze': '60', 'silver': '30', 'gold': '15' }
  },
  {
    id: '5',
    title: 'Football Championship',
    description: 'Exciting football match between top teams',
    date: '2024-03-12T16:00:00Z',
    category: 'Sports',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '100', 'silver': '200', 'gold': '500' },
    capacity: { 'bronze': '500', 'silver': '200', 'gold': '100' }
  },
  {
    id: '6',
    title: 'Basketball Tournament',
    description: 'High-energy basketball tournament with local teams',
    date: '2024-03-18T19:00:00Z',
    category: 'Sports',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '80', 'silver': '150', 'gold': '300' },
    capacity: { 'bronze': '300', 'silver': '150', 'gold': '75' }
  },
  {
    id: '7',
    title: 'Cricket League',
    description: 'Professional cricket league matches',
    date: '2024-03-22T14:00:00Z',
    category: 'Sports',
    venue_link: 'https://maps.google.com',
    price: { 'bronze': '120', 'silver': '250', 'gold': '600' },
    capacity: { 'bronze': '1000', 'silver': '500', 'gold': '250' }
  }
];

export const searchEvents = async (query: string): Promise<Event[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Enhanced search logic
  const lowerQuery = query.toLowerCase();
  
  // Define search keywords for better matching
  const searchKeywords = {
    'sport': ['sport', 'sports', 'football', 'basketball', 'cricket', 'game', 'match', 'tournament', 'championship'],
    'concert': ['concert', 'music', 'rock', 'jazz', 'band', 'live', 'performance'],
    'cultural': ['cultural', 'culture', 'fest', 'festival', 'heritage', 'traditional', 'dance'],
    'workshop': ['workshop', 'class', 'learning', 'educational', 'training'],
    'comedy': ['comedy', 'funny', 'humor', 'standup', 'laugh']
  };
  
  // Find matching category based on query
  let matchedCategory = null;
  for (const [category, keywords] of Object.entries(searchKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      matchedCategory = category;
      break;
    }
  }
  
  // Filter events based on matched category or direct text search
  let filteredEvents = mockEvents;
  
  if (matchedCategory) {
    // If we found a category match, prioritize it
    filteredEvents = mockEvents.filter(event => 
      event.category.toLowerCase() === matchedCategory ||
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
    );
  } else {
    // Fallback to direct text search
    filteredEvents = mockEvents.filter(event => 
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.category.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Sort by date (closest first)
  filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  console.log(`Search query: "${query}" | Matched category: ${matchedCategory} | Found ${filteredEvents.length} events`);
  
  return filteredEvents;
};

// TODO: Replace with actual Supabase implementation
/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const searchEvents = async (query: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .or(`title.ilike.%${query}%, description.ilike.%${query}%, category.ilike.%${query}%`)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (error) {
    console.error('Error searching events:', error);
    return [];
  }

  return data || [];
};
*/
