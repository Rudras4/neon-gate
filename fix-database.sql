-- SQL script to fix Web3 events missing contract addresses
-- Run this in your SQLite database

-- First, let's see what we have
SELECT id, title, event_source, blockchain_tx_hash, event_contract_address 
FROM events 
WHERE event_source = 'web3';

-- Option 1: If you know the contract addresses, update them manually
-- Replace the contract addresses with the actual ones from your blockchain

-- For event ID 9 (Avalanche Hackthon)
-- UPDATE events SET event_contract_address = '0x...' WHERE id = 9;

-- For event ID 7 (BITCOIN 2025) 
-- UPDATE events SET event_contract_address = '0x...' WHERE id = 7;

-- For event ID 6 (rtyuiop)
-- UPDATE events SET event_contract_address = '0x...' WHERE id = 6;

-- Option 2: Set a placeholder contract address for testing
-- UPDATE events SET event_contract_address = '0x1234567890123456789012345678901234567890' WHERE event_source = 'web3' AND event_contract_address IS NULL;

-- Option 3: Delete problematic events and recreate them
-- DELETE FROM events WHERE id IN (6, 7, 9);

-- After making changes, verify the results
SELECT id, title, event_source, blockchain_tx_hash, event_contract_address 
FROM events 
WHERE event_source = 'web3';
