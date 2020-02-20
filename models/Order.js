import mongoose from 'mongoose';

const { ObjectId, Number } = mongoose.Schema.Types;

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    products: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: ObjectId,
          ref: 'Product',
        },
        discountPercentage: {
          type: Number,
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
      },
    ],
    email: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    code: {
      type: ObjectId,
      ref: 'Code'
    },
    currency: {
      type: String,
      enum: ['usd', 'eur'],
      default: 'usd'
    },
    totalDiscount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
