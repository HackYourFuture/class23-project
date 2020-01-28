import jwt from "jsonwebtoken";
import Rating from "../../models/Rating";
import Product from "../../models/Product";
import connectDb from "../../utils/connectDb";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

connectDb();

export default async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleGetRequest(req, res);
      break;
    case "PUT":
      await handlePutRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
      break;
  }
};

async function handleGetRequest(req, res) {
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const ratings = await Rating.find({ user: userId }).populate({
      path: "products.product",
      model: Product
    });
    res.status(200).json({ ratings });
  } catch (error) {
    console.error(error);
    res.status(403).send("Please login again");
  }
}

async function handlePutRequest(req, res) {
  const { star, productId } = req.body;
  console.log(req.headers);
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  //get user by token
  const { userId } = jwt.verify(
    req.headers.authorization,
    process.env.JWT_SECRET
  );
  // find rating list based on userId
  const ratingList = await Rating.findOne({ user: userId });
  //check if product already rated and added to the list
  const productIsRated = ratingList.products.some(doc =>
    ObjectId(productId).equals(doc.product)
  );
  console.log(star);
  // if so, update product ratings
  if (productIsRated) {
    await Rating.findOneAndUpdate(
      {
        _id: ratingList._id,
        "products.product": productId
      },
      { "products.$.star": star }
    );
  } else {
    // if not add the new product
    const newRating = { product: productId, star };
    await Rating.findOneAndUpdate(
      { _id: ratingList._id },
      { $addToSet: { products: newRating } }
    );
  }
  res.status(200).send("Cart updated");
}
