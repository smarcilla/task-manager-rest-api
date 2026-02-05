import request from 'supertest';
import app from '../src/app.js';

describe('GET /', () => {
  it('should return a JSON object with a message property', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Hello World!');
  });
});
