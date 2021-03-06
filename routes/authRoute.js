const express = require('express');
const router = express.Router();
const {signup, signin, signout, requireSignin, validadeToken } = require('../controllers/authController');
const {userSignupValidator} = require('../validator');


router.post("/signup", userSignupValidator, signup);
router.post("/signin",  signin);
router.get("/validadeToken", requireSignin, validadeToken)
router.get("/signout",  signout);

router.get("/hello", requireSignin, (req, res) => {
    res.send("hello");
});



module.exports = router;
