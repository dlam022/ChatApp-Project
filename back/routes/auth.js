const express = require('express');
const User = require('../model/user');
const router = express.Router()
const cors = require('cors');
const app = express();
const speakeasy = require('speakeasy');

module.exports = router;
app.use(cors({origin: 'http://localhost:3000', credentials:true}))



router.post('/login', async (req, res) => {
    const {session} = req;
    const { username, password,totpCode } = req.body;

    // check if user in database
    const user = await User.findOne({ username });
  
    if (!user)
      return res.json({ msg: "Incorrect Username ", status: false });
    else if (user.password !== password)
      return res.json({ msg: "Incorrect Password", status: false });
    else {
      // const isTotpValid = speakeasy.totp.verify({
      //   secret: user.totpSecret,
      //   encoding: 'base32',
      //   token: totpCode,
      //   window: 1,
      // });

    
      // if (!isTotpValid) {
      //   return res.json({ msg: 'Invalid TOTP code', status: false, totpCode: totpCode, userSecret: user.totpSecret });
      // }
      if (user.totpSecret !== totpCode) {
        return res.json({ msg: 'Invalid TOTP code', status: false, totpCode: totpCode, userSecret: user.totpSecret });
      }
      session.authenticated = true;
      session.username = username;
      res.json({ msg: "Logged in", status: true });
    }
});

// Set up a route for the logout page
router.get('/logout', (req, res) => {
    // Clear the session data and redirect to the home page
    req.session.destroy();
    res.send({msg: "Logged out", status: true})
  });


router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.json({ msg: "Username already taken", status: false });
  }
  // res.json({"regular password: ": password})
  // res.json({"hashed password": password.hashCode()})
  // res.json({ username, hashedPass, name })
  // const user = new User({ username, password, name });
  // await user.save();
  const totpSecret = speakeasy.generateSecret({
    length: 5,
    symbols: false,
  }).base32;

  const user = new User({ username, password, name, totpSecret });
  await user.save();

  // res.json({"totpSecret":totpSecret})
  res.json({ msg: "User registered successfully", status: true, totpSecret:totpSecret });
});
    

  //NEED TO MAKE SIGNUP PAGE, EDIT PROFILE, etc,