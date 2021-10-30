const express = require("express");
const validator = require("validator");
const db = require("../db/connection");
const app = express.Router();

//ADD BOOK

//atvaizduoti add books
app.get("/add-book", (req, res) => {
  db.query(`SELECT id, name, surname FROM authors`, (err, resp) => {
    if (err) {
      res.render("books/add-book", {
        message: "Cannot assign the author",
      });
    } else {
      res.render("books/add-book", {
        authors: resp,
      });
    }
  });
});

app.post("/add-book", (req, res) => {
  let title = req.body.title;
  let pages = req.body.pages;
  let shortDescription = req.body.short_description;
  let author_id = req.body.author_id;

  if (
    !validator.isAlphanumeric(title, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(title, { min: 1, max: 255 })
  ) {
    res.redirect("/list-books/?m=Enter the name of the book&s=danger");
    return;
  }

  if (!validator.isInt(pages)) {
    res.redirect("/list-books/?m=Enter the pages of the book&s=danger");
    return;
  }
  if (
    !validator.isAlphanumeric(shortDescription, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(shortDescription)
  ) {
    res.redirect("/list-books/?m=Enter the description of a book&s=danger");
    return;
  }
  db.query(
    `INSERT INTO books (title, pages, short_description, author_id)
            VALUES ( '${title}', '${pages}', '${shortDescription}', '${author_id}' )`,
    (err) => {
      if (err) {
        res.redirect("/list-books/?m=Error&s=danger");
        return;
      }

      res.redirect("/list-books/?m=Book is added&s=success");
    }
  );
});

//LIST BOOKS

app.get("/list-books", (req, res) => {
  let messages = req.query.m;
  let status = req.query.s;
  let author_id = req.query.author_id;
  let WHERE = author_id ? "WHERE b.author_id = " + author_id : "";

  db.query(`SELECT * FROM authors`, (err, authors) => {
    if (!err) {
      if (author_id) {
        authors.forEach(function (val, index) {
          if (author_id == val["id"]) authors[index]["selected"] = true;
        });
      }

      db.query(
        `SELECT b.id, b.title, 
                b.pages, b.short_description, b.author_id, 
                a.name AS author_name, a.surname AS author_surname FROM books AS b
                LEFT JOIN authors AS a
                ON b.author_id = a.id ${WHERE}`,
        (err, books) => {
          if (!err) {
            res.render("books/list-books", {
              books: books,
              authors,
              messages,
              status,
            });
          } else {
            res.redirect("/list-books/?m=Error&s=danger");
          }
        }
      );
    } else {
      res.redirect("/list-books/?m=Error&s=danger");
    }
  });
});

//EDIT BOOK

app.get("/edit-book/:id", (req, res) => {
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM books WHERE id = ${id}`, (err, book) => {
    if (!err) {
      //Išsitraukiame autoriu sąrašą.
      db.query(`SELECT id, name, surname FROM authors`, (err, authors) => {
        book = book[0];

        //Sutikriname autorius ar kuris nors iš jų buvo priskirtas knygai,
        authors.forEach(function (val, index) {
          //Jeigu einamas autoriaus id atitinka id iš books informacijos, prisikiriame naują indeksą ir reikšmę
          if (book["author_id"] == val["id"]) book[index]["selected"] = true;
        });

        if (err) {
          res.render("books/add-book", {
            edit_book: book,
            messages: "The author is not assigned for this book",
            status: "danger",
          });
        } else {
          res.render("books/edit-book", {
            edit_book: book,
            authors,
            messages,
            status,
          });
        }
      });
    } else {
      res.redirect("/list-books/?m=The author is not found&s=danger");
    }
  });
});

app.post("/edit-book/:id", (req, res) => {
  let id = req.params.id;
  let title = req.body.title;
  let pages = req.body.pages;
  let shortDescription = req.body.short_description;
  let author_id = req.body.author_id;

  if (
    !validator.isAlphanumeric(title, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(title, { min: 1, max: 255 })
  ) {
    res.redirect("/list-books/?m=Enter the name of the book&s=danger");
    return;
  }

  if (!validator.isInt(pages)) {
    res.redirect("/list-books/?m=Enter the pages of the book&s=danger");
    return;
  }
  if (
    !validator.isAlphanumeric(shortDescription, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(shortDescription)
  ) {
    res.redirect("/list-books/?m=Enter the description of a book&s=danger");
    return;
  }

  sql = `UPDATE books SET title = ?, pages = ?, short_description = ?, author_id = ? WHERE id = ?`;
  values = [title, pages, shortDescription, author_id, id];

  db.query(sql, values, (err) => {
    if (err) {
      res.redirect("/list-books/?m=Information updates&s=danger");
      return;
    }

    res.redirect("/list-books/?m=Error&s=success");
  });
});

module.exports = app;
