const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');


router.get('/', async (req, res, next) => {
   let blog = await Blog.find({});
   res.render('blog/index', {blog});
});

router.get('/adicionar-blog', (req, res, next) => {
  res.render('blog/adicionar');
});

router.post('/', async (req, res, next) => {
  let blog = await new Blog(req.body);
  blog.save();
  res.redirect('/blog');
});

router.get('/:id', async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);
  res.render('blog/mostrar', {blog});
});

router.get('/:id/editar', async (req, res, next) => {
    let blog = await Blog.findById(req.params.id)
  res.render('blog/editar', {blog});
});

router.put('/:id/', async (req, res, next) => {
  let blog = await Blog.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/blog/${blog.id}`);
});

router.delete('/:id', async (req, res, next) => {
    await Blog.findByIdAndRemove(req.params.id);
    res.redirect('/blog');
});

module.exports = router;
