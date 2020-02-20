import mongoose from "mongoose";

const { String, Number, Boolean } = mongoose.Schema.Types;

const CodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  amountEuro: {
    type: Number,
    default: function () {
      return this.amount * 0.92;
    }
  },
  isUsed: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Code || mongoose.model("Code", CodeSchema);
