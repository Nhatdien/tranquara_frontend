/**
 * Storage Test Utility
 * 
 * Run this in browser console to test storage functionality:
 * ```
 * import { testStorage } from '~/utils/storage-test'
 * await testStorage()
 * ```
 */

import { storage } from './storage';
import { secureStorage } from './secure-storage';

export async function testStorage() {
  console.log('🧪 Testing Capacitor Storage...\n');

  try {
    // Test 1: Simple Storage
    console.log('📦 Test 1: Capacitor Preferences (Simple Storage)');
    await storage.set('test_key', { name: 'John', age: 30 });
    const data = await storage.get('test_key');
    console.log('✅ Set and Get:', data);
    
    await storage.remove('test_key');
    const removed = await storage.get('test_key');
    console.log('✅ Remove:', removed === null ? 'Success' : 'Failed');

    // Test 2: Secure Storage
    console.log('\n🔐 Test 2: Capacitor Secure Storage (Encrypted)');
    await secureStorage.setToken('test_token', 'my-secret-access-token');
    const token = await secureStorage.getToken('test_token');
    console.log('✅ Set and Get Token:', token);

    await secureStorage.removeToken('test_token');
    const removedToken = await secureStorage.getToken('test_token');
    console.log('✅ Remove Token:', removedToken === null ? 'Success' : 'Failed');

    console.log('\n✨ All storage tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

/**
 * Test auth token storage
 */
export async function testAuthTokenStorage() {
  console.log('🧪 Testing Auth Token Storage...\n');

  try {
    const mockTokens = {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expires_in: 300,
    };

    // Store tokens
    await secureStorage.setToken('access_token', mockTokens.access_token);
    await secureStorage.setToken('refresh_token', mockTokens.refresh_token);
    await storage.set('token_expiry', Date.now() + mockTokens.expires_in * 1000);

    console.log('✅ Tokens stored');

    // Retrieve tokens
    const accessToken = await secureStorage.getToken('access_token');
    const refreshToken = await secureStorage.getToken('refresh_token');
    const expiry = await storage.get<number>('token_expiry');

    console.log('✅ Access Token:', accessToken?.substring(0, 20) + '...');
    console.log('✅ Refresh Token:', refreshToken?.substring(0, 20) + '...');
    console.log('✅ Expiry:', new Date(expiry!).toLocaleString());

    // Clear tokens
    await secureStorage.removeToken('access_token');
    await secureStorage.removeToken('refresh_token');
    await storage.remove('token_expiry');

    const cleared = await secureStorage.getToken('access_token');
    console.log('✅ Tokens cleared:', cleared === null ? 'Success' : 'Failed');

    console.log('\n✨ Auth token storage test passed!');
    return true;
  } catch (error) {
    console.error('❌ Auth token test failed:', error);
    return false;
  }
}
