const express=require('express')
const app=express()
const userroute=require('./routes/user')
const adminroute=require('./routes/admin')
const path=require('path')
const mongoose=require('mongoose')
// const session=require('express-session')

const dotenv=require('dotenv')


dotenv.config()


const port=process.env.PORT||3000;


mongoose.connect(process.env.DB_CONNECT)
.then(()=>console.log("database connected succesfully")).catch((err)=>console.log(err))

// app.use(session({secret:"secret",saveUninitialized:fa}))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users',userroute)
app.use('/admin',adminroute)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')
app.get('/',(req,res)=>{
    res.render('publicuser/home')
})





app.listen(port,()=> console.log("server hosted in localhost:3000"))