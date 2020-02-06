import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../models/User';
import Cart from '../../models/Cart';
import Token from '../../models/Token';
import connectDb from '../../utils/connectDb';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';

connectDb();

export default async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!isLength(name, { min: 3, max: 10 })) {
      return res.status(422).send('Name must be 3-10 characters long');
    } else if (!isLength(password, { min: 6 })) {
      return res.status(422).send('Password must be at least 6 characters');
    } else if (!isEmail(email)) {
      return res.status(422).send('Email must be valid');
    }
    const user = await User.findOne({ email });

    if (user) {
      return res.status(422).send(`User already exists with email ${email}`);
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await new User({
      name: name,
      email: email,
      password: hash,
    }).save();

    await new Cart({ user: newUser._id }).save();

    const temporaryToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: 43200,
    });
    await new Token({ user: newUser._id, token: temporaryToken }).save();

    const transporter = nodemailer.createTransport({
      service: 'Sendgrid',
      auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD },
    });

    const mailOptions = {
      from: 'no-reply@hackyourshop.com',
      to: newUser.email,
      subject: 'Account activation',
      text: `Hello,\n\n Please activate your account by clicking the link: \nhttp://${req.headers.host}/confirmation/${temporaryToken}`,
    };

    transporter.sendMail(mailOptions, err => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res
        .status(200)
        .send('Account registered. Please check ' + newUser.email + ' for activation email.');
    });
  } catch (error) {
    res.status(500).send('Error signing up user. Please try again later.');
  }
};
