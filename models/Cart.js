import mongoose from "mongoose";

const { ObjectId, Number, String } = mongoose.Schema.Types;

const CartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User"
  },
  products: [
    {
      quantity: {
        type: Number,
        default: 1
      },
      product: {
        type: ObjectId,
        ref: "Product"
      }
    }
  ],
  discountedProducts: [{ type: ObjectId, ref: "Discount" }],
  discountedCategories: [{ type: String, ref: "Discount" }],
  discountAmount: Number,
  discountedTotal: Number
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
