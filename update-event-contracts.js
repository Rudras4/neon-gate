// Script to manually update event contract addresses
// Use this if you have the contract addresses from blockchain transactions
// Run this with: node update-event-contracts.js

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration - UPDATE THESE VALUES
const EVENT_UPDATES = [
  {
    eventId: 'YOUR_EVENT_ID_HERE', // Replace with actual event ID
    contractAddress: '0x...', // Replace with actual contract address
    blockchainTxHash: '0x...' // Replace with actual transaction hash
  }
  // Add more events as needed
];

async function updateEventContracts() {
  console.log('🔧 Updating Event Contract Addresses...\n');

  try {
    // Step 1: Check current events
    console.log('📡 Step 1: Checking current events...');
    const response = await fetch(`${API_BASE_URL}/events`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const web3Events = data.events?.filter(e => e.event_source === 'web3') || [];
    
    console.log(`📊 Found ${web3Events.length} Web3 events`);
    
    // Step 2: Show events that need updating
    console.log('\n🔍 Step 2: Events that need contract addresses...');
    web3Events.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Blockchain TX: ${event.blockchain_tx_hash || 'None'}`);
      console.log(`  Contract Address: ${event.event_contract_address || 'MISSING!'}`);
      
      if (!event.event_contract_address) {
        console.log(`  ⚠️  NEEDS UPDATE: ${event.id}`);
      }
    });

    // Step 3: Check if we have updates to apply
    if (EVENT_UPDATES.length === 0) {
      console.log('\n⚠️  No event updates configured in EVENT_UPDATES array');
      console.log('   Please update the EVENT_UPDATES array with your event details');
      return;
    }

    console.log(`\n📝 Step 3: Applying ${EVENT_UPDATES.length} updates...`);
    
    // Step 4: Apply updates (this would require backend endpoint)
    console.log('\n💡 Note: This script shows what needs to be updated');
    console.log('   To actually update the database, you need to:');
    console.log('   1. Add an update endpoint to your backend');
    console.log('   2. Or manually update the database');
    console.log('   3. Or create a new event with the correct flow');
    
    // Step 5: Manual database update instructions
    console.log('\n🔧 Step 4: Manual Database Update Instructions...');
    console.log('If you want to manually update the database:');
    console.log('1. Open your SQLite database file');
    console.log('2. Run this SQL command for each event:');
    console.log('');
    console.log('UPDATE events SET event_contract_address = ? WHERE id = ?;');
    console.log('');
    console.log('Example:');
    EVENT_UPDATES.forEach(update => {
      console.log(`UPDATE events SET event_contract_address = '${update.contractAddress}' WHERE id = '${update.eventId}';`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the update
updateEventContracts();
