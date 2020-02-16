import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Cart from "../../models/Cart";
import connectDb from "../../utils/connectDb";
import Discount from "../../models/Discount";
import Product from "../../models/Product";
import { isDiscountExpired, isDiscountStarted, UNIT_TYPES } from '../../utils/discount';
import { Card } from "semantic-ui-react";

connectDb();

const { ObjectId } = mongoose.Types;

export default async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleGetRequest(req, res);
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
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      model: "Product"
    });
    res.status(200).json(cart.products);
  } catch (error) {
    console.error(error);
    res.status(403).send("Please login again");
  }
}

async function handlePutRequest(req, res) {
  const { quantity, productId } = req.body;
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    // Get user cart based on userId
    const cart = await Cart.findOne({ user: userId });
    const productExists = cart.products.some(doc =>
      ObjectId(productId).equals(doc.product)
    );

    const discountInfo = await isProductsDiscountApplicableForCart(cart, productId, productExists);

    // If product exists, increment quantity (by number provided to request)
    if (productExists) {
      // save the product
      await Cart.findOneAndUpdate(
        { _id: cart._id, "products.product": productId },
        { $inc: { "products.$.quantity": quantity } }
      );
    } else {
      // If not, add new product with given quantity
      const newProduct = { quantity, product: productId };
      await Cart.findOneAndUpdate(
        { _id: cart._id },
        { $addToSet: { products: newProduct } }
      );
    }

    const discount = discountInfo.product.discount;
    if (discountInfo.isSuitable) {
      await addDiscountToCartInDeactivatedMode(discount, cart);
    }
    if (discountInfo.isApplicable) {
      await activateDiscountForCart(discount);
    }
    res.status(200).send("Cart updated");
  } catch (error) {
    console.error(error);
    res.status(403).send("Please login again");
  }
}

