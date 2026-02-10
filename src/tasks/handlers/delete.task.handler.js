import { deleteTask } from '../task.repository.js';

const deleteTaskHandler = async (req, res) => {
  const { id } = req.params;

  await deleteTask(id);

  res.status(204).send();
};

export default deleteTaskHandler;
