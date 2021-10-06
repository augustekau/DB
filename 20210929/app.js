//PROJECT 30.09.2021
const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const path = require("path");
//kad ikelti nuotraukas
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  fileFilter: function (req, file, callback) {
    if (file.mimetype != "image/jpeg" && file.mimetype != "image/png")
      return callback(new Error("Neteisingas nuotraukos formatas"));

    callback(null, true);
  },
  storage: storage,
});
const db = require("./db/connection");
const validator = require("validator");
// const session = require("express-session");
// //issaugos info i cookies kai mes prisijungiame // LOGIN
// app.use(
//   session({
//     secret: "",
//     resave: true,
//     saveUninitialized: true,
//   })
// );

//be sitos eilutes mums nerodo surasyto duomenu i json
app.use(
  express.urlencoded({
    extended: false,
  })
);

//sukuriam template engine/ tai kas yra layout hbs eis per visus routes (1:00 val in paskaita)
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    //taip vadinas hbs failas template foderyje
    defaultLayout: "layout",
    //nuvedam iki layout
    layoutsDir: __dirname + "/views/template",
  })
);
//prieinam prie views failo,
app.set("views", path.join(__dirname, "/views/"));

//nustatom kad hbs engine bus naudojamas - priskiriam ji prie aplikacijos
app.set("view engine", "hbs");

app.use("/uploads", express.static("uploads"));

//ale routeris kuris paduos failus is node moduliu
app.use("/static", express.static("static"));

