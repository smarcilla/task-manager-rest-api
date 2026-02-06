import { createTask } from './task.repository.js';

//TODO: Decidir si todos los handlers de tareas van a estar en este archivo o si vamos a crear uno por cada endpoint. Por ahora, lo dejo todo aquí para tenerlo más organizado, pero si el proyecto crece, podríamos considerar dividirlo en varios archivos.
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
