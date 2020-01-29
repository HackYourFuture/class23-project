import Product from "../../models/Product";
import Cart from '../../models/Cart';
import User from '../../models/User';
import connectDb from "../../utils/connectDb";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

connectDb();

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
  const startIndex = page && !Number.isNaN(Number(page)) && page > 0 ? (page - 1) * 10 : 0;
  const product = await Product.findOne({ _id })
    .populate({ path: 'comments.user', model: User })
    .slice('comments', startIndex, startIndex + 10);

  // Get comments count
  const [{ comments: count }] = await Product.aggregate()
    .match({ _id: mongoose.Types.ObjectId(_id) })
    .project({ comments: { $size: "$comments" } });
  console.log(product);
  res.status(200).json({ totalComments: count, product });
}

async function handlePostRequest(req, res) {
  const { name, price, description, mediaUrl } = req.body;
  try {
    if (!name || !price || !description || !mediaUrl) {
      return res.status(422).send("Product missing one or more fields");
    }
    const product = await new Product({
      name,
      price,
      description,
      mediaUrl
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
  const { header, content, productId } = req.body;
  if (!header || !content || !productId) {
    return res.status(422).send("Header, content and productId are required");
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
      const newComment = { user: userId, header, content, updated_at: Date.now() };
      // Add the comment to the Product & get new Product
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        { $push: { comments: { $each: [newComment], $position: 0 } } },
        { new: true }
      )
        .populate({ path: 'comments.user', model: User })
        .slice('comments', 10)

      // Get comments count
      const [{ comments: count }] = await Product.aggregate()
        .match({ _id: mongoose.Types.ObjectId(productId) })
        .project({ comments: { $size: "$comments" } });

      // Return comments count and the updated product 
      console.log(mongoose.Types.ObjectId(updatedProduct.comments[0]._id).getTimestamp());
      res.status(200).json({ totalComments: count, product: updatedProduct });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(403).send("Invalid token");
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
    )
    res.status(204).json({});

  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting product")
  }
}
