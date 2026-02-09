import request from 'supertest';
import app from '../../src/app.js';
import { connect, clear, close } from '../setup';

import { ASSIGNED_STATUS } from '../../src/shared/constants';

import {
  EXPIRED_TOKEN,
  VALID_TOKEN,
  INVALID_TOKEN,
} from '../auth/fixtures/token.generator';

describe('POST /tasks', () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  it('should create a new task and return it with a 201 status code', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      assignee: 'John Doe',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newTask.title);
    expect(response.body.description).toBe(newTask.description);
    expect(response.body.assignee).toBe(newTask.assignee);
    expect(response.body.status).toBe(ASSIGNED_STATUS);
  });

  it('should return a 400 status code if title is missing', async () => {
    const newTask = {
      description: 'This is a test task without a title',
      assignee: 'John Doe',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('title is required');
  });

  it('should create a new task without description and return it with a 201 status code', async () => {
    const newTask = {
      title: 'Test Task without description',
      assignee: 'John Doe',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newTask.title);
    expect(response.body.description).toBeUndefined();
    expect(response.body.assignee).toBe(newTask.assignee);
    expect(response.body.status).toBe(ASSIGNED_STATUS);
  });

  it('should return a 400 status code if assignee is missing', async () => {
    const newTask = {
      title: 'Test Task without assignee',
      description: 'This is a test task without an assignee',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe('assignee is required');
  });

  it('should return an authentication error if no token is provided', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      assignee: 'John Doe',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('authentication required');
  });

  it('should return an authentication error if an invalid token is provided', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      assignee: 'John Doe',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${INVALID_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('invalid token');
  });

  it('should return an authentication error if an expired token is provided', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      assignee: 'John Doe',
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${EXPIRED_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('token expired');
  });
});
