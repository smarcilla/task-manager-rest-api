import request from 'supertest';
import app from '../../src/app';
import { connect, clear, close } from '../setup';

import { NOT_FOUND_ID } from './fixtures/id.generator';

import {
  VALID_TOKEN,
  EXPIRED_TOKEN,
  INVALID_TOKEN,
} from '../auth/fixtures/token.generator';
import { COMPLETED_STATUS } from '../../src/shared/constants';

describe('PATCH /tasks/:id/complete', () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  it('should mark a task as completed successfully', async () => {
    // Primero creamos una tarea para luego marcarla como completada
    const newTask = {
      title: 'Test Task to complete',
      description: 'This is a test task that will be marked as completed',
      assignee: 'John Doe',
    };

    const createResponse = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.id;

    // Ahora marcamos la tarea como completada
    const completeResponse = await request(app)
      .patch(`/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body).toHaveProperty('id', taskId);
    expect(completeResponse.body).toHaveProperty('status', COMPLETED_STATUS);
  });

  it('should return 404 when trying to mark a non-existent task as completed', async () => {
    const nonExistentTaskId = NOT_FOUND_ID;

    const response = await request(app)
      .patch(`/tasks/${nonExistentTaskId}/complete`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0]).toHaveProperty(
      'message',
      `Task ${nonExistentTaskId} not found`
    );
  });

  it('should return 400 when trying to mark an already completed task as completed', async () => {
    const newTask = {
      title: 'Test Task already completed',
      description: 'This task will be marked as completed twice',
      assignee: 'Jane Doe',
    };

    const createResponse = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.id;

    const firstCompleteResponse = await request(app)
      .patch(`/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(firstCompleteResponse.status).toBe(200);
    expect(firstCompleteResponse.body).toHaveProperty(
      'status',
      COMPLETED_STATUS
    );

    const secondCompleteResponse = await request(app)
      .patch(`/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(secondCompleteResponse.status).toBe(400);
    expect(secondCompleteResponse.body).toHaveProperty('errors');
    expect(secondCompleteResponse.body.errors[0]).toHaveProperty(
      'message',
      `Task ${taskId} is already completed`
    );
  });

  it('should return 401 when trying to mark a task as completed without authentication', async () => {
    const response = await request(app).patch(
      `/tasks/${NOT_FOUND_ID}/complete`
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message', 'authentication required');
  });

  it('should return 401 when trying to mark a task as completed with an invalid token', async () => {
    const response = await request(app)
      .patch(`/tasks/${NOT_FOUND_ID}/complete`)
      .set('Authorization', `Bearer ${INVALID_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message', 'invalid token');
  });

  it('should return 401 when trying to mark a task as completed with an expired token', async () => {
    const response = await request(app)
      .patch(`/tasks/${NOT_FOUND_ID}/complete`)
      .set('Authorization', `Bearer ${EXPIRED_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message', 'token expired');
  });
});
