import { updateTask } from '../task.repository.js';
import { COMPLETED_STATUS } from '../../shared/constants.js';

const markCompletedTaskHandler = async (req, res) => {
  const { id } = req.params;

  const updatedTask = await updateTask(
    id,
    { status: COMPLETED_STATUS },
    { status: { $ne: COMPLETED_STATUS } }
  );

  res.status(200).json(updatedTask);
};

export default markCompletedTaskHandler;
