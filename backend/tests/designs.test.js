'use strict';

const request = require('supertest');
const app = require('../server');
const Design = require('../models/Design');
const Version = require('../models/Version');

require('./setup');

describe('Designs API Endpoints & Versioning', () => {
  let token;
  let otherUserToken;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app).post('/api/auth/signup').send({
      name: 'Primary Architect',
      email: 'primary@example.com',
      password: 'password123',
    });
    token = res1.body.token;

    // Register User 2
    const res2 = await request(app).post('/api/auth/signup').send({
      name: 'Secondary Architect',
      email: 'secondary@example.com',
      password: 'password123',
    });
    otherUserToken = res2.body.token;
  });

  describe('Design CRUD & Access Control', () => {
    it('should create a new design draft', async () => {
      const res = await request(app)
        .post('/api/designs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Cloud Native E-Commerce',
          requirements: 'High availability microservices architecture',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Cloud Native E-Commerce');
      expect(res.body.data.status).toBe('draft');
    });

    it('should prevent other users from accessing private designs', async () => {
      const createRes = await request(app)
        .post('/api/designs')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Top Secret System' });

      const designId = createRes.body.data._id;

      const getRes = await request(app)
        .get(`/api/designs/${designId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(getRes.status).toBe(403);
    });

    it('should update design and toggle starred status', async () => {
      const createRes = await request(app)
        .post('/api/designs')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Real-time Chat App' });

      const designId = createRes.body.data._id;

      // Toggle star
      const starRes = await request(app)
        .put(`/api/designs/${designId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ starred: true });

      expect(starRes.status).toBe(200);
      expect(starRes.body.data.starred).toBe(true);

      const dbDesign = await Design.findById(designId);
      expect(dbDesign.starred).toBe(true);
    });

    it('should persist free-form canvas whiteboard state', async () => {
      const createRes = await request(app)
        .post('/api/designs')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Canvas Architecture' });

      const designId = createRes.body.data._id;
      const canvasPayload = {
        nodes: [{ id: 'node_1', type: 'resizableShape', position: { x: 100, y: 150 }, data: { label: 'Auth Gateway' } }],
        edges: [{ id: 'e1-2', source: 'node_1', target: 'node_2' }],
      };

      const saveRes = await request(app)
        .put(`/api/designs/${designId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ canvas: canvasPayload });

      expect(saveRes.status).toBe(200);
      expect(saveRes.body.data.canvas.nodes).toHaveLength(1);
      expect(saveRes.body.data.canvas.nodes[0].data.label).toBe('Auth Gateway');
    });
  });

  describe('Version History & Rollback Integrity', () => {
    it('should create version snapshot and rollback safely preserving current work', async () => {
      const createRes = await request(app)
        .post('/api/designs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Versioned Design',
          hld: { summary: 'Initial Architecture v1', nodes: [{ id: '1', label: 'V1 Node' }], edges: [] },
        });

      const designId = createRes.body.data._id;

      // Commit Version 1
      const v1Res = await request(app)
        .post(`/api/designs/${designId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ commitMessage: 'Release v1.0' });

      expect(v1Res.status).toBe(201);
      const v1Id = v1Res.body.data._id;
      expect(v1Res.body.data.versionNumber).toBe(1);

      // Now update the design to V2 state
      await request(app)
        .put(`/api/designs/${designId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          hld: { summary: 'Updated Architecture v2', nodes: [{ id: '2', label: 'V2 Node' }], edges: [] },
        });

      // Rollback to Version 1
      const rollbackRes = await request(app)
        .post(`/api/designs/${designId}/versions/${v1Id}/rollback`)
        .set('Authorization', `Bearer ${token}`);

      expect(rollbackRes.status).toBe(200);
      expect(rollbackRes.body.data.hld.summary).toBe('Initial Architecture v1');

      // Verify that an auto-save snapshot was taken before rollback so V2 work was not lost!
      const versions = await Version.find({ designId }).sort({ versionNumber: -1 });
      expect(versions.length).toBe(2);
      expect(versions[0].versionNumber).toBe(2);
      expect(versions[0].commitMessage).toMatch(/auto-save before rollback/i);
      expect(versions[0].hld.summary).toBe('Updated Architecture v2');
    });
  });
});
