// import products from "../../static/products.json";
import Product from "../../models/Product";
import connectDb from "../../utils/connectDb";

connectDb();

export default async (req, res) => {
  const { page, size, category } = req.query;

  // convert query string value to numbers:
  const pageNum = Number(page);
  const pageSize = Number(size);
  let products = [];
  const totalDocs = await Product.countDocuments();
  const totalPages = Math.ceil(totalDocs / pageSize);

  // get number of product in page 1:
  if (pageNum === 1) {
    products = await Product.find({ category: category })
      .sort({ name: "asc" })
      .limit(pageSize);
  } else {
    // get get the rest of pages
    const skips = pageSize * (pageNum - 1);
    products = await Product.find({ category: category })
      .skip(skips)
      .limit(pageSize);
  }

  // const products = await Product.find();
  res.status(200).json({ products, totalPages });
};
