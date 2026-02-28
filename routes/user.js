const express = require("express");
const router = express.Router();
const User = require("../Models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const {saveRedirectUrl, isLoggedIn, log} = require("../middleware.js");

const userController = require("../controllers/users");


router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));


// passport.authenticate requires 2 params
// 1) Failure authenticate 2)  strategy
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate('local', {failureRedirect: '/user/login', failureFlash : true}),
        userController.login
    );

router.get("/logout", userController.logout);

module.exports = router;