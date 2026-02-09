import request from 'supertest';
import app from '../../src/app';
import { connect, clear, close } from '../setup';

import { validateToken } from '../../src/shared/auth/token.validator';

describe('POST /auth/login', () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  it('should login successfully with valid credentials', async () => {
    // First, register a user to ensure we have valid credentials
    const responseRegister = await request(app).post('/auth/register').send({
      email: 'testuser@example.com',
    });

    const password = responseRegister.body.password; // Get the generated password from the registration response

    const response = await request(app).post('/auth/login').send({
      email: 'testuser@example.com',
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    const decodedToken = validateToken(response.body.token);
    expect(decodedToken).not.toBeNull();
  });

  it('should fail to login with unregistered email', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'unregistered@example.com',
      password: 'somepassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('invalid credentials');
  });

  it('should fail to login with incorrect password', async () => {
    // First, register a user to ensure we have valid credentials
    await request(app).post('/auth/register').send({
      email: 'testuser@example.com',
    });

    const response = await request(app).post('/auth/login').send({
      email: 'testuser@example.com',
      password: 'incorrectpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('invalid credentials');
  });

  it('should fail to login with missing email or password', async () => {
    const responseMissingEmail = await request(app).post('/auth/login').send({
      password: 'somepassword',
    });

    expect(responseMissingEmail.status).toBe(400);
    expect(responseMissingEmail.body).toHaveProperty('errors');
    expect(responseMissingEmail.body.errors[0].message).toBe(
      'email is required'
    );

    const responseMissingPassword = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
      });

    expect(responseMissingPassword.status).toBe(400);
    expect(responseMissingPassword.body).toHaveProperty('errors');
    expect(responseMissingPassword.body.errors[0].message).toBe(
      'password is required'
    );
  });
});
