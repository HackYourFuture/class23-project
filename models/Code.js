import mongoose from "mongoose";

const { String, Array } = mongoose.Schema.Types;

const CodeSchema = new mongoose.Schema({
  codes: [
    {
      value: {
        type: String
      }
    }
  ]
});

export default mongoose.models.Code || mongoose.model("Code", CodeSchema);
