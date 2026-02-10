import supertest from 'supertest';
import app from '../../src/app';
import { connect, clear, close } from '../setup';

import { NOT_FOUND_ID } from './fixtures/id.generator';

import {
  VALID_TOKEN,
  EXPIRED_TOKEN,
  INVALID_TOKEN,
} from '../auth/fixtures/token.generator';

describe('DELETE /tasks/:id', () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  it('should delete a task successfully', async () => {
    const newTask = {
      title: 'Test Task to delete',
      description: 'This is a test task that will be deleted',
      assignee: 'John Doe',
    };

    const createResponse = await supertest(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.id;

    const deleteResponse = await supertest(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(deleteResponse.status).toBe(204);

    const getResponse = await supertest(app)
      .get('/tasks')
      .query({ title: newTask.title })
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(getResponse.body)).toBe(true);
    expect(getResponse.body.length).toBe(0);
  });

  it('should return 404 when trying to delete a non-existent task', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${NOT_FOUND_ID}`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Task not found');
  });

  it('should return 401 when trying to delete a task without authentication', async () => {
    const response = await supertest(app).delete(`/tasks/${NOT_FOUND_ID}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message', 'authentication required');
  });

  it('should return 401 when trying to delete a task with an invalid token', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${NOT_FOUND_ID}`)
      .set('Authorization', `Bearer ${INVALID_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message', 'invalid token');
  });

  it('should return 401 when trying to delete a task with an expired token', async () => {
    const response = await supertest(app)
      .delete(`/tasks/${NOT_FOUND_ID}`)
      .set('Authorization', `Bearer ${EXPIRED_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message', 'token expired');
  });
});
