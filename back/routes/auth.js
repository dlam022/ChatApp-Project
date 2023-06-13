const express = require('express');
const User = require('../model/user');
const router = express.Router()
const cors = require('cors');
const app = express();
const speakeasy = require('speakeasy');

module.exports = router;
app.use(cors({origin: '*', credentials:true}))



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

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send({msg: "Logged out", status: true})
  });

  router.get('/resetTotp', async (req, res) => {
    const { session } = req;
    if (!session.authenticated) {
      return res.json({ msg: "Not authenticated", status: false });
    }
  
    try {
      const user = await User.findOne({ username: session.username });
  
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      }
  
      const newTotpSecret = speakeasy.generateSecret({
        length: 5,
        symbols: false,
      }).base32;
  
      user.totpSecret = newTotpSecret;
      await user.save();
  
      res.json({ msg: "TOTP reset successfully", status: true, totpSecret: newTotpSecret });
    } catch (error) {
      console.error("Error resetting TOTP:", error);
      res.json({ msg: "Failed to reset TOTP", status: false });
    }
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