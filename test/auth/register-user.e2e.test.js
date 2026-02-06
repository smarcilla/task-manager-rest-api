import request from 'supertest';
import app from '../../src/app';
import { connect, clear, close } from '../setup';

describe('POST /auth/register', () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  it('should register a new user successfully', async () => {
    const response = await request(app).post('/auth/register').send({
      email: 'test@example.com',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('email', 'test@example.com');
    expect(response.body).toHaveProperty('password');
  });

  it('should return 409 if email already exists', async () => {
    await request(app).post('/auth/register').send({
      email: 'test@example.com',
    });

    const response = await request(app).post('/auth/register').send({
      email: 'test@example.com',
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('email already exists');
  });

  it('should return 400 if email is not valid', async () => {
    const response = await request(app).post('/auth/register').send({
      email: 'invalid-email',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('email is not valid');
  });

  it('should return 400 if email is missing', async () => {
    const response = await request(app).post('/auth/register').send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('email is not valid');
  });
});
