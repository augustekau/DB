const express = require("express");
const validator = require("validator");
const db = require("../db/connection");
const app = express.Router();

//ADD AUTHOR
app.get("/add-author", (req, res) => {
  res.render("authors/add-author");
});

app.post("/add-author", (req, res) => {
  //cia is to ka suvedem pasiimam name
  let authorName = req.body.name;
  let authorSurname = req.body.surname;

  if (
    !validator.isAlphanumeric(authorName, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(authorName, { min: 1, max: 64 })
  ) {
    res.redirect("/list-authors/?m=Enter the name of the author&s=danger");
    return;
  }

  if (
    !validator.isAlphanumeric(authorSurname, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(authorSurname, { min: 1, max: 64 })
  ) {
    res.redirect("/list-authors/?m=Enter the surname of the author&s=danger");
    return;
  }
  //patikrinam ar ivestas name ir surname jau yra duomenu bazej
  db.query(
    `SELECT * FROM authors WHERE name = '${authorName}' AND surname = '${authorSurname}'  `,
    (err, resp) => {
      if (err) {
        res.redirect("/list-authors/?m=Error%&s=warning");
        return;
      }
      if (resp.length == 0) {
        db.query(
          //kreipiames i db. ir idedam duomenis
          `INSERT INTO authors (name, surname) 
                    VALUES ( '${authorName}' , '${authorSurname}' )`,
          (err) => {
            if (err) {
              console.log(err);
              return;
            }

            res.redirect("/list-authors/?m=Author is added&s=success");
          }
        );
      } else {
        res.redirect("/list-authors/?m=This author is already added&s=warning");
      }
    }
  );
});

// AUTHORS LIST
//atvaizduojam list authors hbs ir paimam duomenis is db
app.get("/list-authors", (req, res) => {
  let messages = req.query.m;
  let status = req.query.s;
  db.query(`SELECT * FROM authors`, (err, resp) => {
    if (!err) {
      res.render("authors/list-authors", { authors: resp, messages, status });
    }
  });
});

//EDIT AUTHOR
app.get("/edit-author/:id", (req, res) => {
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM authors WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.render("authors/edit-author", {
        edit_author: resp[0],
        messages,
        status,
      });
    }
  });
});

app.post("/edit-author/:id", (req, res) => {
  let id = req.params.id;
  let authorName = req.body.name;
  let authorSurname = req.body.surname;

  if (
    !validator.isAlphanumeric(authorName, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(authorName, { min: 1, max: 64 })
  ) {
    res.redirect("/list-authors/?m=Enter the name of the author&s=danger");
    return;
  }

  if (
    !validator.isAlphanumeric(authorSurname, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(authorSurname, { min: 1, max: 64 })
  ) {
    res.redirect("/list-authors/?m=Enter the surname of the author&s=danger");
    return;
  }
  db.query(
    `SELECT COUNT(*) kiekis FROM authors WHERE name = '${authorName}' AND id != ${id}`,
    (err, dbresp) => {
      if (!err) {
        if (dbresp[0].kiekis == 0) {
          db.query(
            `UPDATE authors SET name ='${authorName}', surname = '${authorSurname}' WHERE id='${id}'`,
            (err, resp) => {
              if (!err) {
                res.redirect("/list-authors/?m=Information updated&s=success");
              } else {
                res.redirect("/list-authors/?m=Error&s=danger");
              }
            }
          );
        } else {
          res.redirect(
            "/edit-author/" + id + "/?m=This author is already added&s=warning"
          );
        }
      } else {
        res.redirect("/list-authors/?m=Error2&s=danger");
      }
    }
  );
});

//DELETE AUTHOR

app.get("/delete-author/:id", (req, res) => {
  let id = req.params.id;

  db.query(`DELETE FROM authors WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.redirect("/list-authors?m=Author is deleted&s=success");
    } else {
      res.redirect("/list-authors/?m=Author cannot be deleted&s=danger");
    }
  });
});

module.exports = app;
