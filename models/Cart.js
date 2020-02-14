import mongoose from "mongoose";
import Discount from './Discount';

const { ObjectId, Number, Boolean } = mongoose.Schema.Types;

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
      },
      discount: {
        type: ObjectId,
        ref: Discount
      },
      discountApplied: {
        type: Boolean,
        default: false
      },
      discountAmount: {
        type: Number,
        default: 0
      }
    }
  ]
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
