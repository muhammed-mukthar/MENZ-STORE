const express=require('express')
const app=express()
const userroute=require('./routes/user')
const adminroute=require('./routes/admin')
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const methodOverride = require("method-override");

const dotenv=require('dotenv')
const fileUpload = require('express-fileupload')




dotenv.config()


const port=process.env.PORT||3000;



app.use(session({secret:"secret",
saveUninitialized:true,
resave:false
}))

app.use(logger('dev'));
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next()
})
app.use(cookieParser());
app.use(express.static((path.join(__dirname, 'uploads'))))
app.use('/users',userroute)
app.use('/admin',adminroute)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')
app.use(fileUpload())


mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("database connected succesfully")).catch((err)=>console.log(err))

app.get('/',(req,res)=>{
    res.render('user/home')
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.mess = err.mess;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  

app.listen(port,()=> console.log("server hosted in localhost:8000"))