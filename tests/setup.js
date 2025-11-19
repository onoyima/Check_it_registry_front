// Test Setup - Configure testing environment
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'checkit_test',
  port: process.env.TEST_DB_PORT || 3306
};

class TestSetup {
  constructor() {
    this.connection = null;
  }

  async setupTestDatabase() {
    try {
      // Connect without database to create it
      const connection = await mysql.createConnection({
        ...TEST_DB_CONFIG,
        database: undefined
      });

      // Drop and recreate test database
      await connection.execute(`DROP DATABASE IF EXISTS ${TEST_DB_CONFIG.database}`);
      await connection.execute(`CREATE DATABASE ${TEST_DB_CONFIG.database}`);
      await connection.end();

      // Connect to test database
      this.connection = await mysql.createConnection(TEST_DB_CONFIG);

      // Load schema
      await this.loadSchema();
      
      // Load test data
      await this.loadTestData();

      console.log('✅ Test database setup complete');
      
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  }

  async loadSchema() {
    try {
      const schemaPath = path.join(__dirname, '../server/sql/enhanced_schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.connection.execute(statement);
        }
      }
      
      console.log('✅ Schema loaded successfully');
      
    } catch (error) {
      console.error('❌ Schema loading failed:', error);
      throw error;
    }
  }

  async loadTestData() {
    try {
      // Create test users
      const testUsers = [
        {
          id: 'test-user-1',
          name: 'Test User 1',
          email: 'test1@example.com',
          password: '$2b$10$hash1', // bcrypt hash for 'password123'
          role: 'user',
          region: 'US',
          verified_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'test-admin-1',
          name: 'Test Admin',
          email: 'admin@example.com',
          password: '$2b$10$hash2', // bcrypt hash for 'admin123'
          role: 'admin',
          region: 'US',
          verified_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'test-lea-1',
          name: 'Test LEA Officer',
          email: 'lea@example.com',
          password: '$2b$10$hash3', // bcrypt hash for 'lea123'
          role: 'lea',
          region: 'US',
          verified_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      for (const user of testUsers) {
        await this.connection.execute(`
          INSERT INTO users (id, name, email, password, role, region, verified_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [user.id, user.name, user.email, user.password, user.role, user.region, user.verified_at, user.created_at, user.updated_at]);
      }

      // Create test devices
      const testDevices = [
        {
          id: 'test-device-1',
          user_id: 'test-user-1',
          category: 'mobile_phone',
          brand: 'Apple',
          model: 'iPhone 13',
          imei: '123456789012345',
          serial: 'ABC123DEF456',
          status: 'verified',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'test-device-2',
          user_id: 'test-user-1',
          category: 'mobile_phone',
          brand: 'Samsung',
          model: 'Galaxy S21',
          imei: '987654321098765',
          serial: 'XYZ789GHI012',
          status: 'stolen',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      for (const device of testDevices) {
        await this.connection.execute(`
          INSERT INTO devices (id, user_id, category, brand, model, imei, serial, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [device.id, device.user_id, device.category, device.brand, device.model, device.imei, device.serial, device.status, device.created_at, device.updated_at]);
      }

      // Create test reports
      const testReports = [
        {
          id: 'test-report-1',
          device_id: 'test-device-2',
          report_type: 'stolen',
          status: 'open',
          description: 'Device stolen from car',
          occurred_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      for (const report of testReports) {
        await this.connection.execute(`
          INSERT INTO reports (id, device_id, report_type, status, description, occurred_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [report.id, report.device_id, report.report_type, report.status, report.description, report.occurred_at, report.created_at, report.updated_at]);
      }

      // Create test LEA agency
      await this.connection.execute(`
        INSERT INTO law_enforcement_agencies (id, agency_name, region, contact_email, contact_phone, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['test-lea-agency-1', 'Test Police Department', 'US', 'contact@testpd.gov', '+1234567890', true, new Date(), new Date()]);

      console.log('✅ Test data loaded successfully');
      
    } catch (error) {
      console.error('❌ Test data loading failed:', error);
      throw error;
    }
  }

  async cleanupTestDatabase() {
    try {
      if (this.connection) {
        await this.connection.end();
      }
      
      // Connect without database to drop it
      const connection = await mysql.createConnection({
        ...TEST_DB_CONFIG,
        database: undefined
      });

      await connection.execute(`DROP DATABASE IF EXISTS ${TEST_DB_CONFIG.database}`);
      await connection.end();

      console.log('✅ Test database cleanup complete');
      
    } catch (error) {
      console.error('❌ Test database cleanup failed:', error);
      throw error;
    }
  }

  getTestConnection() {
    return this.connection;
  }

  getTestConfig() {
    return TEST_DB_CONFIG;
  }
}

// Global test setup and teardown
let testSetup;

beforeAll(async () => {
  testSetup = new TestSetup();
  await testSetup.setupTestDatabase();
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = TEST_DB_CONFIG.host;
  process.env.DB_USER = TEST_DB_CONFIG.user;
  process.env.DB_PASSWORD = TEST_DB_CONFIG.password;
  process.env.DB_NAME = TEST_DB_CONFIG.database;
  process.env.DB_PORT = TEST_DB_CONFIG.port;
  process.env.JWT_SECRET = 'test-jwt-secret';
});

afterAll(async () => {
  if (testSetup) {
    await testSetup.cleanupTestDatabase();
  }
});

// Helper functions for tests
global.getTestConnection = () => testSetup?.getTestConnection();
global.getTestConfig = () => testSetup?.getTestConfig();

// Mock external services
global.mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendSMS: jest.fn().mockResolvedValue({ success: true })
};

global.mockStripeService = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      amount: 5000,
      currency: 'usd',
      status: 'requires_payment_method'
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 5000,
      currency: 'usd'
    })
  },
  refunds: {
    create: jest.fn().mockResolvedValue({
      id: 're_test_123',
      amount: 2500,
      status: 'succeeded'
    })
  }
};

module.exports = TestSetup;