if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose=require('mongoose')
const methodOverride=require('method-override')
const flash=require('connect-flash')
const session=require('express-session')
const url = process.env.URL


var indexRouter = require('./routes/index');
var registrationRouter = require('./routes/registration');
var loginrouter = require('./routes/login')
var adminrouter = require('./routes/admin')
var app = express();

mongoose.connect(url)
.then(()=>{
    console.log("CONNECTION OPEN!!!")
})
.catch(err=>{
    console.log("OH NO ERROR!!!!")
    console.log(err)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({
  secret:'secret',
  resave:false,
  saveUninitialized:false
}))
app.use((req,res,next)=>{
  res.locals.success=req.flash('success');
  res.locals.failed=req.flash('failed');

  next()
})

app.use('/', indexRouter);
app.use('/register', registrationRouter);
app.use('/login',loginrouter)
app.use('/admin',adminrouter)

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
