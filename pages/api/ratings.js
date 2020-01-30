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
    case "POST":
      await handlePostRequest(req, res);
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

    console.log(userId);
    const ratings = await Rating.find({ user: userId }).populate({
      path: "products.product",
      model: Product
    });
    await Product.findOneAndUpdate();
    res.status(200).json({ ratings });
  } catch (error) {
    console.error(error);
    res.status(403).send("Please login again");
  }
}

async function handlePostRequest(req, res) {
  const { productId, rating, userId } = req.body;
  // console.log(productId, rating);

  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }

  try {
    let productRating;

    productRating = await Rating.findOneAndUpdate(
      {
        product: productId,
        user: userId
      },
      { $set: { star: rating } },
      { new: true }
    );
    console.log("productRating", productRating);
    if (!productRating) {
      productRating = await new Rating({
        user: userId,
        product: productId,
        star: rating
      }).save();
    }
    const { ratings } = await Product.findOneAndUpdate(
      { _id: productId },
      { $addToSet: { ratings: productRating._id } },
      { new: true }
    ).populate({
      path: "ratings",
      model: Rating
    });
    // const user = await Rating.findById({
    //   user: "ObjectId(5e30796e468c9e159451ea13)",
    //   product: "ObjectId(5e1625f5a17e567a29619b17)"
    // });
    return res.status(200).json(ratings);
  } catch (error) {
    console.error(error);
  }
}
