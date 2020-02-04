import connectDb from '../../utils/connectDb';
import User from '../../models/User';
import TokenSchema from '../../models/TokenSchema';
import Cart from '../../models/Cart';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import nodemailer from 'nodemailer';

connectDb();

export default async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1) Validate name / email / password
    if (!isLength(name, { min: 3, max: 10 })) {
      return res.status(422).send('Name must be 3-10 characters long');
    } else if (!isLength(password, { min: 6 })) {
      return res.status(422).send('Password must be at least 6 characters');
    } else if (!isEmail(email)) {
      return res.status(422).send('Email must be valid');
    }
    // 2) Check to see if the user already exists in the db
    const user = await User.findOne({ email });
    if (user) {
      return res.status(422).send(`User already exists with email ${email}`);
    }

    // 3) --if not, hash their password
    const hash = await bcrypt.hash(password, 10);

    // 4) create user
    const newUser = await new User({
      name,
      email,
      password: hash,
    }).save();

    // 5) create cart for new user
    await new Cart({ user: newUser._id }).save();

    // 6) create token for the new user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // 7) create and save a Token in the DB for the new user:
    await new TokenSchema({ user: newUser._id, token: token }).save();

    let transporter = nodemailer.createTransport({
      service: 'Sendgrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });

    let mailOptions = {
      from: 'no-reply@yourwebapplication.com',
      to: newUser.email,
      subject: 'Account Verification Token',
      text:
        'Hello,\n\n' +
        'Please verify your account by clicking the link: \nhttp://' +
        req.headers.host +
        '/confirmation/' +
        token +
        '.\n',
    };
    transporter.sendMail(mailOptions, function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(200).send('A verification email has been sent to ' + newUser.email + '.');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error signing up user. Please try again later');
  }
};
