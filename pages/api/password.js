import connectDb from "../../utils/connectDb";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import isLength from 'validator/lib/isLength';

connectDb();

export default async (req, res) => {
  const { current, requested } = req.body;
  console.log(req.body);
  // 1) Validate token & password
  if (!("authorization" in req.headers)) {
    return res.status(401).send("No authorization token");
  } else if (!requested) {
    return res.status(422).send('Can not update password without new password!');
  } else if (!isLength(requested, { min: 6 })) {
    return res.status(422).send('Password must be at least 6 characters');
  }
  try {
    // 1) check to see if a user exists with the provided token
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const user = await User.findOne({ _id: userId }).select("+password");
    // 2) --if not, return error
    if (!user) {
      return res.status(404).send("User not found.");
    }
    // Check if user has a password before
    if (user.password.trim().length === 0 && user.signInMethod && user.signInMethod !== 'email') {
      // 3) First time password set for social logged in user
      // hash the password
      const hash = await bcrypt.hash(requested, 10);
      await User.findOneAndUpdate({ _id: userId }, { password: hash });
      res.status(203).send("Password updated");
    } else if (current && isLength(current, { min: 6 })) { // If not first time set, current password is required
      // 3) check to see if users' password matches the one in db
      const passwordsMatch = await bcrypt.compare(current, user.password);
      // 4) --if so, update the password
      if (passwordsMatch) {
        // hash the password
        const hash = await bcrypt.hash(requested, 10);
        await User.findOneAndUpdate({ _id: userId }, { password: hash });
        res.status(203).send("Password updated");
      } else {
        res.status(401).send("Passwords do not match");
      }
    } else {
      return res.status(404).send("Current password is required to update the password.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in user");
  }
};
