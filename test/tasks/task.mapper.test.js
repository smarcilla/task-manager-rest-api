import { mapTask, mapTasks } from '../../src/tasks/task.mapper.js';

describe('mapTask', () => {
  it('should map a valid task document', () => {
    const doc = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Test task',
      description: 'Test description',
      completed: false,
      userId: 'user123',
      __v: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const result = mapTask(doc);

    expect(result).toEqual({
      id: '507f1f77bcf86cd799439011',
      title: 'Test task',
      description: 'Test description',
      completed: false,
      userId: 'user123',
    });
  });

  it('should handle document with toJSON method', () => {
    const doc = {
      _id: '123',
      title: 'Task with toJSON',
      completed: true,
      toJSON: function () {
        return {
          _id: this._id,
          title: this.title,
          completed: this.completed,
          __v: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        };
      },
    };

    const result = mapTask(doc);

    expect(result).toEqual({
      id: '123',
      title: 'Task with toJSON',
      completed: true,
    });
  });

  it('should return null when doc is null', () => {
    const result = mapTask(null);
    expect(result).toBeNull();
  });

  it('should return undefined when doc is undefined', () => {
    const result = mapTask(undefined);
    expect(result).toBeUndefined();
  });

  it('should exclude __v from result', () => {
    const doc = {
      _id: '123',
      title: 'Task',
      __v: 5,
    };

    const result = mapTask(doc);

    expect(result).not.toHaveProperty('__v');
    expect(result).toEqual({
      id: '123',
      title: 'Task',
    });
  });

  it('should exclude createdAt from result', () => {
    const doc = {
      _id: '123',
      title: 'Task',
      createdAt: new Date('2024-01-01'),
    };

    const result = mapTask(doc);

    expect(result).not.toHaveProperty('createdAt');
    expect(result).toEqual({
      id: '123',
      title: 'Task',
    });
  });

  it('should exclude updatedAt from result', () => {
    const doc = {
      _id: '123',
      title: 'Task',
      updatedAt: new Date('2024-01-01'),
    };

    const result = mapTask(doc);

    expect(result).not.toHaveProperty('updatedAt');
    expect(result).toEqual({
      id: '123',
      title: 'Task',
    });
  });

  it('should convert _id to string', () => {
    const doc = {
      _id: 12345,
      title: 'Task',
    };

    const result = mapTask(doc);

    expect(result.id).toBe('12345');
    expect(typeof result.id).toBe('string');
  });

  it('should handle _id as ObjectId-like object with toString', () => {
    const mockObjectId = {
      toString: () => '507f1f77bcf86cd799439011',
    };

    const doc = {
      _id: mockObjectId,
      title: 'Task',
    };

    const result = mapTask(doc);

    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(typeof result.id).toBe('string');
  });

  it('should preserve all other properties (rest)', () => {
    const doc = {
      _id: '123',
      title: 'Task',
      description: 'Description',
      completed: false,
      userId: 'user456',
      customField: 'custom value',
      tags: ['tag1', 'tag2'],
    };

    const result = mapTask(doc);

    expect(result).toEqual({
      id: '123',
      title: 'Task',
      description: 'Description',
      completed: false,
      userId: 'user456',
      customField: 'custom value',
      tags: ['tag1', 'tag2'],
    });
  });

  it('should handle document with only _id', () => {
    const doc = {
      _id: '123',
    };

    const result = mapTask(doc);

    expect(result).toEqual({
      id: '123',
    });
  });

  it('should handle empty object', () => {
    const doc = {};

    const result = mapTask(doc);

    expect(result).toEqual({
      id: 'undefined',
    });
  });

  it('should not modify _id property in result', () => {
    const doc = {
      _id: '123',
      title: 'Task',
    };

    const result = mapTask(doc);

    expect(result).not.toHaveProperty('_id');
    expect(result).toHaveProperty('id');
  });

  it('should handle document with all fields as undefined', () => {
    const doc = {
      _id: undefined,
      __v: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      title: 'Task',
    };

    const result = mapTask(doc);

    expect(result).toEqual({
      id: 'undefined',
      title: 'Task',
    });
  });

  it('should call toJSON if it exists', () => {
    const toJSONSpy = jest.fn().mockReturnValue({
      _id: '123',
      title: 'Spied task',
    });

    const doc = {
      toJSON: toJSONSpy,
    };

    mapTask(doc);

    expect(toJSONSpy).toHaveBeenCalledTimes(1);
  });

  it('should not call toJSON if doc is falsy', () => {
    const result1 = mapTask(null);
    const result2 = mapTask(undefined);
    const result3 = mapTask(0);
    const result4 = mapTask('');

    expect(result1).toBeNull();
    expect(result2).toBeUndefined();
    expect(result3).toBe(0);
    expect(result4).toBe('');
  });

  it('should handle boolean completed field', () => {
    const doc1 = {
      _id: '123',
      completed: true,
    };

    const doc2 = {
      _id: '456',
      completed: false,
    };

    expect(mapTask(doc1)).toEqual({ id: '123', completed: true });
    expect(mapTask(doc2)).toEqual({ id: '456', completed: false });
  });
});

