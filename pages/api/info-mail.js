// import Token from '../../models/Token';
import User from '../../models/User';
import connectDb from '../../utils/connectDb';
import isEmail from 'validator/lib/isEmail';
import nodemailer from 'nodemailer';

connectDb();

export default async function(req, res) {
  switch (req.method) {
    case 'PUT':
      await handlePostRequest(req, res);
      break;
    default:
      return res.status(405).send(`Method ${req.method} not allowed`);
  }
}

async function handlePostRequest(req, res) {
  const { lastOrder, email } = req.body;

  // Check if email is valid
  if (!email && !isEmail(email)) {
    return res.status(401).send(`'${email}' is not a valid email address!`);
  }
  try {
    // Check if there is a user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found with that email address!');
    }

    const transporter = nodemailer.createTransport({
      service: 'Sendgrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });

    var generalTotal = lastOrder.products
      .reduce((a, b) => {
        let totalPrice = b.quantity * b.product.price;
        return a + totalPrice;
      }, 0)
      .toFixed(2);

    var content = lastOrder.products.reduce((a, b) => {
      let totalPrice = (b.quantity * b.product.price).toFixed(2);
      return (
        a +
        '<tr><td>' +
        `<img style="width: 150px;" 
        src='${b.product.mediaUrl}' alt='product image'/>` +
        '</td><td style="padding: 0 30px;">' +
        b.product.name +
        '</td><td style="padding: 0 30px;">' +
        b.quantity +
        ' X</td><td style="padding: 0 30px;">$ ' +
        b.product.price +
        '</td><td style="padding: 0 30px;">$ ' +
        totalPrice +
        '</td></tr style="padding: 0 30px;">'
      );
    }, '');

    var mailOptions = {
      from: 'no-reply@hackyourshop.com',
      to: email,
      subject: 'Purchase information',
      html:
        `<header style="width: 90%;margin: 10px auto;">
        <img
        style="width: 100%;margin: 10px auto;"
        src="https://res.cloudinary.com/mekinci/image/upload/v1581636170/Ekran_Resmi_2020-02-14_00.19.59_u4vznu.png"
        alt="header image"
        />
        </header>
        <table style="max-width: 850px;width: 90%; margin:0 auto">
        <tbody>` +
        content +
        `<tr style="margin-top:30px;font-weight:bold;">
        <td style="padding: 0 30px;">Total Payment</td>
        <td style="padding: 0 30px;"></td>
        <td style="padding: 0 30px;"></td>
        <td style="padding: 0 30px;"></td>
        <td style="padding: 0 30px;">$ ${generalTotal}</td>
        </tr>
        </tbody>
        </table>
        <footer  style="width: 90%;margin: 10px auto;">
        <img
        style="width: 100%;margin: 10px auto;"
        src="https://res.cloudinary.com/mekinci/image/upload/v1581845340/Ekran_Resmi_2020-02-16_09.08.23_qysc37.png"
        alt="footer img"
        />
        </footer>
        `,
    };

    transporter.sendMail(mailOptions, err => {
      if (err) {
        return res.status(501).send(err.message);
      }
      res.status(200).send(`Information email is sent to ${user.email}`);
    });
  } catch (error) {
    return res.status(501).send(error.message);
  }
}
