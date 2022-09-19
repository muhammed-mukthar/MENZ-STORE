
let bannerServices = require("../services/bannerServices");


/* --------------------------- banner manage page --------------------------- */

exports.bannermanage=(req, res) => {
  try{
    bannerServices.getbannerpage().then((result) => {
      res.render("admin/banner", { bannerdetails: result });
    });

  }catch(err){
    console.log(err,'errpr happened in banner manage');
    res.redirect('/404')
  }
  
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
      res.redirect('/404')
    }
  }

  /* ------------------------------ delete banner ----------------------------- */

  exports.deletebanner=(req, res) => {
    try {
      let bannerId = req.params.id;
    bannerServices.deletebanner(bannerId).then(() => {
      res.redirect("back");
    }).catch(()=>{res.redirect('/404')});
    } catch (error) {
      res.redirect('/404')
    }
    
  }