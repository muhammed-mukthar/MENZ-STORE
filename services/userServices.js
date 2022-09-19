
const User = require("../models/user");
module.exports={

    getAllUser:()=>{
      

        return new Promise(async(resolve,reject)=>{
            try{

           
            let users =await User.find()
            resolve(users)
        }catch(err){
            console.log(err);
            reject(err)
           }
          })

    }


}