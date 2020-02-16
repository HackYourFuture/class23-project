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
  isDiscountExpired
} from "../../utils/discount";
import mongoose from 'mongoose';

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
  console.log({ query: req.query });
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
      // get the product category
      const productCategory = await Product.findOne({ _id: productId }).distinct('category');
      // discounts for product
      if (isActive) {
        discounts = await Discount.find({
          $and: [
            {
              $or: [{ "product": productId }, { "products": productId }, { category: productCategory }, { categories: productCategory }]
            },
            { ...isActiveQuery }
          ]
        }).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
          model: Product
        });
      } else {
        discounts = await Discount.find({
          $or: [{ "product": productId }, { "products": productId }, { category: productCategory }, { categories: productCategory }]
        }).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
          model: Product
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
        }).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
          model: Product
        });
      } else {
        discounts = await Discount.find({
          $or: [{ category: category }, { categories: category }]
        }).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
          model: Product
        });
      }
    } else if (discountId) {
      console.log("single discount");
      // discount for discountId
      if (isActive) {
        discounts = await Discount.find({
          $and: [{ _id: discountId }, { ...isActiveQuery }]
        }).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
          model: Product
        });
      } else {
        discounts = await Discount.find({ _id: discountId }).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
          model: Product
        });
      }
    } else {
      // all
      if (isActive) {
        discounts = await Discount.find({ ...isActiveQuery });
      } else {
        discounts = await Discount.find({}).populate({
          path: "products",
          model: Product
        }).populate({
          path: "product",
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
            let alreadyCategoryWideDiscountedProducts = [];
            const populatedProducts = await Product.find({
              $and: [{ _id: { $in: products } }, { discount: { $ne: null } }]
            }).populate('discount');
            alreadyCategoryWideDiscountedProducts = populatedProducts.filter(pr => pr.discount.unitType === UNIT_TYPES.category).map(pr => pr.name);
            console.log({ products });
            console.log({ alreadyCategoryWideDiscountedProducts });
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
            ).distinct("discount");
            console.log({ discountIdsOfAlreadyDiscountedProductsByOtherDiscounts })
            if (
              discountIdsOfAlreadyDiscountedProductsByOtherDiscounts.length > 0
            ) {
              // Detach discounts from the products
              await Product.update(
                {
                  "discount": {
                    $in: discountIdsOfAlreadyDiscountedProductsByOtherDiscounts
                  }
                },
                { $unset: { discount: 1 } },
                { multi: true }
              );
              // Remove the discount from the carts
              discountIdsOfAlreadyDiscountedProductsByOtherDiscounts.forEach(async (discountId) => {
                await removeDiscountFromCarts(discountId);
              })
              // remove the overridden discounts
              await Discount.deleteMany(
                {
                  _id: {
                    $in: discountIdsOfAlreadyDiscountedProductsByOtherDiscounts
                  }
                }
              );
            }
            const resp = await Product.update(
              { _id: { $in: products } },
              { discount },
              { multi: true }
            );
            console.log(`Multiple products updated with response: ${resp}`);
            const overriddenProductsMessage =
              discountIdsOfAlreadyDiscountedProductsByOtherDiscounts.length > 0
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
          } else {
            const product = await Product.findOne({
              _id: discountObj.product._id
            }).populate({
              path: "discount",
              model: "Discount"
            }).populate({
              path: "discount.products",
              model: "Product"
            }).populate({
              path: "discount.product",
              model: "Product"
            });
            console.log('single unit product: ', product)
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
                    { "discount": product.discount._id },
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
                    "discount": {
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
            // Remove the discount from the carts
            await removeDiscountFromCarts(product.discount._id);
            // remove the overridden discounts
            await Discount.deleteOne({ _id: product.discount._id });
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
          const categoryFilter = discountObj.multipleUnits
            ? { $in: discountObj.categories }
            : discountObj.category.trim();
          const products = await Product.find({
            category: categoryFilter
          }).distinct("_id");
          // Save the discount
          const discount = await Discount({ ...discountObj }).save();
          // Get the discount Ids Of already Discounted Products By Other Discounts
          const discountIdsOfAlreadyDiscountedProductsByOtherDiscounts = await Product.find(
            {
              $and: [{ discount: { $ne: null } }, { _id: { $in: products } }]
            }
          ).distinct("discount");
          console.log({ discountIdsOfAlreadyDiscountedProductsByOtherDiscounts });

          // Detach discounts from the products
          await Product.update(
            {
              "discount": {
                $in: discountIdsOfAlreadyDiscountedProductsByOtherDiscounts
              }
            },
            { $unset: { discount: 1 } },
            { multi: true }
          );
          // Remove the discounts from the carts
          discountIdsOfAlreadyDiscountedProductsByOtherDiscounts.forEach(async (discountId) => {
            await removeDiscountFromCarts(discountId);
          });
          // remove the overridden discounts
          await Discount.deleteMany(
            {
              _id: {
                $in: discountIdsOfAlreadyDiscountedProductsByOtherDiscounts
              }
            }
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
            discountIdsOfAlreadyDiscountedProductsByOtherDiscounts.length > 0
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
  console.log({ body: req.body });

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
          if (isDiscountExpired(discount)) {
            return res
              .status(403)
              .send("Discount could not be set as active after it is expired.");
          }
        }
        await Discount.findOneAndUpdate({ _id: discountId }, { isActive });
        // Update products about discount - cascade update for products in the cards for deactivate
        if (!isActive) {
          // Find the cart with products which is discounted with this discount
          deactivateDiscountFromCarts(discountId);
          return res
            .status(200)
            .send("Discount deactivated successfully with updating cards!");
        } else {
          // Find the cart with products which is discounted with this discount
          activateDiscountForCarts(discountId);
          return res
            .status(200)
            .send("Discount activated successfully with updating cards!");
        }
      } else {
        return res
          .status(401)
          .send(`You don't have the permission to update a discount!`);
      }
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(403).send(error.message);
  }
}

// Removes a discount completely & cascade deletes
async function handleDeleteRequest(req, res) {
  // Check if the user is authorized
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  // Get the required field & check if it exists
  const { discountId } = req.query;
  if (!discountId) {
    return res.status(403).send("Missing or bad argument: discountId");
  }

  try {
    // Verify the token
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    // Find the user
    const user = await User.findOne({ _id: userId });
    if (user) {
      // Check if the user is authorized to delete discount
      if (user.role === "admin" || user.role === "root") {
        // OK, ready to remove
        // Remove discount from the cards
        await removeDiscountFromCarts(discountId);
        // Remove discount from products
        await Product.updateMany(
          { "discount": discountId },
          { $unset: { discount: 1 } },
          { multi: true }
        );
        // Finally, remove the discount
        await Discount.findOneAndRemove({ _id: discountId });
        return res
          .status(200)
          .send(
            "Discount removed successfully with updating cards and products."
          );
      } else {
        return res
          .status(401)
          .send(`You don't have the permission to delete a discount!`);
      }
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    return res.status(403).send(error.message);
  }
}

async function activateDiscountForCarts(discountId) {
  await activateDeactivateRemoveDiscountFromCarts(discountId, true);
}

async function deactivateDiscountFromCarts(discountId) {
  await activateDeactivateRemoveDiscountFromCarts(discountId, false);
}

async function removeDiscountFromCarts(discountId) {
  await activateDeactivateRemoveDiscountFromCarts(discountId, false, true);
}

async function activateDeactivateRemoveDiscountFromCarts(discountId, activate, remove = false) {
  const carts = await Cart.find({ 'products.discount': discountId })
    .populate({
      path: "products.product",
      model: "Product"
    }).populate({
      path: "products.discount",
      model: "Discount"
    }).populate({
      path: "products.discount.products",
      model: "Product"
    }).populate({
      path: "products.discount.product",
      model: "Product"
    });

  carts.forEach(cart => {
    cart.products.forEach(doc => {
      if (doc.discount && mongoose.Types.ObjectId(doc.discount._id).equals(discountId)) {
        doc.discountApplied = activate;
        if (!activate || remove) doc.discountAmount = 0;
        else if (activate) {
          if (doc.discount.multipleUnits) {
            doc.discountAmount = (doc.discount.discountPercentage * doc.product.price) / 100;
          } else {
            doc.discountAmount = ((doc.discount.discountPercentage * doc.product.price) / 100) * doc.discount.amountRequired;
          }
        }
        if (remove) doc.discount = null;
      }
    })
  });
  carts.forEach(async (cart) => {
    await cart.save();
  })
}