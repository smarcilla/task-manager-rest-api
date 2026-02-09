import request from 'supertest';
import app from '../../src/app';
import { connect, clear, close } from '../setup';

import { ASSIGNED_STATUS } from '../../src/shared/constants';

import {
  EXPIRED_TOKEN,
  VALID_TOKEN,
  INVALID_TOKEN,
} from '../auth/fixtures/token.generator';

describe('GET /tasks', () => {
  beforeAll(async () => {
    await connect();
  }, 30000);

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  it('should return an array of tasks with status code 200', async () => {
    const newTask1 = {
      title: 'Test Task 1',
      description: 'This is the first test task',
      assignee: 'John Doe',
    };

    const newTask2 = {
      title: 'Test Task 2',
      description: 'This is the second test task',
      assignee: 'Jane Doe',
    };

    await request(app)
      .post('/tasks')
      .send(newTask1)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    await request(app)
      .post('/tasks')
      .send(newTask2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    const response = await request(app)
      .get('/tasks')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0].title).toBe(newTask1.title);
    expect(response.body[0].description).toBe(newTask1.description);
    expect(response.body[0].assignee).toBe(newTask1.assignee);
    expect(response.body[0].status).toBe(ASSIGNED_STATUS);
  });

  it('should return an empty array if there are no tasks', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return tasks filtered by assignee', async () => {
    const newTask1 = {
      title: 'Task for John',
      description: 'This task is assigned to John',
      assignee: 'John Doe',
    };

    const newTask2 = {
      title: 'Task for Jane',
      description: 'This task is assigned to Jane',
      assignee: 'Jane Doe',
    };

    await request(app)
      .post('/tasks')
      .send(newTask1)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    await request(app)
      .post('/tasks')
      .send(newTask2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    const response = await request(app)
      .get('/tasks?assignee=John Doe')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].assignee).toBe('John Doe');
  });

  it('should return tasks filtered by status', async () => {
    const newTask1 = {
      title: 'Task 1',
      description: 'This task is assigned',
      assignee: 'John Doe',
    };

    const newTask2 = {
      title: 'Task 2',
      description: 'This task is in progress',
      assignee: 'Jane Doe',
    };

    await request(app)
      .post('/tasks')
      .send(newTask1)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    await request(app)
      .post('/tasks')
      .send(newTask2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    const response = await request(app)
      .get('/tasks?status=assigned')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    //TODO: completar este test cuando el endpoint marcar como completada esta implementado
    expect(response.body[0].status).toBe(ASSIGNED_STATUS);
  });

  it('should not filter by status if the status is invalid', async () => {
    const newTask1 = {
      title: 'Task 1',
      description: 'This task is assigned',
      assignee: 'John Doe',
    };

    const newTask2 = {
      title: 'Task 2',
      description: 'This task is in progress',
      assignee: 'Jane Doe',
    };

    await request(app)
      .post('/tasks')
      .send(newTask1)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    await request(app)
      .post('/tasks')
      .send(newTask2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    const response = await request(app)
      .get('/tasks?status=in_progress')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe(
      'Invalid option: expected one of "assigned"|"completed"'
    );
  });

  it('should return tasks filtered by title', async () => {
    const newTask1 = {
      title: 'Task for John',
      description: 'This task is assigned to John',
      assignee: 'John Doe',
    };

    const newTask2 = {
      title: 'Task for Jane',
      description: 'This task is assigned to Jane',
      assignee: 'Jane Doe',
    };

    await request(app)
      .post('/tasks')
      .send(newTask1)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    await request(app)
      .post('/tasks')
      .send(newTask2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    const response = await request(app)
      .get('/tasks?title=John')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Task for John');
  });

  it('should not filter by title if the search term is less than 3 characters', async () => {
    const newTask1 = {
      title: 'Task for John',
      description: 'This task is assigned to John',
      assignee: 'John Doe',
    };

    const newTask2 = {
      title: 'Task for Jane',
      description: 'This task is assigned to Jane',
      assignee: 'Jane Doe',
    };

    await request(app)
      .post('/tasks')
      .send(newTask1)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    await request(app)
      .post('/tasks')
      .send(newTask2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    const response = await request(app)
      .get('/tasks?title=Jo')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toBe(
      'title search term must be at least 3 characters long'
    );
  });

  it('should return paginated tasks', async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/tasks')
        .send({
          title: `Task ${i}`,
          description: `This is task number ${i}`,
          assignee: `User ${i}`,
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
    }

    const response = await request(app)
      .get('/tasks?page=2&limit=2')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0].title).toBe('Task 3');
    expect(response.body[1].title).toBe('Task 4');
  });

  it('should return the remaining tasks if the page is partially filled', async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/tasks')
        .send({
          title: `Task ${i}`,
          description: `This is task number ${i}`,
          assignee: `User ${i}`,
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
    }

    const response = await request(app)
      .get('/tasks?page=3&limit=2')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it('should return an empty array if the page does not exist', async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/tasks')
        .send({
          title: `Task ${i}`,
          description: `This is task number ${i}`,
          assignee: `User ${i}`,
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
    }

    const response = await request(app)
      .get('/tasks?page=4&limit=2')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return an authentication error if no token is provided', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('authentication required');
  });

  it('should return an authentication error if an invalid token is provided', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${INVALID_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('invalid token');
  });

  it('should return an authentication error if an expired token is provided', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${EXPIRED_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('token expired');
  });
});
