const CouponServices = require("../services/CouponServices");


/* ------------------------------- applycoupon ------------------------------ */

exports.applyCoupon=(req,res)=>{
    let coupon=req.body.coupon
    let userId = req.session.user?._id;
    let totalAmount=req.body.totalamount
    CouponServices.applyCoupon(coupon,userId,totalAmount).then((couponexist)=>{
      req.session.discountprice=couponexist
      res.redirect('/checkout')
    }).catch((err)=>{
      req.session.message = {
        message: err,
      };
      req.session.discountprice=false
      res.redirect('back')
    })
  }
  /* ---------------------------- coupon offer page --------------------------- */

  exports.couponoffer_Page=async (req, res) => {
    CouponServices.allCoupon().then((allcoupon) => {
      console.log(allcoupon);
      res.render("admin/couponoffer", { allcoupon });
    });
  }


  /* ------------------------------ create coupon ----------------------------- */

  

 exports.create_coupon=async (req, res) => {
  try {
    let coupon = req.body.coupon;
    let validdate = req.body.validdate;
    let expiredate = req.body.expiredate;
    let offer = req.body.offer;
    let minpurchase = req.body.min;

    CouponServices
      .addcoupon(coupon, validdate, expiredate, offer, minpurchase)
      .then((couponalreadyexist) => {
        if(couponalreadyexist){
          req.session.message = {
            type: "danger",
             message: "coupon already exist",
          }
          res.redirect("/admin/couponoffer");
      
        }else{
          res.redirect("/admin/couponoffer");
        }

 
      });
  } catch (err) {
    console.log(err, "error happened in coupon");
  }
}





  /* ------------------------------ delete coupon ----------------------------- */

  exports.delete_coupon=(req, res) => {
    let couponId = req.params.id;
    CouponServices.deletCoupon(couponId).then((delet) => {
      res.redirect("back");
    });
  }


 exports.invalidcoupon=(req, res) => {
    let couponId = req.params.id;
    CouponServices.Invalidcoupon(couponId).then(() => {
      res.redirect("back");
    });
  }

  exports.valid_Coupon=(req, res) => {
    let couponId = req.params.id;
    CouponServices.validcoupon(couponId).then(() => {
      res.redirect("back");
    });
  }