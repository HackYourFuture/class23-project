import mongoose from "mongoose";
import shortid from "shortid";

const { String, Number, ObjectId } = mongoose.Schema.Types;

const CommentSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User"
  },
  content: {
    type: String,
    required: true
  },
  updated_at: {
    type: mongoose.Schema.Types.Date,
    required: true
  }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  sku: {
    type: String,
    unique: true,
    default: shortid.generate
  },
  description: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  comments: [CommentSchema],
  category: {
    type: String,
    required: true
  },
  numberOfViews: {
    type: Number,
    default: 0
  },
  ratings: [
    {
      type: ObjectId,
      ref: "Rating"
    }
  ]
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
