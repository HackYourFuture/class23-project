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
  UNIT_TYPES
} from "../../utils/discount";
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

// Finds & returns all discounts by product, by category, by discountId or with-no-condition (all of them)
// And also if active parameter is provided as true, returns just the active ones
async function handleGetRequest(req, res) {
  const { productId, category, isActive, discountId } = req.query;
  let discounts;
  const isActiveQuery = {
    $and: [
      { isActive },
      { startDate: { $lte: new Date() } },
      { endDate: { $gte: new Date() } }
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
    } else if (discountId) {
      // discount for discountId
      if (isActive) {
        discounts = await Discount.find({
          $and: [
            { _id: discountId },
            { ...isActiveQuery }
          ]
        });
      } else {
        discounts = await Discount.find({ _id: discountId });
      }
    } else {
      // all
      if (isActive) {
        discounts = await Discount.find({ ...isActiveQuery });
      } else {
        discounts = await Discount.find({}).populate({
          path: "products",
          model: Product
        });
      }
    }
    return res.status(200).json({ discounts });
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
        // Save & Update products about discount
        if (discountObj.unitType === UNIT_TYPES.product) {
          if (discountObj.multipleUnits) {
            // Get ids from the products that the discount will effect
            const products = discountObj.products.map(p => p._id);
            // Get the products' names that have category wide discount
            const alreadyCategoryWideDiscountedProducts = await Product.find({
              $and: [
                { discount: { $ne: null } },
                { "discount.unitType": UNIT_TYPES.category },
                { _id: { $in: products } }
              ]
            }).distinct("name");
            if (alreadyCategoryWideDiscountedProducts.length > 0) {
              return res
                .status(405)
                .send(
                  "Discount could not be created! " +
                  "Because there are products that have category wide discount related to them. " +
                  "To set a new discount for these products, please delete the discount related to them. " +
                  "These products are: " +
                  alreadyCategoryWideDiscountedProducts.join(",")
                );
            }
            // Save the discount
            const discount = await Discount({ ...discountObj }).save();
            // Get the discount Ids Of already Discounted Products By Other Discounts
            const discountIdsOfAlreadyDiscountedProductsByOtherDiscounts = await Product.find(
              {
                $and: [{ discount: { $ne: null } }, { _id: { $in: products } }]
              }
            ).distinct("discount._id");
            if (
              discountIdsOfAlreadyDiscountedProductsByOtherDiscounts.length > 0
            ) {
              // Detach discounts from the products
              await Product.update(
                {
                  "discount._id": {
                    $in: discountIdsOfAlreadyDiscountedProductsByOtherDiscounts
                  }
                },
                { $unset: { discount: 1 } },
                { multi: true }
              );
            }
            const resp = await Product.update(
              { _id: { $in: products } },
              { discount },
              { multi: true }
            );
            console.log(`Multiple products updated with response: ${resp}`);
            const overriddenProductsMessage =
              alreadyDiscountedProducts.length > 0
                ? " Not: Some products had different discounts related to them. " +
                "New discount override the older ones! " +
                "These are: " +
                alreadyDiscountedProducts.join(",")
                : "";
            return res
              .status(200)
              .send(
                "Discount is created and products are updated successfully!" +
                overriddenProductsMessage
              );
          } else {
            const product = await Product.findOne({
              _id: discountObj.product._id
            });
            if (
              product.discount &&
              product.discount.unitType === UNIT_TYPES.category
            ) {
              return res
                .status(405)
                .send(
                  "Discount could not be created! " +
                  "Because the product of this category has a category wide discount related to it. " +
                  "To set a new discount for this product, please delete the discount related to it."
                );
            }
            // Save the discount
            const discount = await Discount({ ...discountObj }).save();
            let overriddenProductsMessage = "";
            if (product.discount) {
              // Get already Discounted Products By The Older Discount
              const alreadyDiscountedProductsByTheOlderDiscount = await Product.find(
                {
                  $and: [
                    { discount: { $ne: null } },
                    { "discount._id": product.discount._id },
                    { _id: { $ne: discountObj.product._id } }
                  ]
                }
              );
              if (alreadyDiscountedProductsByTheOlderDiscount.length > 0) {
                overriddenProductsMessage =
                  " Not: Some products were sharing a discount with this product. " +
                  "New discount override the older ones! And some of them do not have discount now! " +
                  "Products may be affected are: " +
                  alreadyDiscountedProductsByTheOlderDiscount
                    .map(p => p.name)
                    .join(",");
                // Detach discount from the products
                await Product.update(
                  {
                    "discount._id": {
                      $in: alreadyDiscountedProductsByTheOlderDiscount.map(
                        p => p._id
                      )
                    }
                  },
                  { $unset: { discount: 1 } },
                  { multi: true }
                );
              }
            }
            const resp = await Product.findOneAndUpdate(
              { _id: discountObj.product._id },
              { discount }
            );
            console.log(`A product updated with response: ${resp}`);
            return res
              .status(200)
              .send(
                "Discount is created and product is updated successfully!" +
                overriddenProductsMessage
              );
          }
        } else {
          // unitType === 'category'
          // update multiple categories
          // Get all the products with related categories
          const products = await Product.find({
            category: discountObj.multipleUnits
              ? { $in: discountObj.categories }
              : discountObj.category.trim()
          }).distinct("_id");
          // Save the discount
          const discount = await Discount({ ...discountObj }).save();
          // Get the discount Ids Of already Discounted Products By Other Discounts
          const discountIdsOfAlreadyDiscountedProductsByOtherDiscounts = await Product.find(
            {
              $and: [{ discount: { $ne: null } }, { _id: { $in: products } }]
            }
          ).distinct("discount._id");
          // Detach discounts from the products
          await Product.update(
            {
              "discount._id": {
                $in: discountIdsOfAlreadyDiscountedProductsByOtherDiscounts
              }
            },
            { $unset: { discount: 1 } },
            { multi: true }
          );
          const resp = await Product.update(
            { _id: { $in: products } },
            { discount },
            { multi: true }
          );
          console.log(
            `Multiple products updated according to categories with response: ${resp}`
          );
          const overriddenProductsMessage =
            alreadyDiscountedProducts.length > 0
              ? " Not: Some products had different discounts related to them. " +
              "New discount override the older ones! " +
              "Number of affected products: " +
              products.length
              : "";
          return res
            .status(200)
            .send(
              "Discount is created and products are updated successfully!" +
              overriddenProductsMessage
            );
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
// And deals with the cascade update operation towards products in the cards when it is deactivated
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
          if (now > discount.endDate) {
            return res
              .status(403)
              .send("Discount could not be set as active after it is expired.");
          }
        }
        await Discount.findOneAndUpdate({ _id: discountId }, { isActive });
        // Update products about discount - cascade update for products in the cards for deactivate
        if (!isActive) {
          // Find the cart with products which is discounted with this discount
          await Cart.update(
            { "products.discount._id": discount._id },
            {
              $set:
              {
                "products.$[element].discountApplied": false,
                "products.$[element].discountAmount": 0
              }
            },
            {
              multi: true,
              arrayFilters: [{ "element.discount._id": discount._id }]
            }
          );
        } else {
          // Find the cart with products which is discounted with this discount
          const anItemDiscountAmount = { $divide: [{ $multiply: ['products.$[element].discount.discountPercentage', 'products.$[element].product.price'] }, 100] };
          await Cart.update(
            { "products.discount._id": discount._id },
            {
              $set:
              {
                "products.$[element].discountApplied": true,
                "products.$[element].discountAmount": {
                  $cond:
                    [
                      { 'products.$[element].discount.multipleUnits': true }, // if
                      { ...anItemDiscountAmount }, // true
                      { $multiply: [{ ...anItemDiscountAmount }, { 'products.$[element].discount.amountRequired'}] } // false
                    ]
                }
              }
            },
            {
              multi: true,
              arrayFilters: [{ "element.discount._id": discount._id }]
            }
          );
        }
        return res
          .status(200)
          .send("Discount deactivated successfully with updating cards!");
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
