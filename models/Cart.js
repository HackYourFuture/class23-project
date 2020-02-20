import mongoose from "mongoose";
import Discount from "./Discount";
import Code from './Code';
import User from './User';
import Product from './Product';

const { ObjectId, Number, Boolean } = mongoose.Schema.Types;

const CartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User'
  },
  products: [
    {
      quantity: {
        type: Number,
        default: 1
      },
      product: {
        type: ObjectId,
        ref: 'Product'
      },
      discount: {
        type: ObjectId,
        ref: 'Discount'
      },
      discountApplied: {
        type: Boolean,
        default: false
      },
      discountAmount: {
        type: Number,
        default: 0
      },
      discountAmountEuro: {
        type: Number,
        default: 0
      }
    }
  ],
  code: {
    type: ObjectId,
    ref: 'Code'
  }
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
