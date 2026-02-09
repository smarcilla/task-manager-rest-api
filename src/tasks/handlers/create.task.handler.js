import { createTask } from '../task.repository.js';

import { ASSIGNED_STATUS } from '../../shared/constants';

const createTaskHandler = async (req, res) => {
  const { title, description, assignee } = req.body;

  const newTask = {
    title,
    description,
    assignee,
    status: ASSIGNED_STATUS,
  };

  const savedTask = await createTask(newTask);

  res.status(201).json({ ...savedTask, id: savedTask._id });
};

export default createTaskHandler;