async function handleDeleteRequest(req, res) {
  const { productId } = req.query;
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    // get the cart
    const oldCart = await Cart.findOne({ user: userId }).populate({
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

    // get the product element from cart
    const cartProduct = oldCart.products.find(doc => ObjectId(productId).equals(doc.product));
    let cart = {};
    // check if a discount set to the product
    if (cartProduct.discount) {
      // Remove the discount from the cart
      await Cart.update(
        { user: userId },
        { $unset: { 'products.$[element].discount': 1 } },
        {
          multi: true,
          arrayFilters: [{ 'element.discount': cartProduct.discount._id }]
        }
      );
      // remove the product from the cart
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { products: { product: productId } } },
        { new: true }
      ).populate({
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

      // Check the applicability of the discount for the cart
      const discountInfo = isDiscountApplicableForCartWithRemovedProduct(cart, cartProduct.discount);
      if (discountInfo.isSuitable) {
        cart = await addDiscountToCartInDeactivatedMode(discount, cart);
      }
      if (discountInfo.isApplicable) {
        cart = await activateDiscountForCart(discount);
      }
    } else {
      // remove the product from the cart
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { products: { product: productId } } },
        { new: true }
      ).populate({
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
    }

    res.status(200).json(cart.products);
  } catch (error) {
    console.error(error);
    res.status(403).send("Please login again");
  }
}


async function isProductsDiscountApplicableForCart(cart, productId, productExists) {
  // Check for discount availability
  let isDiscountOnline = false,
    isCartProvidesRequirementsForDiscount = true,
    isDiscountAppliedBefore = false;
  //Get the product 
  const product = await Product.findOne({ _id: productId })
    .populate({ path: 'discount', model: Discount })
    .populate({ path: 'discount.product', model: Product })
    .populate({ path: 'discount.products', model: Product });
  // Get the discount
  const discount = product.discount;
  if (!discount) {
    return { product, isApplicable: false, isSuitable: false };
  }
  // Check if the discount is not expired
  isDiscountOnline = !isDiscountExpired(discount) && isDiscountStarted(discount);
  if (!isDiscountOnline) {
    return { product, isApplicable: false, isSuitable: false };
  }
  // Check if the discount is applied before
  isDiscountAppliedBefore = cart.products.some(doc => ObjectId(doc.discount).equals(discount));
  if (isDiscountAppliedBefore) {
    return { product, isApplicable: false, isSuitable: false };
  }
  const cartProduct = productExists ? cart.products.find(doc => ObjectId(productId).equals(doc.product)) : null;
  // Check if the card has everything for discount
  if (discount.unitType === UNIT_TYPES.product) { // product
    if (discount.multipleUnits) { // check for the products
      discount.products.forEach(prod => {
        if (!cart.products.some(doc => ObjectId(prod._id).equals(doc.product))) {
          isCartProvidesRequirementsForDiscount = false;
        }
      });
    } else { // check for the product amount
      if (!((productExists && (cartProduct.quantity + 1) >= discount.amountRequired) || discount.amountRequired === 1)) {
        isCartProvidesRequirementsForDiscount = false;
      }
    }
  } else { // category
    if (discount.multipleUnits) { // check for the categories
      discount.categories.forEach(cat => {
        if (!cart.products.some(doc => doc.product.category === cat)) {
          isCartProvidesRequirementsForDiscount = false;
        }
      });
    } else { // check for the category's products amount
      let total = cart.products.reduce((total, doc) => {
        if (doc.product.category === discount.category) return total + 1;
        else return total;
      }, 0);
      if (total < discount.amountRequired) {
        isCartProvidesRequirementsForDiscount = false;
      }
    }
  }
  if (!isCartProvidesRequirementsForDiscount) {
    return { product, isApplicable: false, isSuitable: false };
  }
  return { product, isApplicable: discount.isActive, isSuitable: true };
}

async function isDiscountApplicableForCartWithRemovedProduct(cart, discount) {
  // Check for discount availability
  let isDiscountOnline = false,
    isCartProvidesRequirementsForDiscount = true,
    isDiscountAppliedBefore = false;
  // Check if the discount is not expired
  isDiscountOnline = !isDiscountExpired(discount) && isDiscountStarted(discount);
  if (!isDiscountOnline) {
    return { isApplicable: false, isSuitable: false };
  }
  // Check if the card has everything for discount
  if (discount.unitType === UNIT_TYPES.product) { // product
    if (discount.multipleUnits) { // check for the products
      discount.products.forEach(prod => {
        if (!cart.products.some(doc => ObjectId(prod._id).equals(doc.product))) {
          isCartProvidesRequirementsForDiscount = false;
        }
      });
    } else { // check for the product amount
      isCartProvidesRequirementsForDiscount = false;
    }
  } else { // category
    if (discount.multipleUnits) { // check for the categories
      discount.categories.forEach(cat => {
        if (!cart.products.some(doc => doc.product.category === cat)) {
          isCartProvidesRequirementsForDiscount = false;
        }
      });
    } else { // check for the category's products amount
      let total = cart.products.reduce((total, doc) => {
        if (doc.product.category === discount.category) return total + 1;
        else return total;
      }, 0);
      if (total < discount.amountRequired) {
        isCartProvidesRequirementsForDiscount = false;
      }
    }
  }
  if (!isCartProvidesRequirementsForDiscount) {
    return { isApplicable: false, isSuitable: false };
  }
  return { isApplicable: discount.isActive, isSuitable: true };
}

async function addDiscountToCartInDeactivatedMode(discount, cart) {
  let findQuery = {};
  if (discount.unitType === UNIT_TYPES.product) {
    if (discount.multipleUnits) { // products
      findQuery = { 'products.product': { $in: discount.products.map(p => p._id) } };
    } else { // product
      findQuery = { 'products.product': discount.product._id };
    }
  } else { // unit category
    if (discount.multipleUnits) { // categories
      findQuery = { 'products.product.category': { $in: discount.categories } };
    } else { // category
      findQuery = { 'products.product.category': discount.category };
    }
  }
  return await Cart.update(
    { _id: cart._id, ...findQuery },
    { $set: { 'products.$.discount': discount } },
    { multi: true }
  ).populate({
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
}

async function activateDiscountForCart(discount) {
  // Find the cart with products which is discounted with this discount
  const anItemDiscountAmount = {
    $divide: [
      {
        $multiply: [
          "products.$[element].discount.discountPercentage",
          "products.$[element].product.price"
        ]
      },
      100
    ]
  };
  return await Cart.update(
    { "products.discount._id": discount._id },
    {
      $set: {
        "products.$[element].discountApplied": true,
        "products.$[element].discountAmount": {
          $cond: [
            { "products.$[element].discount.multipleUnits": true }, // if
            { ...anItemDiscountAmount }, // true
            {
              $multiply: [
                { ...anItemDiscountAmount },
                "products.$[element].discount.amountRequired"
              ]
            } // false
          ]
        }
      }
    },
    {
      multi: true,
      arrayFilters: [{ "element.discount._id": discount._id }]
    }
  ).populate({
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
}