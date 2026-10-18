'use strict';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

require('./setup');

describe('Auth API Endpoints', () => {
  const validUser = {
    name: 'Test Architect',
    email: 'architect@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully with JWT', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.plan).toBe('free');

      // Password should not be returned
      expect(res.body.user.password).toBeUndefined();

      // Verify user in database
      const dbUser = await User.findOne({ email: validUser.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.password).not.toBe(validUser.password); // hashed
    });

    it('should reject registration with duplicate email', async () => {
      await request(app).post('/api/auth/signup').send(validUser);
      const res = await request(app).post('/api/auth/signup').send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email and short password', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'A',
        email: 'invalid-email',
        password: '123',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(validUser);
    });

    it('should log in with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject incorrect password with generic message', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('Portfolio Evaluation Mode: POST /api/auth/demo-toggle-pro', () => {
    it('should toggle user plan between free and pro', async () => {
      const signupRes = await request(app).post('/api/auth/signup').send(validUser);
      const token = signupRes.body.token;

      // First toggle: free -> pro
      const toggleRes1 = await request(app)
        .post('/api/auth/demo-toggle-pro')
        .set('Authorization', `Bearer ${token}`);

      expect(toggleRes1.status).toBe(200);
      expect(toggleRes1.body.data.plan).toBe('pro');

      // Second toggle: pro -> free
      const toggleRes2 = await request(app)
        .post('/api/auth/demo-toggle-pro')
        .set('Authorization', `Bearer ${token}`);

      expect(toggleRes2.status).toBe(200);
      expect(toggleRes2.body.data.plan).toBe('free');
    });
  });
});
