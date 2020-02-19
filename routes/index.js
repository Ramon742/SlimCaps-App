const User = require('../models/user');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const util = require('util');//what is it

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/entrar', function(req, res, next) {
  res.render('entrar');
});

router.get('/registrar', function(req, res, next) {
  res.render('registrar');
});

router.post('/registrar', async function(req, res, next) {
  try{
		/*if (req.file) {
			const { secure_url, public_id } = req.file;
			req.body.image = { secure_url, public_id };
		}*/
	  const user = await User.register(new User(req.body), req.body.password);
		req.login(user, function(err) {
			if (err) return next(err);
			//req.flash("success", "Welcome to " + user.username);
			res.redirect('/');
		});	
	}catch(err){
		//deleteperfilImage(req);
		const { username, email } = req.body;
		let error = err.message;
		if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
			error = 'A user with the given email is already registered';
		}
    //req.flash("error", error);
    console.log(err);
		res.redirect('/registrar');
	}
});

router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/');
	if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
	res.render('entrar', { title: 'Login' });
});

router.post('/login', async (req, res, next) =>{
  const { username, password } = req.body;
  const { user, error } = await User.authenticate()(username, password);
  if (!user && error) return next(error);
  req.login(user, function(err) {
    if (err) return next(err);
    //req.flash('success', `Welcome back, ${username}!`);
    const redirectUrl = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
  });
});

router.get('/logout', function(req, res, next) {
  req.logout();
	res.redirect('/');
});

router.get('/perfil', async(req, res, next) =>{
	const usuario = await User.findById(req.user._id);
	console.log(usuario.endereco.cidade);
	res.render('perfil', {usuario});
});

router.put('/perfil', async (req, res, next) =>{
	const {
		username,
		email,
		telefone,
		estado,
		cidade,
		bairro,
		rua
	} = req.body;
	const user = await User.findById(req.user._id);
	console.log(user);
	if (username) user.username = username;
	if (email) user.email = email;
	if (telefone) user.telefone = telefone;
	if (estado) user.endereco.estado = estado;
	if (cidade) user.endereco.cidade = cidade;
	if (bairro) user.endereco.bairro = bairro;
	if (rua) user.endereco.rua = rua;
	await user.save();
	const login = util.promisify(req.login.bind(req));
	await login(user);
	//req.flash('success','perfil successfully updated!');
	res.redirect('/perfil');
});


module.exports = router;