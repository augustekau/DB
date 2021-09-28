const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
//pasirenkam modelio paradinima"irasai" ir irasai.model.js faile 15 eilutes
const irasaimodel = mongoose.model("irasai");

router.get("/", (req, res) => {
  //irasu pridejimas
  //   var irasas = new irasaimodel();
  //   irasas.pavadinimas = "test666";
  //   irasas.turinys = "kjhggtfrghj";
  //   irasas.data = "2021-09-15";
  //   irasas.save();

  //irasu paemimas
  irasaimodel
    .find((error, informacija) => {
      if (!error) {
        //   res.json(informacija);

        informacija.forEach(function (item) {
          var data = new Date(item.data);
          item.data = data.toLocaleDateString("lt-LT");
        });
        res.render("list", { data: informacija });
      } else {
        res.send("ivyko klaida");
      }
    })
    //parenkam kalba
    .collation({ locale: "lt" })
    //issrusiujam a->z, -1 reiksme rusiuoja z->a
    .sort({ pavadinimas: 1 })
    .lean();
});

router.get("/rusiavimas/desc", (req, res) => {
  irasaimodel
    .find((erroras, informacija) => {
      if (!erroras) {
        informacija.forEach(function (item) {
          var data = new Date(item.data);
          item.data = data.toLocaleDateString("lt-LT");
          item._id = item._id.toString();
        });

        res.render("list", { data: informacija });
      } else {
        res.send("Ivyko klaida");
      }
    })
    .collation({ locale: "lt" })
    .sort({ pavadinimas: -1 })
    .lean();
});

//su get persuodama info, kuri matoma (atvaizduojam html is add.hbs)
router.get("/pridejimas", (req, res) => {
  var date = new Date();
  date = date.toLocaleDateString("lt-LT");

  res.render("add", { data: date });
});

router.post("/edit_submit", (req, res) => {
  irasaimodel
    .findByIdAndUpdate(
      { _id: req.body.id },
      {
        pavadinimas: req.body.pavadinimas,
        turinys: req.body.turinys,
        data: req.body.data,
      }
    )
    .then((data) => {
      res.redirect("/irasai");
    });
});

router.get("/edit/:id", (req, res) => {
  const id = req.params.id;

  irasaimodel
    .findById(id)
    .lean()
    .then((info) => {
      var data = new Date(info.data);
      info.data = data.toLocaleDateString("lt-LT");

      res.render("edit", { edit: info });
    })
    .catch((err) => {
      res.json({
        response: "fail",
        message: err.message,
      });
    });
});

//post perduodama info kuri yra nematoma/ submit imamas is add hbs 1 eilute action. reiksia jis paims info kuria irasysim i forma
//i redirecta butina irasyti irasus, nes redirektinam bet kur
router.post("/submit", (req, res) => {
  //irasu pridejimas
  var irasas = new irasaimodel();
  irasas.pavadinimas = req.body.pavadinimas;
  irasas.turinys = req.body.turinys;
  irasas.data = req.body.data;
  irasas.save();
  res.redirect("/irasai");
});

//perziuros funkcija
router.get("/view/:id", (req, res) => {
  const id = req.params.id;
  irasaimodel
    .findById(id)
    .lean()
    .then((info) => {
      var data = new Date(info.data);
      info.data = data.toLocaleDateString("lt-LT");
      res.render("perziura", { view: info });
    })
    .catch((err) => {
      res.json({
        response: "fail",
        message: err.message,
      });
    });
});

//istynimo funkcija
// router.get("/delete/:id", (req, res) => {
//   irasaimodel.findByIdAndRemove(req.params.id, function (err) {
//     if (err) {
//       // console.log("nera id");
//       res.redirect("/irasai");
//     } else {
//       res.redirect("/irasai");
//     }
//   });
// });

router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  irasaimodel
    .findByIdAndRemove(id)
    .then((info) => {
      res.redirect("/irasai");
    })
    .catch((err) => {
      res.json({
        response: "fail",
        message: err.message,
      });
    });
});

router.get("/paieska", (req, res) => {
  res.render("paieska");
});

router.post("/paieska", (req, res) => {
  const s = req.body.s;

  irasaimodel
    .find({ $text: { $search: s } }, (erroras, informacija) => {
      if (!erroras) {
        // res.json(informacija);

        informacija.forEach(function (item) {
          var data = new Date(item.data);
          item.data = data.toLocaleDateString("lt-LT");
        });
        res.render("rezultatas", { s: s, data: informacija });
      } else {
        res.send("Ivyko klaida");
      }
    })
    //Pakeiciame modelio kalbos atpazinima i lietuviska
    .collation({ locale: "lt" })
    //isrusiuojame gauta informacija zemejimo tvarka (jeigu norime atvirksciai rasome -1)
    .sort({ pavadinimas: 1 })
    //grazina apdorota informacijos paketa
    //https://mongoosejs.com/docs/tutorials/lean.html
    .lean();
});

module.exports = router;
