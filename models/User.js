import mongoose from "mongoose";

const { String } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: false,
      select: false
    },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin", "root"]
    },
    signInMethod: {
      type: String,
      required: true,
      default: "email",
      enum: ['email', 'google', 'facebook']
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
