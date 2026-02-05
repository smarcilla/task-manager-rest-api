import Task from './task.model.js';

export const createTask = async (taskData) => {
  const task = new Task(taskData);
  const savedTask = await task.save();

  return savedTask.toJSON();
};
