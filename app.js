const createError = require('http-errors');
const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const User = require('./models/user');

const indexRouter = require('./routes/index');
const produtoRouter = require('./routes/produtos');
const reviewsRouter = require('./routes/reviews');
const blogRouter = require('./routes/blogs');

const app = express();

mongoose.connect('mongodb://localhost:27017/slimcaps', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true}).then(() =>{
    console.log('Banco de Dados Connectado');
  }).catch(err => {
    console.log('ERROR', err.message);
  });


// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));



// Configure Passport and Sessions
app.use(session({
  secret: 'hang ten dude!',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set local variables middleware
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);
app.use('/produtos', produtoRouter);
app.use('/produtos/:id/reviews', reviewsRouter);
app.use('/blog', blogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
