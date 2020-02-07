import Token from '../../models/Token';
import User from '../../models/User';
import connectDb from '../../utils/connectDb';
import jwt from 'jsonwebtoken';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

connectDb();

export default async function (req, res) {
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
    default:
      return res.status(405).send(`Method ${req.method} not allowed`);
  }
}

async function handleGetRequest(req, res) {
  const { token } = req.query;
  // Has token as parameters?
  if (!token) {
    return res.status(401).send("No authorization token for password reset operation!");
  }
  try {
    const existingToken = await Token.findOne({ token });
    // Is token used before?
    if (!existingToken) {
      return res.status(401).send("This token might have been used before!");
    }
    const { userId, email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: userId, email });
    // Is token related to an existing user?
    if (!user) {
      return res.status(404).send("User not found with provided token!");
    }
    return res.status(200).send(email);
  } catch (error) {
    return res.status(501).send(error.message);
  }
}

async function handlePostRequest(req, res) {
  const { confirmEmail } = req.body;
  // Check if email is valid
  if (!confirmEmail && !isEmail(confirmEmail)) {
    return res.status(401).send(`'${confirmEmail}' is not a valid email address!`);
  }
  try {
    // Check if there is a user with that email
    const user = await User.findOne({ email: confirmEmail });
    if (!user) {
      return res.status(404).send("User not found with that email address!");
    }
    // Create a temporary token for reset password operation
    const temporaryToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: 43200,
    });
    // save the token for future check
    await new Token({ user: user._id, token: temporaryToken }).save();

    const transporter = nodemailer.createTransport({
      service: 'Sendgrid',
      auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD },
    });

    const mailOptions = {
      from: 'no-reply@hackyourshop.com',
      to: confirmEmail,
      subject: 'Password Reset',
      text: `Hello,\n\n Please reset your password by clicking the link: \nhttp://${req.headers.host}/reset-password/${temporaryToken}`,
    };

    transporter.sendMail(mailOptions, err => {
      if (err) {
        return res.status(501).send(err.message);
      }
      res.status(200).send(`Password reset mail sent. Please check ${user.email}`);
    })
  } catch (error) {
    return res.status(501).send(error.message);
  }
}

async function handlePutRequest(req, res) {
  const { requested, token } = req.body;
  if (!requested || !isLength(requested, { min: 6 })) {
    return res.status(401).send('Password is required and it must be longer than or equal to 6 characters.');
  }
  if (!token) {
    return res.status(401).send("No authorization token for password reset operation!");
  }
  try {
    const existingToken = await Token.findOne({ token });
    // Is token used before?
    if (!existingToken) {
      return res.status(401).send("This token might have been used before!");
    }
    const { userId, email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: userId, email });
    if (!user) {
      return res.status(404).send("User not found with that email address!");
    }
    // Remove token from DB to prevent multiple usages.
    await Token.deleteOne({ token });
    const hash = await bcrypt.hash(requested, 10);
    await User.findOneAndUpdate({ _id: userId }, { password: hash });
    return res.status(200).send('User password is updated successfully!');
  } catch (error) {
    return res.status(501).send(error.message);
  }
}

