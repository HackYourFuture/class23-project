import Product from '../../models/Product';
import Discount from '../../models/Discount';
import User from '../../models/User';
import connectDb from '../../utils/connectDb';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {
  checkDiscountForRequiredProps,
  checkDiscountIsOK,
  getRequiredPropsListForDiscount,
  UNIT_TYPES
} from '../../utils/discount';

connectDb();

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      await handleGetRequest(req, res);
      break;
    case 'POST':
      await handlePostRequest(req, res);
      break;
    case 'PUT':
      await handlePutRequest(req, res);
      break;
    case 'DELETE':
      await handleDeleteRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
      break;
  }
};

// Finds & returns all discounts by product, by category or with-no-condition (all of them)
async function handleGetRequest(req, res) {
  const { productId, category } = req.query;
  try {
    if (productId) { // discounts for product
      const discounts = await Discount.find({ $or: [{ 'product._id': productId }, { 'products._id': productId }] });
      return res.status(200).json(discounts);
    } else if (category) { // discounts for category
      const discounts = await Discount.find({ $or: [{ category: category }, { categories: category }] });
      return res.status(200).json(discounts);
    } else { // all
      const discounts = await Discount.find({});
      return res.status(200).json(discounts);
    }
  } catch (error) {
    return res.status(500).send(`Error occurred while fetching discounts: ${error.message}`);
  }
}

// Creates new discount & updates related products
async function handlePostRequest(req, res) {
  // Check if the user is authorized
  if (!('authorization' in req.headers)) {
    return res.status(401).send('No authorization token');
  }
  try {
    // Get the required fields & check if they exist
    checkDiscountForRequiredProps(req.body); // if not OK, will throw error
    // Verify the token
    const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    // Find the user
    const user = await User.findOne({ _id: userId });
    // If the user exists
    if (user) {
      // Check if the user is authorized to create discount
      if (user.role === 'admin' || user.role === 'root') {
        const requiredProps = getRequiredPropsListForDiscount(req.body);
        // create discount object with the required fields
        const discountObj = requiredProps.reduce((discount, prop) => ({ ...discount, [prop]: req.body[prop] }), {});
        // Save the discount
        const discount = await Discount({ ...discountObj }).save();
        // Update products about discount
        if (discount.unitType === UNIT_TYPES.product) {
          if (discount.multipleUnits) { // update multiple products
            const products = discount.products.map(p => p._id);
            const resp = await Product.update(
              { _id: { $in: products } },
              { $addToSet: { discounts: discount } }
            );
            console.log(`Multiple products updated with response: ${resp}`);
            return res.status(200).send('Discount is created and products are updated successfully!');
          } else {
            const resp = await Product.findOneAndUpdate(
              { _id: discount.product._id },
              { $addToSet: { discounts: discount } }
            );
            console.log(`A product updated with response: ${resp}`);
            return res.status(200).send('Discount is created and product is updated successfully!');
          }
        } else {
          if (discount.multipleUnits) { // update multiple categories
            // Get all the products with related categories
            const products = await Product.find({ category: { $in: discount.categories } }).distinct('_id');
            const resp = await Product.update(
              { _id: { $in: products } },
              { $addToSet: { discounts: discount } }
            );
            console.log(`Multiple products updated according to categories with response: ${resp}`);
            return res.status(200).send('Discount is created and products are updated successfully!');
          } else {
            // Get all the products with related category
            const products = await Product.find({ category: discount.category.trim() }).distinct('_id');
            const resp = await Product.update(
              { _id: { $in: products } },
              { $addToSet: { discounts: discount } }
            );
            console.log(`Multiple products updated according to a category with response: ${resp}`);
            return res.status(200).send('Discount is created and products are updated successfully!');
          }
        }
      } else {
        return res.status(401).send(`You don't have the permission to create a discount!`);
      }
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
}