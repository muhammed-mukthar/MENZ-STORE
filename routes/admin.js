const router=require('express').Router()

const Admin=require('../models/admin')


router.get('/',(req,res)=>{
    res.render('admin/admin')
})

//admin login
router.get('/login',(req,res)=>{
    res.render('admin/login')
})

//admin login post

router.post('/login',(req,res)=>{
    try{
       Admin.findOne({email:req.body.email},{password:req.body.password})
       res.status(200).redirect('/admin')

    }catch(err){
        res.status(500).send(err)
    }
})

//admin user management

router.get('/usermanagement',(req,res)=>{
    res.render('admin/adminuser')
})

module.exports=router