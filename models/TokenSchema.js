import mongoose from "mongoose";

const { String, ObjectId } = mongoose.Schema.Types;

const TokenSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: 'User'
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 604800
    }
  }
);

export default mongoose.models.TokenSchema || mongoose.model("TokenSchema", TokenSchema);
