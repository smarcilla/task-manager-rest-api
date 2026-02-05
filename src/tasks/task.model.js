import mongoose from 'mongoose';

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
      enum: ['assigned', 'completed'],
      default: 'assigned',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
