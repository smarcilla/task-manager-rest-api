//Usa mongoose.Types.ObjectId para generar un ID válido de MongoDB
import mongoose from 'mongoose';

export const NOT_FOUND_ID = new mongoose.Types.ObjectId().toString();
