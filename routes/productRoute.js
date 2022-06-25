const express = require('express');
const router = express.Router();
const { create } = require('../controllers/productController');
const { requireSignin, isAuth, isAdmin } = require('../controllers/authController');
const { userById } = require('../controllers/userController');

router.post("/product/create/:userId", requireSignin, isAdmin, isAuth, create);



router.param("userId", userById);
module.exports = router;
