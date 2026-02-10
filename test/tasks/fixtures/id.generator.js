// Use mongoose.Types.ObjectId to generate a valid MongoDB ID
import mongoose from 'mongoose';

export const NOT_FOUND_ID = new mongoose.Types.ObjectId().toString();
