const referalService=require('../services/referalService')

/* --------------------------- referal offer page --------------------------- */
exports.referralPage= (req, res) => {
    try {
      referalService.referramountdetails().then((referalamountdetails) => {
        console.log(referalamountdetails);
        res.render("admin/adminreferral", { referalamountdetails });
      });
    } catch (err) {
      console.log(err, "error happened in referal offer page");
    }
  }

/* ----------------------------- refferal offer ----------------------------- */
  exports.referraloffer=(req, res) => {
    try {
      let referralAmount = req.body.referral;
      let referedUser = req.body.referreduserAmount;
      referalService.referramount(referralAmount, referedUser).then(() => {
        res.redirect("/admin/referraloffer");
      });
    } catch (err) {
      console.log(err, "error happened in referal offer form submit");
    }
  }

  exports.delete_referraloffer=(req, res) => {
    let refferralOfferId = req.params.id;
    referalService.delete_referralOffer(refferralOfferId).then(() => {
      res.redirect("back");
    });
  }