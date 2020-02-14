import Product from "../../models/Product";
import Discount from "../../models/Discount";
import Cart from "../../models/Cart";
import User from "../../models/User";
import connectDb from "../../utils/connectDb";
import jwt from "jsonwebtoken";
import {
  checkDiscountForRequiredProps,
  checkDiscountIsOK,
  getRequiredPropsListForDiscount,
  UNIT_TYPES,
  DISCOUNT_TYPES
} from "../../utils/discount";

connectDb();

export default async (req, res) => {
  switch (req.method) {
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

// Finds & returns all discounts by product, by category or with-no-condition (all of them)
// And also if active parameter is provided as true, returns just the active ones
async function handleGetRequest(req, res) {
  const { productId, category, isActive } = req.query;
  let discounts;
  const isActiveQuery = {
    $and: [
      { isActive },
      { startDate: { $lte: new Date() } },
      { endDate: { $gte: new Data() } }
    ]
  };
  try {
    if (productId) {
      // discounts for product
      if (isActive) {
        discounts = await Discount.find({
          $and: [
            {
              $or: [{ "product._id": productId }, { "products._id": productId }]
            },
            { ...isActiveQuery }
          ]
        });
      } else {
        discounts = await Discount.find({
          $or: [{ "product._id": productId }, { "products._id": productId }]
        });
      }
    } else if (category) {
      // discounts for category
      if (isActive) {
        discounts = await Discount.find({
          $and: [
            { $or: [{ category: category }, { categories: category }] },
            { ...isActiveQuery }
          ]
        });
      } else {
        discounts = await Discount.find({
          $or: [{ category: category }, { categories: category }]
        });
      }
    } else {
      // all
      if (isActive) {
        discounts = await Discount.find({ ...isActiveQuery });
      } else {
        discounts = await Discount.find({});
      }
    }
    return res.status(200).json(discounts);
  } catch (error) {
    return res
      .status(500)
      .send(`Error occurred while fetching discounts: ${error.message}`);
  }
}

// Creates new discount & updates related products
async function handlePostRequest(req, res) {
  // Check if the user is authorized
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  try {
    // Get the required fields & check if they exist
    checkDiscountForRequiredProps(req.body); // if not OK, will throw error
    if (!checkDiscountIsOK(req.body))
      throw new Error("Missing arguments for discount.");
    // Verify the token
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    // Find the user
    const user = await User.findOne({ _id: userId });
    // If the user exists
    if (user) {
      // Check if the user is authorized to create discount
      if (user.role === "admin" || user.role === "root") {
        const requiredProps = getRequiredPropsListForDiscount(req.body);
        // create discount object with the required fields
        const discountObj = requiredProps.reduce(
          (discount, prop) => ({ ...discount, [prop]: req.body[prop] }),
          {}
        );
        // Save the discount
        const discount = await Discount({ ...discountObj }).save();
        // Update products about discount
        if (discount.unitType === UNIT_TYPES.product) {
          if (discount.multipleUnits) {
            // update multiple products
            const products = discount.products.map(p => p._id);
            const resp = await Product.update(
              { _id: { $in: products } },
              { $addToSet: { discounts: discount } }
            );
            console.log(`Multiple products updated with response: ${resp}`);
            return res
              .status(200)
              .send(
                "Discount is created and products are updated successfully!"
              );
          } else {
            const resp = await Product.findOneAndUpdate(
              { _id: discount.product._id },
              { $addToSet: { discounts: discount } }
            );
            console.log(`A product updated with response: ${resp}`);
            return res
              .status(200)
              .send("Discount is created and product is updated successfully!");
          }
        } else {
          if (discount.multipleUnits) {
            // update multiple categories
            // Get all the products with related categories
            const products = await Product.find({
              category: { $in: discount.categories }
            }).distinct("_id");
            const resp = await Product.update(
              { _id: { $in: products } },
              { $addToSet: { discounts: discount } }
            );
            console.log(
              `Multiple products updated according to categories with response: ${resp}`
            );
            return res
              .status(200)
              .send(
                "Discount is created and products are updated successfully!"
              );
          } else {
            // Get all the products with related category
            const products = await Product.find({
              category: discount.category.trim()
            }).distinct("_id");
            const resp = await Product.update(
              { _id: { $in: products } },
              { $addToSet: { discounts: discount } }
            );
            console.log(
              `Multiple products updated according to a category with response: ${resp}`
            );
            return res
              .status(200)
              .send(
                "Discount is created and products are updated successfully!"
              );
          }
        }
      } else {
        return res
          .status(401)
          .send(`You don't have the permission to create a discount!`);
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
}

// Activates or Deactivates a discount
// And deals with the cascade update operation towards products in the cards
async function handlePutRequest(req, res) {
  // Check if the user is authorized
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  // Get the required fields & check if they exist
  const { isActive, discountId } = req.body;
  if (!discountId && isActive === undefined && typeof isActive !== "boolean") {
    return res
      .status(403)
      .send("Missing or bad argument: isActive, discountId");
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
      // Check if the user is authorized to update discount
      if (user.role === "admin" || user.role === "root") {
        // Find & update discount
        const discount = await Discount.findOne({ _id: discountId });
        if (isActive) {
          // Check the dates & decide if the operation is possible
          const now = new Date();
          if (now < discount.startDate) {
            return res
              .status(403)
              .send(
                "Discount could not be set as active before start date. Try again later."
              );
          } else if (now > discount.endDate) {
            return res
              .status(403)
              .send("Discount could not be set as active after it is expired.");
          }
        }
        await Discount.findOneAndUpdate({ _id: discountId }, { isActive });
        // Update products about discount - cascade update for products in the cards
        // Get all the product ids related to this discount
        const products = await Product.find({
          "discounts._id": discountId
        }).distinct("_id");
        // Get all the cards with these products
        if (isActive) {
          // Find the products which will be discounted more with these discount and apply the discount
          let findQuery;
          if (discount.discountType === DISCOUNT_TYPES.amountBased) {
            if (discount.multipleUnits) {
              if (discount.unitType === UNIT_TYPES.product) {
                findQuery = [{ products: { $all: discount.products } }];
              } else {
              }
            } else {
            }
          } else {
            // relation based
          }
          await Cart.update({
            $and: [
              { "products.product._id": { $in: products } },
              {
                "products.discountAmount": {
                  $lt: {
                    $multiply: [
                      "$products.product.price",
                      discount.discountPercentage / 100
                    ]
                  }
                }
              },
              ...findQuery
            ]
          });
        } else {
        }
      } else {
        return res
          .status(401)
          .send(`You don't have the permission to create a discount!`);
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
}