//bootstrap
app.use(
  "/static/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "static.js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

//kuriam route
app.get("/", (req, res) => {
  //   db.query("SHOW DATABASES", (err, resp) => {
  //     console.log(resp);
  //   });
  res.render("login");
});

app.get("/add-company", (req, res) => {
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

/// REDAGAVIMAS

app.get("/edit-company/:id", (req, res) => {
  let id = req.params.id;
  db.query(`SELECT * FROM companies WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.render("edit-company", {
        edit: resp,
      });
    }
  });
});

app.post("/edit-company", (req, res) => {
  let companyName = req.body.name;
  let companyAddress = req.body.address;
  let id = req.body.id;
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
    `UPDATE companies SET name ='${companyName}', address = '${companyAddress}' WHERE id='${id}'`,
    (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect(
          "/list-companies/?m=Irasas sekmingai atnaujintas&s=success"
        );
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
    }
  });
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

////////////////////////////////////////////////////////////////////////////////////////////
//CLIENTS

///////////////MANO

//atvaizduoti klientu sarasa

app.get("/list-clients", (req, res) => {
  let messages = req.query.m;
  let status = req.query.s;
  db.query(`SELECT * FROM customers`, (err, resp) => {
    if (!err) {
      //must be same as in db - customers
      res.render("list-clients", { customers: resp, messages, status });
    } else {
      res.redirect("/list-clients/?message=Įvyko klaida&s=danger");
    }
  });
});

//atvaizduoti add clients
app.get("/add-client", (req, res) => {
  db.query(`SELECT id, name FROM companies`, (err, resp) => {
    if (err) {
      res.render("add-client", {
        messages: "Nepavyko paimti imones is duomenu bazes",
        status: "danger",
      });
    } else {
      res.render("add-client", { companies: resp });
    }
  });
});

app.post("/add-client", upload.single("photo"), (req, res) => {
  let name = req.body.name;
  let surname = req.body.surname;
  let phone = req.body.phone;
  let email = req.body.email;
  // let photo = !req.files ? "" : req.file.filename;
  let photo = req.file ? req.file.filename : "";
  let comment = req.body.comment;
  let company_id = req.body.company;

  // if (
  //   !validator.isAlphanumeric(name, "en-US", {
  //     ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
  //   }) ||
  //   !validator.isLength(name, { min: 3, max: 50 })
  // ) {
  //   res.redirect("/list-clients/?m=Įveskite kliento vardą&s=danger");
  //   return;
  // }

  // if (
  //   !validator.isAlphanumeric(surname, "en-US", {
  //     ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
  //   }) ||
  //   !validator.isLength(surname, { min: 3, max: 50 })
  // ) {
  //   res.redirect("/list-clients/?m=Įveskite kliento pavarde&s=danger");
  //   return;
  // }
  // if (
  //   !validator.isEmail(email) ||
  //   !validator.isLength(email, { min: 3, max: 64 })
  // ) {
  //   res.redirect("/list-clients/?m=Įveskite email adresa&s=danger");
  //   return;
  // }
  // if (
  //   !validator.isMobilePhone(phone) ||
  //   !validator.isLength(phone, { min: 3, max: 100 })
  // ) {
  //   res.redirect("/list-clients/?m=Įveskite telefono numeri&s=danger");
  //   return;
  // }

  db.query(
    `INSERT INTO customers (name, surname, phone, email, photo, comment, company_id)
            VALUES ( '${name}', '${surname}', '${phone}', '${email}', '${photo}', '${comment}', '${company_id}' )`,
    (err) => {
      if (err) {
        res.redirect("/list-clients/?m=Nepavyko pridėti kliento&s=danger");
        return;
      }

      res.redirect("/list-clients/?m=Sėkmingai pridėjote klientą&s=success");
    }
  );
});

//EDIT CLIENT
// atvaizduoti editinimo langa perkeliant jau suvestus duomenis
app.get("/edit-client/:id", (req, res) => {
  let id = req.params.id;
  db.query(`SELECT * FROM customers WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.render("edit-client", {
        edit_client: resp,
      });
    }
  });
});

// issaugoti pakeistus duomenis

app.post("/edit-client", (req, res) => {
  let name = req.body.name;
  let surname = req.body.surname;
  let phone = req.body.phone;
  let email = req.body.email;
  // let photo = !req.files ? "" : req.file.filename;
  let photo = req.file ? req.file.filename : "";
  let comment = req.body.comment;
  let company_id = req.body.company;

  let id = req.body.id;

  if (
    !validator.isAlphanumeric(name, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento vardą&s=danger");
    return;
  }

  if (
    !validator.isAlphanumeric(surname, "en-US", {
      ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
    }) ||
    !validator.isLength(surname, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento pavarde&s=danger");
    return;
  }
  if (
    !validator.isEmail(email) ||
    !validator.isLength(email, { min: 3, max: 64 })
  ) {
    res.redirect("/list-clients/?m=Įveskite email adresa&s=danger");
    return;
  }
  if (
    !validator.isMobilePhone(phone) ||
    !validator.isLength(phone, { min: 3, max: 100 })
  ) {
    res.redirect("/list-clients/?m=Įveskite telefono numeri&s=danger");
    return;
  }

  db.query(
    `UPDATE customers SET name ='${name}', surname = '${surname}', phone = '${phone}', email= '${email}', photo = '${photo}', comment= '${comment}', company_id = '${company_id}' WHERE id='${id}'`,
    (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/list-clients/?m=Irasas sekmingai atnaujintas&s=success");
      }
    }
  );
});

//DELETE

app.get("/delete-client/:id", (req, res) => {
  let id = req.params.id;
  db.query(`DELETE FROM customers WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.redirect("/list-clients?message=Klineto duomenys istrinti&m=danger");
    }
  });
});

app.listen("3000");

//////////////////////////////////////////////////
//mySQL QUERIES

// const express = require("express");
// const app = express();
// const mysql = require("mysql");

// //prisijungimas pre mysql
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "myblog",
// });

// //prisijungimo paleidimas ir callback'as
// db.connect((err) => {
//   if (err) {
//     console.log("nepavyko");
//     return;
//   }
//   console.log("pavyko");
// });

//sukurti DB
// db.query("CREATE DATABASE myblog", (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

//priskirti DB. priskirti galime ir irasius database (10 eilute siame app.js)
// db.query("USE myblog", (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

// // db.query(`DROP TABLE IF NOT EXISTS`);
// db.query(
//   `CREATE TABLE IF NOT EXISTS irasai(
//     id int(9) NOT NULL AUTO_INCREMENT,
//     pavadinimas varchar(256),
//     turinys text,
//     PRIMARY KEY (id)
//     )AUTO_INCREMENT=1`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );
// db.query(
//   `INSERT INTO irasai (pavadinimas, turinys) VALUES ('Test pavadinimas3 ','Test tekstas3')`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// db.query(
//   `INSERT INTO irasai (pavadinimas, turinys) VALUES ('Test pavadinimas4','Test tekstas4')`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

//DELETE
// db.query(`DELETE FROM irasai WHERE id=2`, (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

//parodyti visus lenteles elementus consolej
// ??????????

// db.query(
//   `SELECT id, pavadinimas, turinys FROM irasai WHERE turinys LIKE '%test%'`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// UPDATE
// db.query(
//   `UPDATE irasai SET pavadinimas='Pakeistas pavadinimas' WHERE id=1`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// db.query(
//   `UPDATE irasai SET id='2', turinys='Pakeistas turinys' WHERE id=3`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// DELETE all entries with id higher than 6
// db.query(`DELETE FROM irasai WHERE id>=4`, (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

//pakeisti ID eiliskuma

// db.query(`ALTER TABLE irasai AUTO_INCREMENT= 2`, (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });
