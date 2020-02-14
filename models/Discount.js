import mongoose from "mongoose";
import Product from "./Product";
const { ObjectId, String, Number, Boolean, Date } = mongoose.Schema.Types;
const DiscountSchema = new mongoose.Schema({
  products: [{ type: ObjectId, ref: Product }],
  product: {
    type: ObjectId,
    ref: Product
  },
  discountType: {
    type: String,
    enum: ["amountBased", "relationBased"]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  categories: {
    type: [String]
  },
  category: {
    type: String
  },
  amountRequired: {
    type: Number
  },
  discountPercentage: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  multipleUnits: {
    type: Boolean
  },
  unitType: {
    type: String,
    enum: ["product", "category"],
    required: true
  }
});

export default mongoose.models.Discount ||
  mongoose.model("Discount", DiscountSchema);
