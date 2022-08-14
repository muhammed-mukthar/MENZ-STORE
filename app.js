const express=require('express')
const app=express()
const userroute=require('./routes/user')
const adminroute=require('./routes/admin')
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')

const dotenv=require('dotenv')


dotenv.config()


const port=process.env.PORT||3000;


mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("database connected succesfully")).catch((err)=>console.log(err))

app.use(session({secret:"secret",
saveUninitialized:true,
resave:false
}))


app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next()
})
app.use(express.static((path.join(__dirname, 'uploads'))))
app.use('/users',userroute)
app.use('/admin',adminroute)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')


app.get('/',(req,res)=>{
    res.render('user/home')
})


app.listen(port,()=> console.log("server hosted in localhost:8000"))