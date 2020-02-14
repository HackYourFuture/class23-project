import Code from "../../models/Code";
import connectDb from "../../utils/connectDb";

connectDb();

export default async (req, res) => {
  switch (req.method) {
    case "POST":
      await handlePostRequest(req, res);
      break;
    case "GET":
      await handleGetRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} is not allowed`);
      break;
  }
};
async function handlePostRequest(req, res) {
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
}
