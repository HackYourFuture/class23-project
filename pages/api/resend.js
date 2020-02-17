import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../models/User';
import Token from '../../models/Token';
import connectDb from '../../utils/connectDb';
import isEmail from 'validator/lib/isEmail';

connectDb();

export default async (req, res) => {
  const { email } = req.body;
  try {
    if (!isEmail(email)) {
      return res.status(422).send('Email must be valid');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).send(`User does not exist with email ${email}. Please sign up.`);
    }

    if (user.isVerified) {
      return res.status(404).send('Account has already been verified.');
    }

    const temporaryToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: 43200,
    });
    await new Token({ user: user._id, token: temporaryToken }).save();

    const transporter = nodemailer.createTransport({
      service: 'Sendgrid',
      auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD },
    });

    const mailOptions = {
      from: 'no-reply@hackyourshop.com',
      to: email,
      subject: 'Account activation',
      html: `Hello <strong>${user.name}</strong>,
      <br> Please activate your account by clicking the link below:
      <br> <a href='http://${req.headers.host}/confirmation/${temporaryToken}'><h2>hackyourshop.com</h2></a>
      <br>Enjoy Shopping :)`,
    };

    transporter.sendMail(mailOptions, err => {
      if (err) {
        return res.status(500).send(err.message);
      }

      res.status(200).send(`Activation mail sent. Please check ${user.email}`);
    });
  } catch (error) {
    res.status(500).send('Error resending activation link');
  }
};
