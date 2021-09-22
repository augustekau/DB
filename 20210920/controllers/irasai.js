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
    .lean();
});

module.exports = router;
