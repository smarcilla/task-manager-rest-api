import { findTasks } from '../task.repository';

const listTaskHandler = async (req, res) => {
  const query = req.query;

  const tasks = await findTasks(query);

  res.status(200).json(tasks);
};

export default listTaskHandler;
