// Device Workflow Integration Tests
const request = require('supertest');
const app = require('../../server/app');
const jwt = require('jsonwebtoken');

describe('Device Workflow Integration Tests', () => {
  let userToken, adminToken, testDeviceId, testReportId, testTransferId;

  beforeAll(async () => {
    userToken = jwt.sign(
      { id: 'test-user-1', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { id: 'test-admin-1', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Complete Device Lifecycle', () => {
    it('should handle complete device registration to recovery workflow', async () => {
      // 1. Register new device
      const deviceData = {
        category: 'mobile_phone',
        brand: 'Apple',
        model: 'iPhone 15',
        imei: '999888777666555',
        serial: 'WORKFLOW123TEST',
        purchase_date: '2023-12-01',
        purchase_location: 'Apple Store NYC',
        purchase_price: 1199.99
      };

      const registerResponse = await request(app)
        .post('/api/device-management/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send(deviceData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      testDeviceId = registerResponse.body.device.id;

      // 2. Verify device appears in user's device list
      const devicesResponse = await request(app)
        .get('/api/device-management/my-devices')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const registeredDevice = devicesResponse.body.devices.find(d => d.id === testDeviceId);
      expect(registeredDevice).toBeDefined();
      expect(registeredDevice.status).toBe('unverified');

      // 3. Admin verifies device
      const verifyResponse = await request(app)
        .put(`/api/device-management/device/${testDeviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'verified' })
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);

      // 4. Device gets stolen - create theft report
      const reportData = {
        report_type: 'stolen',
        description: 'Device stolen from my car in downtown area',
        occurred_at: new Date().toISOString(),
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: 'Times Square, New York, NY'
        }
      };

      const reportResponse = await request(app)
        .post(`/api/device-management/device/${testDeviceId}/report`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData)
        .expect(201);

      expect(reportResponse.body.success).toBe(true);
      testReportId = reportResponse.body.report.id;

      // 5. Verify device status changed to stolen
      const updatedDeviceResponse = await request(app)
        .get(`/api/device-management/device/${testDeviceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(updatedDeviceResponse.body.device.status).toBe('stolen');

      // 6. Public device check should show stolen status
      const checkResponse = await request(app)
        .post('/api/device-check/public')
        .send({ imei: deviceData.imei })
        .expect(200);

      expect(checkResponse.body.status).toBe('stolen');
      expect(checkResponse.body.case_id).toBeDefined();

      // 7. Purchase recovery service
      const paymentResponse = await request(app)
        .post('/api/recovery-services/create-payment-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deviceId: testDeviceId,
          packageType: 'standard'
        })
        .expect(201);

      expect(paymentResponse.body.success).toBe(true);
      const serviceId = paymentResponse.body.serviceId;

      // 8. Confirm payment and activate service
      const confirmResponse = await request(app)
        .post('/api/recovery-services/confirm-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          paymentIntentId: 'pi_test_workflow_123'
        })
        .expect(200);

      expect(confirmResponse.body.success).toBe(true);
      expect(confirmResponse.body.status).toBe('active');

      // 9. Admin updates recovery status
      await request(app)
        .put(`/api/recovery-services/${serviceId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'investigating',
          notes: 'Investigation started with local authorities'
        })
        .expect(200);

      // 10. Mark device as recovered
      await request(app)
        .put(`/api/recovery-services/${serviceId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'recovered',
          notes: 'Device successfully recovered and returned to owner'
        })
        .expect(200);

      // 11. Verify final service status
      const finalServiceResponse = await request(app)
        .get(`/api/recovery-services/${serviceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(finalServiceResponse.body.service.status).toBe('recovered');
    });
  });

  describe('Ownership Transfer Workflow', () => {
    it('should handle complete ownership transfer process', async () => {
      // 1. Create device for transfer
      const deviceData = {
        category: 'mobile_phone',
        brand: 'Samsung',
        model: 'Galaxy S24',
        imei: '111222333444555',
        serial: 'TRANSFER123TEST'
      };

      const registerResponse = await request(app)
        .post('/api/device-management/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send(deviceData);

      const transferDeviceId = registerResponse.body.device.id;

      // 2. Initiate ownership transfer
      const transferData = {
        device_id: transferDeviceId,
        to_email: 'buyer@example.com',
        to_name: 'Test Buyer',
        transfer_notes: 'Selling device to upgrade to newer model'
      };

      const initiateResponse = await request(app)
        .post('/api/device-transfer/initiate')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transferData)
        .expect(201);

      expect(initiateResponse.body.success).toBe(true);
      testTransferId = initiateResponse.body.transfer.id;
      const transferCode = initiateResponse.body.transfer.transfer_code;

      // 3. Check transfer status
      const statusResponse = await request(app)
        .get(`/api/device-transfer/status/${testTransferId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(statusResponse.body.transfer.status).toBe('pending');

      // 4. Buyer claims device (simulate new user)
      const buyerToken = jwt.sign(
        { id: 'test-buyer-1', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const claimResponse = await request(app)
        .post('/api/device-transfer/claim')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transfer_code: transferCode,
          otp_code: '123456' // Mock OTP
        })
        .expect(200);

      expect(claimResponse.body.success).toBe(true);

      // 5. Verify ownership changed
      const newOwnerResponse = await request(app)
        .get(`/api/device-management/device/${transferDeviceId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(newOwnerResponse.body.device.user_id).toBe('test-buyer-1');

      // 6. Original owner should no longer have access
      await request(app)
        .get(`/api/device-management/device/${transferDeviceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Security Event Workflow', () => {
    it('should handle security event detection and response', async () => {
      // 1. Perform device check with suspicious data
      const suspiciousCheckData = {
        imei: '123456789012345',
        location: {
          latitude: 51.5074, // London - far from user's normal location
          longitude: -0.1278,
          accuracy: 5
        },
        device_info: {
          user_agent: 'Suspicious Browser/1.0',
          platform: 'unknown'
        },
        network_info: {
          ip_address: '10.0.0.1', // Suspicious IP
          connection_type: 'unknown'
        }
      };

      const checkResponse = await request(app)
        .post('/api/device-management/security-check')
        .set('Authorization', `Bearer ${userToken}`)
        .send(suspiciousCheckData)
        .expect(200);

      expect(checkResponse.body.security_analysis.risk_score).toBeGreaterThan(5);
      expect(checkResponse.body.security_analysis.flags.length).toBeGreaterThan(0);

      // 2. Admin should see security event
      const securityEventsResponse = await request(app)
        .get('/api/admin-system/security-events?severity=high')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(securityEventsResponse.body.events.length).toBeGreaterThan(0);

      // 3. Generate security report
      const reportResponse = await request(app)
        .post('/api/admin-system/security-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          timeRange: '1h',
          severity: 'high'
        })
        .expect(200);

      expect(reportResponse.body.success).toBe(true);
      expect(reportResponse.body.total_events).toBeGreaterThan(0);
    });
  });

  describe('Mobile Integration Workflow', () => {
    it('should handle mobile device check with enhanced features', async () => {
      // Simulate mobile device check with enhanced data
      const mobileCheckData = {
        imei: '987654321098765',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 3,
          method: 'gps_mobile'
        },
        device_info: {
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          platform: 'ios',
          screen_resolution: '375x812',
          device_memory: 6,
          hardware_concurrency: 6
        },
        network_info: {
          ip_address: '192.168.1.100',
          connection_type: '5g',
          effective_type: '4g'
        },
        sensor_data: {
          battery_level: 0.85,
          charging: false,
          orientation: 'portrait'
        },
        identification_method: 'qr_scan'
      };

      const mobileCheckResponse = await request(app)
        .post('/api/device-management/mobile-check')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mobileCheckData)
        .expect(200);

      expect(mobileCheckResponse.body.success).toBe(true);
      expect(mobileCheckResponse.body.enhanced_security).toBe(true);
      expect(mobileCheckResponse.body.mobile_features_used).toContain('qr_scan');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent operations gracefully', async () => {
      const deviceData = {
        category: 'mobile_phone',
        brand: 'Google',
        model: 'Pixel 8',
        imei: '555666777888999',
        serial: 'CONCURRENT123'
      };

      // Register device
      const registerResponse = await request(app)
        .post('/api/device-management/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send(deviceData);

      const concurrentDeviceId = registerResponse.body.device.id;

      // Attempt concurrent operations
      const operations = [
        request(app)
          .put(`/api/device-management/device/${concurrentDeviceId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ color: 'Black' }),
        
        request(app)
          .post(`/api/device-management/device/${concurrentDeviceId}/report`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            report_type: 'lost',
            description: 'Lost device'
          }),
        
        request(app)
          .post('/api/device-transfer/initiate')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            device_id: concurrentDeviceId,
            to_email: 'concurrent@example.com',
            to_name: 'Concurrent Buyer'
          })
      ];

      const results = await Promise.allSettled(operations);
      
      // At least one operation should succeed
      const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.status < 400);
      expect(successfulOps.length).toBeGreaterThan(0);
    });

    it('should handle invalid data gracefully', async () => {
      // Test with invalid IMEI
      const invalidDeviceData = {
        category: 'mobile_phone',
        brand: 'Invalid',
        model: 'Test',
        imei: '123', // Too short
        serial: 'INVALID123'
      };

      await request(app)
        .post('/api/device-management/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidDeviceData)
        .expect(400);

      // Test with invalid location
      const invalidLocationData = {
        imei: '123456789012345',
        location: {
          latitude: 'invalid',
          longitude: 'invalid'
        }
      };

      const response = await request(app)
        .post('/api/device-management/security-check')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidLocationData)
        .expect(200);

      expect(response.body.security_analysis.flags).toContain('invalid_location');
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple simultaneous device checks', async () => {
      const checkPromises = [];
      
      for (let i = 0; i < 10; i++) {
        const checkData = {
          imei: `12345678901234${i}`,
          location: {
            latitude: 40.7128 + (i * 0.001),
            longitude: -74.0060 + (i * 0.001),
            accuracy: 10
          }
        };

        checkPromises.push(
          request(app)
            .post('/api/device-check/public')
            .send(checkData)
        );
      }

      const results = await Promise.all(checkPromises);
      
      // All requests should complete
      expect(results.length).toBe(10);
      
      // Most should be successful (allowing for some test data limitations)
      const successfulChecks = results.filter(r => r.status === 200);
      expect(successfulChecks.length).toBeGreaterThan(5);
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      const loadPromises = [];
      for (let i = 0; i < 20; i++) {
        loadPromises.push(
          request(app)
            .get('/api/device-management/my-devices')
            .set('Authorization', `Bearer ${userToken}`)
        );
      }

      await Promise.all(loadPromises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds for 20 requests)
      expect(totalTime).toBeLessThan(5000);
    });
  });
});