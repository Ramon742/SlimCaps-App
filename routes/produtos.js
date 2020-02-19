var express = require('express');
var router = express.Router();
const Produto = require('../models/produto');
const {
	isLoggedIn,
	isAuthorReview,
  searchAndFilterPosts,
  isAdmin
} = require('../middleware');

/* GET produto */
router.get('/', async function(req, res, next) {
  let produtos = await Produto.find({});
  res.render('produto/index', {produtos});
});

  /* GET form produto. */
router.get('/adicionar-produto', isAdmin, function(req, res, next) {
   res.render("produto/adicionar");
});

  /* POST produto */
router.post('/', isAdmin, async function(req, res, next) {
    let produto = await new Produto(req.body.produto);
    produto.save();
    res.redirect(`/produtos/${produto.id}`);
});


 router.get('/:id', async (req, res, next) => {
  try{
    console.log('got here');
      let produto = await Produto.findById(req.params.id).populate({
          path: 'reviews',
          options: { sort: { '_id': -1 } },
          populate: {
              path: 'author',
              model: 'User'
          }
      });
      console.log(produto);
      console.log('produto');
      const floorRating = produto.calculateAvgRating();
      res.render('produto/mostrar', { produto, floorRating});
  }catch(err){
    console.log(err);
      //req.flash('error', 'post not found!');
      res.redirect('/produtos');
  }
});

/* GET form edit */
router.get('/:id/editar', async function(req, res, next) {
    let produto = await Produto.findById(req.params.id);
   res.render('produto/editar', {produto});
});

  /* UPDATE produto */
router.put('/:id/', async function(req, res, next) {
   let produto = await Produto.findByIdAndUpdate(req.params.id, req.body.produto);
   res.redirect(`/produtos/${produto.id}`);
});

  /* DELETE produto */
router.delete('/:id', async function(req, res, next) {
    await Produto.findByIdAndRemove(req.params.id);
    res.redirect('/produtos');
});

module.exports = router;
