const Listing = require("./Models/listing");
const Review = require("./Models/review");
const reviewSchema = require("./schema");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // passport method
        req.session.redirectUrl = req.originalUrl;
        console.log(req.originalUrl);
        console.log(req.session.redirectUrl);
        req.flash("error", "You must be logged in first");
        return res.redirect("/user/login");
    } 
    next(); 
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; //session is created by the plugin
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing =  await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not Found");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    return next();
}

module.exports.validateReview =  (req, res, next) => {
    let {error} = reviewSchema.validate(req.body); 
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};