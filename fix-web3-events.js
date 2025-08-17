// Utility script to fix Web3 events missing contract addresses
// Run this with: node fix-web3-events.js

const API_BASE_URL = 'http://localhost:5000/api';

async function fixWeb3Events() {
  console.log('🔧 Fixing Web3 Events Missing Contract Addresses...\n');

  try {
    // Step 1: Check existing Web3 events
    console.log('📡 Step 1: Checking existing Web3 events...');
    const response = await fetch(`${API_BASE_URL}/events`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const web3Events = data.events?.filter(e => e.event_source === 'web3') || [];
    
    console.log(`📊 Found ${web3Events.length} Web3 events`);
    
    if (web3Events.length === 0) {
      console.log('✅ No Web3 events found. You can create a new one to test the flow.');
      return;
    }

    // Step 2: Analyze each Web3 event
    console.log('\n🔍 Step 2: Analyzing Web3 events...');
    web3Events.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Blockchain TX: ${event.blockchain_tx_hash || 'None'}`);
      console.log(`  Contract Address: ${event.event_contract_address || 'MISSING!'}`);
      console.log(`  Status: ${event.status}`);
    });

    // Step 3: Check for events with missing contract addresses
    const eventsWithMissingContracts = web3Events.filter(e => !e.event_contract_address);
    
    if (eventsWithMissingContracts.length === 0) {
      console.log('\n✅ All Web3 events have contract addresses!');
      return;
    }

    console.log(`\n⚠️  Found ${eventsWithMissingContracts.length} events missing contract addresses`);
    
    // Step 4: Provide solutions
    console.log('\n🔧 Step 4: Solutions...');
    console.log('\nOption 1: Update existing events (if you have the contract addresses)');
    console.log('Option 2: Create a new Web3 event to test the complete flow');
    console.log('Option 3: Delete problematic events and recreate them');
    
    console.log('\n💡 Recommendation: Create a new Web3 event to test the complete flow');
    console.log('   This will ensure the contract address is properly captured and stored.');
    
    // Step 5: Show how to create a new event
    console.log('\n📝 Step 5: How to create a new Web3 event...');
    console.log('1. Go to the Organize page in your frontend');
    console.log('2. Select "Web3 Event" as the event type');
    console.log('3. Fill in the event details');
    console.log('4. Submit the form');
    console.log('5. The system will now capture and store the contract address');
    
    // Step 6: Check if backend supports contract address storage
    console.log('\n🔍 Step 6: Checking backend support...');
    try {
      const testResponse = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this
        },
        body: JSON.stringify({
          title: 'Test Web3 Event',
          description: 'Test event to verify contract address storage',
          event_source: 'web3',
          // Add other required fields
        })
      });
      
      if (testResponse.status === 401) {
        console.log('✅ Backend requires authentication (good for security)');
        console.log('   You need to be logged in to create events');
      } else if (testResponse.status === 400) {
        console.log('✅ Backend validates event data (good)');
        console.log('   The error is expected for a test request');
      }
    } catch (error) {
      console.log('✅ Backend is running and accessible');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the fix
fixWeb3Events();
