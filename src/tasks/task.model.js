import mongoose from 'mongoose';

import { ASSIGNED_STATUS, COMPLETED_STATUS } from '../shared/constants.js';

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

taskSchema.index({ status: 1, assignee: 1, createdAt: 1, _id: 1 });

taskSchema.index({ assignee: 1, createdAt: 1, _id: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
