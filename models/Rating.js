import mongoose from "mongoose";

const { ObjectId, Number } = mongoose.Schema.Types;

const RatingSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User"
  },
  products: [
    {
      product: {
        type: ObjectId,
        ref: "Product"
      },
      star: {
        type: Number,
        default: 0
      }
    }
  ]
});

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
