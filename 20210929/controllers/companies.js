const express = require("express");
const validator = require("validator");
const db = require("../db/connection");
const app = express.Router();

app.get("/add-company", (req, res) => {
  // if (!req.session.auth) {
  //   res.redirect("/");
  //   return;
  // }

  res.render("add-company");
});

app.post("/add-company", (req, res) => {
  //cia is to ka suvedem pasiimam name
  let companyName = req.body.name;
  let companyAddress = req.body.address;

  if (
    !validator.isAlphanumeric(companyName, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(companyName, { min: 3, max: 50 })
  ) {
    res.redirect("/list-companies/?m=Įveskite kompanijos pavadinimą&s=danger");
    return;
  }

  if (
    !validator.isAlphanumeric(companyAddress, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(companyAddress, { min: 3, max: 100 })
  ) {
    res.redirect("/list-companies/?m=Įveskite kompanijos adresą&s=danger");
    return;
  }

  //patikrinam ar ivestas name ir adresas jau yra duomenu bazej
  db.query(
    `SELECT * FROM companies WHERE name = '${companyName}'`,
    (err, resp) => {
      if (err) {
        res.redirect("/list-companies/?m=Ivyko klaida%&s=warning");
        return;
      }
      if (resp.length == 0) {
        db.query(
          //kreipiames i db. ir idedam duomenis '${companyName})' <- taip idedam kintamuosius
          `INSERT INTO companies (name, address) 
                    VALUES ( '${companyName}' , '${companyAddress}' )`,
          (err) => {
            if (err) {
              console.log(err);
              return;
            }

            res.redirect(
              "/list-companies/?m=Sėkmingai pridėjote įrašą&s=success"
            );
          }
        );
      } else {
        res.redirect("/list-companies/?m=Toks įrašas jau egzistuoja&s=warning");
      }
    }
  );
});

app.get("/list-companies", (req, res) => {
  let messages = req.query.m;
  let status = req.query.s;
  db.query(`SELECT * FROM companies`, (err, resp) => {
    if (!err) {
      res.render("list-companies", { companies: resp, messages, status });
    }
  });
});

/// REDAGAVIMAS

app.get("/edit-company/:id", (req, res) => {
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM companies WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.render("edit-company", {
        edit: resp[0],
        messages,
        status,
      });
    }
  });
});

// app.get("/page/:id", (req, res) => {
//   let puslapio_nr = req.params.id;

//   res.send("Test " + puslapio_nr);
// });

//FIRST TRY
// app.post("/edit-company", (req, res) => {
//   let companyName = req.body.name;
//   let companyAddress = req.body.address;
//   let id = req.body.id;
//   if (
//     !validator.isAlphanumeric(companyName, "en-US", {
//       ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
//     }) ||
//     !validator.isLength(companyName, { min: 3, max: 50 })
//   ) {
//     res.redirect(
//       "/edit-company/" + id + "/?m=Įveskite imones pavadinimą&s=danger"
//     );
//     return;
//   }

//   if (
//     !validator.isAlphanumeric(companyAddress, "en-US", {
//       ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
//     }) ||
//     !validator.isLength(companyAddress, { min: 3, max: 100 })
//   ) {
//     res.redirect("/edit-company/" + id + "/?m=Įveskite imones adresą&s=danger");
//     return;
//   }

//   db.query(
//     `UPDATE companies SET name ='${companyName}', address = '${companyAddress}' WHERE id='${id}'`,
//     (err, resp) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.redirect(
//           "/list-companies/?m=Irasas sekmingai atnaujintas&s=success"
//         );
//       }
//     }
//   );
// });

app.post("/edit-company/:id", (req, res) => {
  let companyName = req.body.name;
  let companyAddress = req.body.address;
  let id = req.params.id;

  if (
    !validator.isAlphanumeric(companyName, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(companyName, { min: 3, max: 50 })
  ) {
    res.redirect(
      "/edit-company/" + id + "/?m=Įveskite imones pavadinimą&s=danger"
    );
    return;
  }

  if (
    !validator.isAlphanumeric(companyAddress, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(companyAddress, { min: 3, max: 100 })
  ) {
    res.redirect("/edit-company/" + id + "/?m=Įveskite imones adresą&s=danger");
    return;
  }

  db.query(
    `SELECT COUNT(*) kiekis FROM companies WHERE name = '${companyName}' AND id != ${id}`,
    (err, dbresp) => {
      if (!err) {
        if (dbresp[0].kiekis == 0) {
          db.query(
            `UPDATE companies SET name ='${companyName}', address = '${companyAddress}' WHERE id='${id}'`,
            (err, resp) => {
              if (!err) {
                res.redirect(
                  "/list-companies/?m=Įrašas sėkmingai atnaujintas&s=success"
                );
              } else {
                res.redirect("/list-companies/?m=Įvyko klaida&s=danger");
              }
            }
          );
        } else {
          res.redirect(
            "/edit-company/" +
              id +
              "/?m=Toks kompanijos pavadinimas jau įrašytas&s=warning"
          );
        }
      } else {
        res.redirect("/list-companies/?m=Įvyko klaida&s=danger");
      }
    }
  );
});

//DELETE

app.get("/delete-company/:id", (req, res) => {
  let id = req.params.id;
  db.query(`DELETE FROM companies WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.redirect("/list-companies?message=Imones duomenis istrinti&m=danger");
    } else {
      res.redirect("/list-companies/?m=Nepavyko ištrinti įrašo&s=danger");
    }
  });
});

module.exports = app;
