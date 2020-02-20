import Code from "../../models/Code";
import User from '../../models/User';
import connectDb from "../../utils/connectDb";
import jwt from 'jsonwebtoken';
import Cart from "../../models/Cart";

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
      return res.status(405).send(`Method ${req.method} not allowed`);
  }
}

// Get all codes
async function handleGetRequest(req, res) {
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const user = await User.findOne({ _id: userId });
    if (user) {
      if (user.role === 'root') {
        const coupons = await Code.find({});
        return res.status(200).json({ coupons });
      } else {
        return res.status(403).send("You are not allowed to fetch coupon codes.");
      }
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(403).send("Please login again");
  }
}

// Create a coupon code
async function handlePostRequest(req, res) {
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token.");
  }
  const { code, amount } = req.body;
  console.log({ code, amount });
  if (!code || !amount) {
    return res.status(401).send("Missing arguments: code, amount (amount must be > 0)");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const user = await User.findOne({ _id: userId });
    if (user) {
      if (user.role !== 'root') {
        return res.status(403).send("You are not allowed to create coupon codes.");
      }
      const coupon = await Code.findOne({ code });
      if (!coupon) {
        const newCoupon = await new Code({ code, amount, isUsed: false }).save();
        return res.status(200).json(newCoupon);
      } else {
        return res.status(403).send("This code is already related to a different coupon code.");
      }
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).send("Please login again");
  }
};

// Apply a coupon code
async function handlePutRequest(req, res) {
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token.");
  }
  const { code } = req.body;
  if (!code) {
    return res.status(401).send("No coupon code provided.");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const coupon = await Code.findOne({ code });
    if (coupon) {
      if (coupon.isUsed) {
        return res.status(403).send("This coupon is used before. Try another one.");
      }
      const cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'code',
          model: 'Code'
        });
      if (cart) {
        if (!cart.code) {
          cart.code = coupon;
          await cart.save();
          coupon.isUsed = true;
          await coupon.save();
          return res.status(200).json(coupon);
        } else {
          return res.status(403).send("You have used another coupon code! Please remove it first.");
        }
      } else {
        return res.status(404).send("User account has not got any cart item!");
      }
    } else {
      return res.status(404).send("Invalid coupon code");
    }
  } catch (error) {
    console.error(error);
    res.status(404).send("Please login again");
  }
};

// Remove a coupon code from a cart
async function handleDeleteRequest(req, res) {
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token.");
  }
  const { code } = req.query;
  if (!code) {
    return res.status(401).send("No coupon code provided.");
  }
  try {
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const coupon = await Code.findOne({ code });
    if (!coupon) {
      return res.status(404).send("Coupon code not found");
    }
    const cart = await Cart.findOne({ user: userId, code: coupon._id })
      .populate({
        path: 'code',
        model: 'Code'
      });
    if (cart && cart.code) {
      cart.code = null;
      await cart.save();
      coupon.isUsed = false;
      await coupon.save();
      return res.status(200).send('Coupon code successfully removed from your cart.');
    } else {
      return res.status(404).send("Invalid coupon code or userId");
    }
  } catch (error) {
    console.error(error);
    res.status(404).send("Please login again");
  }
};
