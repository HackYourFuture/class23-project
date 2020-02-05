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
        msg: 'Unable to find a valid token. Your token may have expired.',
      });
    }

    const user = await User.findOne({ _id: tokenMatched.user });

    if (!user) {
      return res.status(400).send({ msg: 'Unable to find a user for this token. Please signup again.' });
    }

    if (user.isVerified) {
      return res
        .status(404)
        .send({ msg: 'This user has already been verified.', type: 'verified' });
    }

    user.isVerified = true;
    user.save(err => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }
      res.status(200).send({ msg: 'The account has been verified.', type: 'verified' });
    });
  } catch (error) {
    res.status(500).send({ msg: 'Error confirming user' });
  }
}

export default Confirmation;
