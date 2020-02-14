import Product from "../../models/Product";
import connectDb from "../../utils/connectDb";
import Discount from "../../models/Discount";
import Rating from "../../models/Rating";

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
  const { productId } = req.body;
  try {
    await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { numberOfViews: 1 } }
    );
    res.status(200).send("incremented product view");
  } catch (error) {
    res.status(500).send("Error incrementing number of product views");
  }
}

async function handleGetRequest(req, res) {
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  try {
    const totalDiscounts = await Discount.find({}).populate({
      path: "products",
      model: Product,
      populate: {
        path: "ratings",
        model: Rating
      },
      populate: {
        path: "discounts",
        model: Discount,
        populate: { path: "products", model: Product }
      }
    });
    const topViewedTenProducts = await Product.aggregate([
      {
        $sort: { numberOfViews: -1 }
      },
      {
        $limit: 10
      }
    ]);
    // group products by their categories and create an array of products for each category.
    const groupedProducts = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          products: { $push: "$$ROOT" }
        }
      }
    ]);

    const topProductsOfCategory = groupedProducts.map(group => {
      const sortedProducts = group.products.sort(
        (a, b) => b.numberOfViews - a.numberOfViews
      );
      const products = sortedProducts.slice(0, 3);
      return {
        _id: group._id,
        products
      };
    });

    const results = {
      topViewedTenProducts,
      topProductsOfCategory,
      totalDiscounts
    };

    res.status(200).json(results);
  } catch (error) {
    res.status(500).send("Error getting number of product views");
  }
}
