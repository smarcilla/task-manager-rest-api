import { createTask } from './task.repository.js';

const taskHandler = async (req, res) => {
  const { title, description, assignee } = req.body;

  const newTask = {
    title,
    description,
    assignee,
    status: 'assigned',
  };

  const savedTask = await createTask(newTask);

  res.status(201).json({ ...savedTask, id: savedTask._id });
};

export default taskHandler;
