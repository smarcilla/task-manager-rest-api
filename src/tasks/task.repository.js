import Task from './task.model.js';

import { mapTask, mapTasks } from './task.mapper.js';
import { AppError } from '../shared/errors/error.handler.js';

export const createTask = async (taskData) => {
  const task = new Task(taskData);
  const savedTask = await task.save();

  return mapTask(savedTask);
};

export const updateTask = async (taskId, updateData, filter = {}) => {
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, ...filter },
    updateData,
    { new: true }
  ).lean();

  if (updatedTask) return mapTask(updatedTask);

  const existing = await Task.findById(taskId).lean();
  if (!existing) {
    throw new AppError('Task not found', 404, [
      { message: `Task ${taskId} not found` },
    ]);
  }

  // Existe pero no cumple el filtro -> precondición fallida
  throw new AppError(`Task is already completed`, 400, [
    { message: `Task ${taskId} is already completed` },
  ]);
};

export const findTasks = async (query) => {
  const pageNum = Math.max(1, Number(query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    ...(query.status && { status: query.status }),
    ...(query.assignee && { assignee: query.assignee }),
    ...(query.title && { title: { $regex: query.title, $options: 'i' } }),
  };

  const tasks = await Task.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .skip(skip)
    .limit(limitNum)
    .lean()
    .exec();
  return mapTasks(tasks);
};
