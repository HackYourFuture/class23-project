import connectDb from "../../utils/connectDb";
import Discount from "../../models/Discount";
import Product from "../../models/Product";
import Cart from "../../models/Cart";

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
    const amountBased = await Discount.find({
      discountType: { $eq: "amountBased" }
    }).populate({
      path: "products",
      model: Product
    });

    res.status(200).json({ amountBased });
  } catch (error) {
    console.error(error);
  }
}

async function handlePostRequest(req, res) {
  const {
    productId,
    discountType,
    discountPercentage,
    requiredAmount,
    isActive,
    startDate,
    endDate,
    category
  } = req.body;

  try {
    const discount = await new Discount({
      products: productId,
      discountType: discountType,
      isActive: isActive,
      discountPercentage: discountPercentage,
      amountRequired: requiredAmount,
      startDate: startDate,
      endDate: endDate,
      categories: [category]
    }).save();
    return res.status(200).json(discount);
  } catch (error) {
    console.error(error);
  }
}
