import mongoose from 'mongoose';

import { ASSIGNED_STATUS, COMPLETED_STATUS } from '../shared/constants';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'title is required'], trim: true },
    description: { type: String },
    assignee: {
      type: String,
      required: [true, 'assignee is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: [ASSIGNED_STATUS, COMPLETED_STATUS],
      default: ASSIGNED_STATUS,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
