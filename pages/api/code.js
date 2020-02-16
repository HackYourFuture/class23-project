import Code from "../../models/Code";
import connectDb from "../../utils/connectDb";

connectDb();

export default async (req, res) => {
  const { values } = req.body;
  console.log("Hello", { values });
  try {
    const code = await Code.findOne({ value: values });
    if (code) {
      return res.status(200).json(values);
    } else {
      res.status(500).send("Invalid Promotion Code");
    }
    console.log(code);
  } catch (error) {
    console.error(error);
    res.status(404).send("Connection lost");
  }
};
