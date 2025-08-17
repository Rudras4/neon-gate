// Quick script to set a test contract address for existing Web3 events
// This allows you to test the UI while you fix the real contract addresses
// Run this with: node set-test-contract.js

const API_BASE_URL = 'http://localhost:5000/api';

async function setTestContractAddress() {
  console.log('🔧 Setting Test Contract Address for Web3 Events...\n');

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
    });

    // Step 3: Provide manual database update instructions
    console.log('\n🔧 Step 3: Manual Database Update Instructions...');
    console.log('To set a test contract address, run this SQL in your database:');
    console.log('');
    console.log('UPDATE events SET event_contract_address = \'0x1234567890123456789012345678901234567890\' WHERE event_source = \'web3\' AND event_contract_address IS NULL;');
    console.log('');
    console.log('This will set a placeholder contract address for all Web3 events');
    console.log('Note: This is just for testing - the placeholder address won\'t work for actual blockchain interactions');
    
    // Step 4: Show how to find your database file
    console.log('\n📁 Step 4: Finding your database file...');
    console.log('Your SQLite database is likely located at:');
    console.log('  backend/database/events.db');
    console.log('  or');
    console.log('  backend/database.db');
    console.log('');
    console.log('You can use any SQLite browser or run:');
    console.log('  sqlite3 backend/database/events.db');
    console.log('  Then paste the UPDATE command above');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the script
setTestContractAddress();
