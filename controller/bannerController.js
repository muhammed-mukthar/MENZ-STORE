
let bannerServices = require("../services/bannerServices");


/* --------------------------- banner manage page --------------------------- */

exports.bannermanage=(req, res) => {
    bannerServices.getbannerpage().then((result) => {
      res.render("admin/banner", { bannerdetails: result });
    });
  }


  /* ------------------------------- add banner ------------------------------- */



  exports.addbanner= (req, res) => {
    try {
      let bannerimage = req.files?.bannerimage;
      let heading = req.body.heading;
      let desc = req.body.desc;
      console.log(bannerimage);
      bannerServices.add(heading, desc).then((result) => {
        bannerServices.bannerimage(bannerimage, result._id).then(() => {
          console.log(result._id);
          res.redirect("/admin/bannermanage");
        });
      });
    } catch (err) {
      console.log(err, "error happened in banner");
    }
  }

  /* ------------------------------ delete banner ----------------------------- */

  exports.deletebanner=(req, res) => {
    let bannerId = req.params.id;
    bannerServices.deletebanner(bannerId).then(() => {
      res.redirect("back");
    });
  }