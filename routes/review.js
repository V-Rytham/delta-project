const express = require("express");
const router = express.Router({mergeParams: true});
const {listingSchema, reviewSchema} = require("../schema.js");
const Review = require("../Models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../Models/listing.js");
const {isLoggedIn, isReviewAuthor, validateReview} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


// Reviews
//post review route
router.post(
    "/",
    isLoggedIn,
    validateReview, 
    wrapAsync(reviewController.postReview)
);

// Delete review Route 
router.delete (
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;