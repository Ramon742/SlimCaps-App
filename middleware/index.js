const Review = require('../models/review');
const User = require('../models/user');
const Produto = require('../models/produto');
//const { cloudinary } = require('../cloudinary');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

const middleware = {
    asyncErrorHandler: (fn) =>
		(req, res, next) => {
			Promise.resolve(fn(req, res, next))
						 .catch(next);
        },
        deleteProfileImage: async req => {
            if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
        },
        isLoggedIn: (req, res, next) => {
            if (req.isAuthenticated()) return next();
            req.session.error = 'You need to be logged in to do that!';
            req.session.redirectTo = req.originalUrl;
            res.redirect('/login');
        },
        isAuthorReview: async (req, res, next) => {
            if(req.isAuthenticated()){
                const review = await Review.findById(req.params.review_id);
                if (review.author.equals(req.user._id) || req.user.isAdmin) {
                    return next();
                }
                else{
                    res.redirect('/');
                }
            }else{
                res.redirect('/');
            }
            
            req.session.error = 'Access denied!';
            res.redirect('back');
        },
        isAdmin:(req, res, next) => {
            if(req.isAuthenticated() && req.user.isAdmin){
                return next();
            } else {
                res.redirect("/");
            }
        },
        isValidPassword: async (req, res, next) => {
            const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
            if (user) {
                // add user to res.locals
                res.locals.user = user;
                next();
            } else {
                middleware.deleteProfileImage(req);
                req.session.error = 'Incorrect current password!';
                return res.redirect('/profile');
            }
        },
        changePassword: async (req, res, next) => {
            const {
                newPassword,
                passwordConfirmation
            } = req.body;
    
            if (newPassword && !passwordConfirmation) {
                middleware.deleteProfileImage(req);
                req.session.error = 'Missing password confirmation!';
                return res.redirect('/profile');
            } else if (newPassword && passwordConfirmation) {
                const { user } = res.locals;
                if (newPassword === passwordConfirmation) {
                    await user.setPassword(newPassword);
                    next();
                } else {
                    middleware.deleteProfileImage(req);
                    req.session.error = 'New passwords must match!';
                    return res.redirect('/profile');
                }
            } else {
                next();
            }
        },
        async searchAndFilterPosts(req, res, next) {
            const queryKeys = Object.keys(req.query);
    
            if(queryKeys.length) {
                const dbQueries = [];
                let { search, price, avgRating} = req.query;
    
                if (search) {
                    search = new RegExp(escapeRegExp(search), 'gi');
                    dbQueries.push({ $or: [
                            { name: search },
                            { description: search }
                        ]
                    });
                }
    
                if (price) {
                    if (price.min) dbQueries.push({ price: { $gte: price.min } });
                    if (price.max) dbQueries.push({ price: { $lte: price.max } });
                }
    
                if (avgRating) {
                    dbQueries.push({ avgRating: { $in: avgRating } });
                }
    
                res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
            }
    
            res.locals.query = req.query;
    
            queryKeys.splice(queryKeys.indexOf('page'), 1);
            const delimiter = queryKeys.length ? '&' : '?';
            res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;
    
            next();
        }
};

module.exports = middleware;