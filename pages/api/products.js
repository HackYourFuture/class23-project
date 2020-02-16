// import products from "../../static/products.json";
import Product from "../../models/Product";
import connectDb from "../../utils/connectDb";
import Rating from "../../models/Rating";
import Discount from "../../models/Discount";

connectDb();

export default async (req, res) => {
  const { page, size, category } = req.query;

  // convert query string value to numbers:
  const pageNum = Number(page);
  const pageSize = Number(size);
  let products = [];

  let query = category ? { category: category } : {};

  let totalDocs = await Product.countDocuments(query);
  let totalPages = Math.ceil(totalDocs / pageSize);

  const skips = pageSize * (pageNum - 1);
  products = await Product.find(query)
    .sort({ name: "asc" })
    .skip(skips)
    .limit(pageSize)
    .populate({
      path: "ratings",
      model: Rating
    })
    .populate({
      path: "discounts",
      model: Discount
    });

  res.status(200).json({ products, totalPages });
};
