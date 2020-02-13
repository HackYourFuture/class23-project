import connectDb from "../../utils/connectDb";
import Discount from "../../models/Discount";

export default async (req, res) => {
  switch (req.method) {
    case "POST":
      await handlePostRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
      break;
  }
};

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
      requiredAmount: requiredAmount,
      startDate: startDate,
      endDate: endDate,
      categories: [category]
    }).save();
    return res.status(200).json(discount);
  } catch (error) {
    console.error(error);
  }
}
