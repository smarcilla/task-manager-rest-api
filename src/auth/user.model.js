import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
    },
    password: { type: String, required: [true, 'password is required'] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password; // Remove password from the response
        return ret;
      },
    },
  }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
  this.password = hash;
});

// If you update password via findOneAndUpdate, hash it too
//TODO: Elimminar este pre fincdOneAndUpdate sino llego a usarlo. No tengo planes de permitir actualizar el password.
userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (!update) return;
  // handle both direct set and $set
  if (update.password) {
    update.password = await bcrypt.hash(update.password, SALT_ROUNDS);
    this.setUpdate(update);
    return;
  }
  if (update?.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, SALT_ROUNDS);
    this.setUpdate(update);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
