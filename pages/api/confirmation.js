import Token from '../../models/Token';
import User from '../../models/User';
import connectDb from '../../utils/connectDb';

connectDb();

async function Confirmation(req, res) {
  const { token } = req.query;
  try {
    const tokenMatched = await Token.findOne({ token: token });

    if (!tokenMatched) {
      return res.status(400).send({
        type: 'not-verified',
        msg: 'Activation link has expired.',
      });
    }

    const user = await User.findOne({ _id: tokenMatched.user });

    if (!user) {
      return res
        .status(400)
        .send({ msg: 'Unable to find a user. Please signup again.' });
    }

    if (user.isVerified) {
      return res
        .status(404)
        .send({ msg: 'Account has already been verified.', type: 'verified' });
    }

    user.isVerified = true;
    user.save(err => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }
      res.status(200).send({ msg: 'Account has been verified.', type: 'verified' });
    });
  } catch (error) {
    res.status(500).send({ msg: 'Error activating account' });
  }
}

export default Confirmation;
