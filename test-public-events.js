// Test script to verify public event visibility
// Run this with: node test-public-events.js

const API_BASE_URL = 'http://localhost:5000/api';

async function testPublicEvents() {
  console.log('🧪 Testing Public Event Visibility...\n');
  
  try {
    // Test 1: Get all public events (should include events from ALL users)
    console.log('📡 Test 1: Fetching all public events...');
    const response = await fetch(`${API_BASE_URL}/events`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched public events');
    console.log(`📊 Total events found: ${data.events?.length || 0}`);
    
    if (data.events && data.events.length > 0) {
      // Show event details including organizers
      console.log('\n🔍 Event Details:');
      data.events.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log(`  ID: ${event.id}`);
        console.log(`  Title: ${event.title}`);
        console.log(`  Organizer ID: ${event.organizer_id}`);
        console.log(`  Organizer Name: ${event.organizer_name}`);
        console.log(`  Status: ${event.status}`);
        console.log(`  Event Source: ${event.event_source}`);
        console.log(`  Event Type: ${event.event_type}`);
        console.log(`  Blockchain TX: ${event.blockchain_tx_hash || 'None'}`);
      });
      
      // Check for events from different organizers
      const organizerIds = [...new Set(data.events.map(e => e.organizer_id))];
      const organizerNames = [...new Set(data.events.map(e => e.organizer_name))];
      
      console.log('\n👥 Organizer Analysis:');
      console.log(`  Unique Organizer IDs: ${organizerIds.length}`);
      console.log(`  Unique Organizer Names: ${organizerNames.length}`);
      console.log(`  Organizer IDs: ${organizerIds.join(', ')}`);
      console.log(`  Organizer Names: ${organizerNames.join(', ')}`);
      
      if (organizerIds.length > 1) {
        console.log('✅ SUCCESS: Events from multiple users are publicly visible!');
      } else if (organizerIds.length === 1) {
        console.log('⚠️  WARNING: Only events from one user found. This might be normal if only one user has created events.');
      } else {
        console.log('❌ ERROR: No events found. Check if events exist and are published.');
      }
      
    } else {
      console.log('⚠️  No events found. This might be normal if no events have been created yet.');
    }
    
    // Test 2: Verify that the endpoint doesn't require authentication
    console.log('\n📡 Test 2: Verifying no authentication required...');
    const response2 = await fetch(`${API_BASE_URL}/events`, {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header - should work without authentication
      }
    });
    
    if (response2.ok) {
      console.log('✅ SUCCESS: Public events endpoint works without authentication');
    } else {
      console.log('❌ ERROR: Public events endpoint requires authentication (this is wrong!)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the test
testPublicEvents();
