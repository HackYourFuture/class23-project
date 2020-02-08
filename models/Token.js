import mongoose from 'mongoose';

const { String, ObjectId } = mongoose.Schema.Types;

const TokenSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: 'User',
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//with index, the token will be expired after 12 hours and deleted from db
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 });

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
