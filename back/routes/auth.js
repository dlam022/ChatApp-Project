const express = require('express');
const User = require('../model/user');
const router = express.Router()
const cors = require('cors');
const app = express();

module.exports = router;
app.use(cors({origin: 'http://localhost:3000', credentials:true}))



router.post('/login', async (req, res) => {
    const {session} = req;
    const { username, password } = req.body;

    // check if user in database
    const user = await User.findOne({ username });
  
    if (!user)
      return res.json({ msg: "Incorrect Username ", status: false });
    else if (user.password !== password)
      return res.json({ msg: "Incorrect Password", status: false });
    else {
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
  const user = new User({ username, password, name });
  await user.save();

  res.json({ msg: "User registered successfully", status: true });
});
    

  //NEED TO MAKE SIGNUP PAGE, EDIT PROFILE, etc,