describe('mapTasks', () => {
  it('should map an array of task documents', () => {
    const docs = [
      {
        _id: '1',
        title: 'Task 1',
        completed: false,
        __v: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        _id: '2',
        title: 'Task 2',
        completed: true,
        __v: 0,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-04'),
      },
    ];

    const result = mapTasks(docs);

    expect(result).toEqual([
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true },
    ]);
  });

  it('should return empty array when docs is empty array', () => {
    const result = mapTasks([]);
    expect(result).toEqual([]);
  });

  it('should return empty array when docs is null', () => {
    const result = mapTasks(null);
    expect(result).toEqual([]);
  });

  it('should return empty array when docs is undefined', () => {
    const result = mapTasks(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array when docs is not an array', () => {
    const result1 = mapTasks('not an array');
    const result2 = mapTasks({ _id: '123', title: 'Task' });
    const result3 = mapTasks(123);

    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
    expect(result3).toEqual([]);
  });

  it('should handle array with null elements', () => {
    const docs = [
      { _id: '1', title: 'Task 1' },
      null,
      { _id: '2', title: 'Task 2' },
    ];

    const result = mapTasks(docs);

    expect(result).toEqual([
      { id: '1', title: 'Task 1' },
      null,
      { id: '2', title: 'Task 2' },
    ]);
  });

  it('should handle array with undefined elements', () => {
    const docs = [
      { _id: '1', title: 'Task 1' },
      undefined,
      { _id: '2', title: 'Task 2' },
    ];

    const result = mapTasks(docs);

    expect(result).toEqual([
      { id: '1', title: 'Task 1' },
      undefined,
      { id: '2', title: 'Task 2' },
    ]);
  });

  it('should handle array with documents that have toJSON', () => {
    const docs = [
      {
        _id: '1',
        title: 'Task 1',
        toJSON: function () {
          return { _id: '1', title: 'Task 1', __v: 0 };
        },
      },
      {
        _id: '2',
        title: 'Task 2',
        toJSON: function () {
          return { _id: '2', title: 'Task 2', __v: 0 };
        },
      },
    ];

    const result = mapTasks(docs);

    expect(result).toEqual([
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' },
    ]);
  });

  it('should handle single element array', () => {
    const docs = [{ _id: '123', title: 'Single task', completed: false }];

    const result = mapTasks(docs);

    expect(result).toEqual([
      { id: '123', title: 'Single task', completed: false },
    ]);
  });

  it('should handle large arrays', () => {
    const docs = Array.from({ length: 100 }, (_, i) => ({
      _id: String(i),
      title: `Task ${i}`,
    }));

    const result = mapTasks(docs);

    expect(result).toHaveLength(100);
    expect(result[0]).toEqual({ id: '0', title: 'Task 0' });
    expect(result[99]).toEqual({ id: '99', title: 'Task 99' });
  });

  it('should return new array reference', () => {
    const docs = [{ _id: '1', title: 'Task 1' }];

    const result = mapTasks(docs);

    expect(result).not.toBe(docs);
    expect(Array.isArray(result)).toBe(true);
  });
});
