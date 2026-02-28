const Listing = require("../Models/listing");
const ExpressError = require("../utils/ExpressError");
const Review = require("../Models/review");

module.exports.postReview = async(req, res) => {
    console.log("posting Review");
    let listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    let newReview = new Review (req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}
module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
};