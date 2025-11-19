// Admin System API Tests
const request = require('supertest');
const app = require('../../server/app');
const jwt = require('jsonwebtoken');

describe('Admin System API', () => {
  let adminToken, userToken;

  beforeAll(async () => {
    adminToken = jwt.sign(
      { id: 'test-admin-1', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    userToken = jwt.sign(
      { id: 'test-user-1', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/admin-system/overview', () => {
    it('should return system overview for admin', async () => {
      const response = await request(app)
        .get('/api/admin-system/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.system_overview).toHaveProperty('users');
      expect(response.body.system_overview).toHaveProperty('devices');
      expect(response.body.system_overview).toHaveProperty('reports');
      expect(response.body.system_overview).toHaveProperty('activity');
      expect(response.body).toHaveProperty('regional_distribution');
      expect(response.body).toHaveProperty('recent_activity');
    });

    it('should require admin access', async () => {
      await request(app)
        .get('/api/admin-system/overview')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/admin-system/overview')
        .expect(401);
    });
  });

  describe('GET /api/admin-system/configuration', () => {
    it('should return system configuration', async () => {
      const response = await request(app)
        .get('/api/admin-system/configuration')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.configuration).toHaveProperty('lea_agencies');
      expect(response.body.configuration).toHaveProperty('role_distribution');
      expect(response.body.configuration).toHaveProperty('device_brands');
      expect(response.body.configuration).toHaveProperty('notification_stats');
      expect(response.body.configuration).toHaveProperty('system_settings');
    });
  });

  describe('GET /api/admin-system/users/management', () => {
    it('should return user management data', async () => {
      const response = await request(app)
        .get('/api/admin-system/users/management')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('activity_summary');
      
      if (response.body.users.length > 0) {
        const user = response.body.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('device_count');
        expect(user).toHaveProperty('report_count');
      }
    });

    it('should support filtering by role', async () => {
      const response = await request(app)
        .get('/api/admin-system/users/management?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.filters_applied.role).toBe('admin');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin-system/users/management?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/admin-system/devices/verification-queue', () => {
    it('should return device verification queue', async () => {
      const response = await request(app)
        .get('/api/admin-system/devices/verification-queue')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.verification_queue)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('statistics');
    });

    it('should support filtering by brand', async () => {
      const response = await request(app)
        .get('/api/admin-system/devices/verification-queue?brand=Apple')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.filters_applied.brand).toBe('Apple');
    });
  });

  describe('GET /api/admin-system/reports/management', () => {
    it('should return report management data', async () => {
      const response = await request(app)
        .get('/api/admin-system/reports/management')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.reports)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('statistics');
      
      if (response.body.reports.length > 0) {
        const report = response.body.reports[0];
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('report_type');
        expect(report).toHaveProperty('status');
        expect(report).toHaveProperty('brand');
        expect(report).toHaveProperty('model');
        expect(report).toHaveProperty('owner_name');
      }
    });

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/admin-system/reports/management?status=open')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.filters_applied.status).toBe('open');
    });

    it('should support date range filtering', async () => {
      const response = await request(app)
        .get('/api/admin-system/reports/management?date_from=2023-01-01&date_to=2023-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.filters_applied.date_from).toBe('2023-01-01');
      expect(response.body.filters_applied.date_to).toBe('2023-12-31');
    });
  });

  describe('GET /api/admin-system/audit-logs', () => {
    it('should return audit logs', async () => {
      const response = await request(app)
        .get('/api/admin-system/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.audit_logs)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body).toHaveProperty('action_distribution');
    });

    it('should support filtering by action', async () => {
      const response = await request(app)
        .get('/api/admin-system/audit-logs?action=LOGIN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.filters_applied.action).toBe('LOGIN');
    });

    it('should support filtering by user', async () => {
      const response = await request(app)
        .get('/api/admin-system/audit-logs?user_id=test-user-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.filters_applied.user_id).toBe('test-user-1');
    });
  });

  describe('GET /api/admin-system/security-events', () => {
    it('should return security events', async () => {
      const response = await request(app)
        .get('/api/admin-system/security-events')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
    });

    it('should support filtering by severity', async () => {
      const response = await request(app)
        .get('/api/admin-system/security-events?severity=high')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.events).toBeDefined();
    });

    it('should support time range filtering', async () => {
      const response = await request(app)
        .get('/api/admin-system/security-events?timeRange=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.events).toBeDefined();
    });
  });

  describe('GET /api/admin-system/security-stats', () => {
    it('should return security statistics', async () => {
      const response = await request(app)
        .get('/api/admin-system/security-stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_events');
      expect(response.body).toHaveProperty('events_by_severity');
      expect(response.body).toHaveProperty('events_by_type');
      expect(response.body).toHaveProperty('recent_suspicious_activity');
      expect(response.body).toHaveProperty('unique_users_tracked');
      expect(response.body).toHaveProperty('devices_checked_today');
      expect(response.body).toHaveProperty('high_risk_locations');
    });
  });

  describe('POST /api/admin-system/security-report', () => {
    it('should generate security report', async () => {
      const reportData = {
        timeRange: '24h',
        severity: 'high',
        eventType: 'device_check'
      };

      const response = await request(app)
        .post('/api/admin-system/security-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('report_data');
      expect(response.body).toHaveProperty('generated_at');
      expect(response.body).toHaveProperty('filters');
      expect(response.body).toHaveProperty('total_events');
    });
  });

  describe('POST /api/admin-system/maintenance', () => {
    it('should execute cleanup operations', async () => {
      const maintenanceData = {
        operation: 'cleanup_old_notifications',
        parameters: { days: 30 }
      };

      const response = await request(app)
        .post('/api/admin-system/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.operation).toBe('Cleanup Old Notifications');
      expect(response.body).toHaveProperty('deleted_count');
      expect(response.body).toHaveProperty('executed_by');
    });

    it('should execute database optimization', async () => {
      const maintenanceData = {
        operation: 'optimize_database'
      };

      const response = await request(app)
        .post('/api/admin-system/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.operation).toBe('Optimize Database');
    });

    it('should reject invalid operations', async () => {
      const maintenanceData = {
        operation: 'invalid_operation'
      };

      await request(app)
        .post('/api/admin-system/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData)
        .expect(400);
    });

    it('should require admin access', async () => {
      const maintenanceData = {
        operation: 'cleanup_old_notifications'
      };

      await request(app)
        .post('/api/admin-system/maintenance')
        .set('Authorization', `Bearer ${userToken}`)
        .send(maintenanceData)
        .expect(403);
    });
  });

  describe('GET /api/admin-system/performance', () => {
    it('should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/admin-system/performance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.performance_metrics).toHaveProperty('database');
      expect(response.body.performance_metrics).toHaveProperty('load_distribution');
      expect(response.body.performance_metrics).toHaveProperty('error_rates');
      expect(response.body.performance_metrics).toHaveProperty('response_times');
      expect(response.body.performance_metrics).toHaveProperty('background_jobs');
    });

    it('should support custom time periods', async () => {
      const response = await request(app)
        .get('/api/admin-system/performance?period=48')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.period_hours).toBe(48);
    });
  });

  describe('Admin System Integration Tests', () => {
    it('should handle complete admin workflow', async () => {
      // 1. Get system overview
      const overviewResponse = await request(app)
        .get('/api/admin-system/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(overviewResponse.body.success).toBe(true);

      // 2. Check user management
      const usersResponse = await request(app)
        .get('/api/admin-system/users/management?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(usersResponse.body.success).toBe(true);

      // 3. Review security events
      const securityResponse = await request(app)
        .get('/api/admin-system/security-events?timeRange=24h')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(securityResponse.body.events).toBeDefined();

      // 4. Generate security report
      const reportResponse = await request(app)
        .post('/api/admin-system/security-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ timeRange: '24h' })
        .expect(200);

      expect(reportResponse.body.success).toBe(true);

      // 5. Execute maintenance
      const maintenanceResponse = await request(app)
        .post('/api/admin-system/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ operation: 'update_statistics' })
        .expect(200);

      expect(maintenanceResponse.body.success).toBe(true);
    });

    it('should maintain data consistency across operations', async () => {
      // Get initial stats
      const initialStats = await request(app)
        .get('/api/admin-system/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      // Perform operations that might affect stats
      await request(app)
        .post('/api/admin-system/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ operation: 'update_statistics' });

      // Get updated stats
      const updatedStats = await request(app)
        .get('/api/admin-system/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify data consistency
      expect(updatedStats.body.success).toBe(true);
      expect(typeof updatedStats.body.system_overview.users.total_users).toBe('number');
      expect(typeof updatedStats.body.system_overview.devices.total_devices).toBe('number');
    });
  });
});