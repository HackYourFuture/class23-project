import Product from "../../models/Product";
import Cart from "../../models/Cart";
import User from "../../models/User";
import connectDb from "../../utils/connectDb";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Rating from "../../models/Rating";

connectDb();

const COMMENTS_PER_PAGE = 5;

export default async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleGetRequest(req, res);
      break;
    case "POST":
      await handlePostRequest(req, res);
      break;
    case "PUT":
      await handlePutRequest(req, res);
      break;
    case "DELETE":
      await handleDeleteRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
      break;
  }
};

async function handleGetRequest(req, res) {
  const { _id, page } = req.query;
  const startIndex =
    page && !Number.isNaN(Number(page)) && page > 0
      ? (page - 1) * COMMENTS_PER_PAGE
      : 0;

  const product = await Product.findOne({ _id })
    .populate({ path: "comments.user", model: User })
    .populate({
      path: "ratings",
      model: Rating
    })
    .slice("comments", startIndex, startIndex + COMMENTS_PER_PAGE);

  //get three the products that matches with the category
  const products = await Product.aggregate()
    .match({
      $and: [
        { _id: { $ne: product._id } },
        {
          category: product.category
        }
      ]
    })
    .limit(3);

  // Get comments count
  const [{ comments: count }] = await Product.aggregate()
    .match({ _id: mongoose.Types.ObjectId(_id) })
    .project({
      comments: {
        $cond: [{ $ifNull: ["$comments", false] }, { $size: "$comments" }, 0]
      }
    });
  res.status(200).json({
    totalComments: Math.ceil(count / COMMENTS_PER_PAGE),
    product,
    allProducts: products
  });
}

async function handlePostRequest(req, res) {
  const { name, price, description, mediaUrl, category } = req.body;
  try {
    if (!name || !price || !description || !mediaUrl || !category) {
      return res.status(422).send("Product missing one or more fields");
    }
    const product = await new Product({
      name,
      price,
      description,
      mediaUrl,
      category
    }).save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error in creating product");
  }
}

async function handlePutRequest(req, res) {
  // Check if the user is authorized
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  // Get the required fields & check if they exist
  const { comment, productId } = req.body;
  if (!comment || !productId) {
    return res.status(422).send("Comment and productId are required");
  }
  try {
    // Verify the token
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    // Find the user
    const user = await User.findOne({ _id: userId });
    // If the user exists
    if (user) {
      // Create the comment
      const newComment = {
        user: userId,
        content: comment,
        updated_at: Date.now()
      };
      // Add the comment to the Product & get new Product
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        { $push: { comments: { $each: [newComment], $position: 0 } } },
        { new: true }
      )
        .populate({ path: "comments.user", model: User })
        .slice("comments", COMMENTS_PER_PAGE);

      // Get comments count
      const [{ comments: count }] = await Product.aggregate()
        .match({ _id: mongoose.Types.ObjectId(productId) })
        .project({
          comments: {
            $cond: [
              { $ifNull: ["$comments", false] },
              { $size: "$comments" },
              0
            ]
          }
        });

      // Return comments count and the updated product
      res.status(200).json({
        totalComments: Math.ceil(count / COMMENTS_PER_PAGE),
        product: updatedProduct
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(403).send(`Please login to add comments!`);
  }
}

async function handleDeleteRequest(req, res) {
  const { _id } = req.query;

  try {
    // 1) Delete product by id
    await Product.findOneAndDelete({ _id });

    // 2) Remove from all carts, referenced as "product"
    await Cart.updateMany(
      { "products.product": _id },
      { $pull: { products: { product: _id } } }
    );
    res.status(204).json({});
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting product");
  }
}
