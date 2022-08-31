
const User = require("../models/user");
module.exports={

    getAllUser:()=>{

        return new Promise(async(resolve,reject)=>{
            let users =await User.find()
            resolve(users)
          })

    }


}