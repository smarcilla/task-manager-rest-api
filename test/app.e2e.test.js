import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('should return a JSON object with a status property', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
  });
});
