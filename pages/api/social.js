import connectDb from '../../utils/connectDb';
import User from '../../models/User';
import Cart from '../../models/Cart';
import jwt from 'jsonwebtoken';
import initializeAdmin from '../../utils/initializeAdmin';


connectDb();
const admin = initializeAdmin();

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
  const { idToken, username: name, email, provider } = req.body;
  if (!idToken || !name || !email || !provider) {
    return res
      .status(422)
      .send(
        'Can not sign in without one of these parameters: idToken, username, email, provider',
      );
  }
  try {
    // ------ Check if the idToken is valid ------
    admin.auth().verifyIdToken(idToken, true);
    // ------ Interactions with our DB ------
    // 1) check to see if a user exists with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      // 2) --if not, create user
      // 3) create user
      const newUser = await new User({
        name,
        email,
        signInMethod: provider.substring(0, provider.indexOf('.')),
        password: '',
        isVerified: true,
      }).save();

      // 4) create cart for new user
      await new Cart({ user: newUser._id }).save();
      // 5) create token for the new user
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      // 6) send back token
      res.status(201).json(token);
    } else {
      // 2) if exists, create token for the user
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      // 3) send that token to the client
      res.status(200).json(token);
    }
  } catch (error) {
    // console.error(error);
    res.status(500).send('Error signing in user');
  }
};
