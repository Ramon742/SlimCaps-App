const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review');
const Produto = require('../models/produto');
const {
	isLoggedIn,
	isAuthorReview,
  searchAndFilterPosts,
  isAdmin
} = require('../middleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', async (req, res, next) => {
// find the post by its id and populate reviews
		let produto = await Produto.findById(req.params.id).populate('reviews').exec();
		// filter post.reviews to see if any of the reviews were created by logged in user
		// .filter() returns a new array, so use .length to see if array is empty or not
		let haveReviewed = produto.reviews.filter(review => {
			return review.author.equals(req.user._id);
		}).length;
		// check if haveReviewed is 0 (false) or 1 (true)
		if(haveReviewed) {
			// flash an error and redirect back to post
			//req.flash('error', 'Sorry, you can only create one review per post.');
			return res.redirect(`/produtos/${produto.id}`);
		}
		// create the review
		req.body.review.author = req.user._id;
		let review = await Review.create(req.body.review);
		// assign review to post
		produto.reviews.push(review);
		// save the post
		produto.save();
		// redirect to the post
		//req.flash('success', 'Review created successfully!');
		res.redirect(`/produtos/${produto.id}`);
});

router.put('/:review_id', isAuthorReview,async (req, res, next) => {
  await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
		//req.flash('success', 'Review updated successfully!');
		res.redirect(`/produtos/${req.params.id}`);
});

router.delete('/:review_id', isAuthorReview, async (req, res, next) =>{
  await Produto.findByIdAndUpdate(req.params.id, {
    $pull: { reviews: req.params.review_id }
  });
  await Review.findByIdAndRemove(req.params.review_id);
  //req.flash('success', 'Review deleted successfully!');
  res.redirect(`/produtos/${req.params.id}`);
});

module.exports = router;