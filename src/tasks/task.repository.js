import Task from './task.model.js';

export const createTask = async (taskData) => {
  const task = new Task(taskData);
  const savedTask = await task.save();

  return savedTask.toJSON();
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
  return tasks;
};
