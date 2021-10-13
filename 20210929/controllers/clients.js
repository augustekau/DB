const express = require("express");
const validator = require("validator");
const path = require("path");
const fs = require("fs");
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
const db = require("../db/connection");
const app = express.Router();
const per_page = 2;

//atvaizduoti klientu sarasa

// app.get("/list-clients", (req, res) => {
//   let messages = req.query.m;
//   let status = req.query.s;
//   let company_id = req.query.company_id != -1 ? req.query.company_id : "";
//   let order_by = req.query.order_by;
//   let position = req.query.position;
//   let query_a = company_id ? "WHERE c.company_id = " + company_id : "";
//   let query_b =
//     req.query.order_by && req.query.order_by != -1
//       ? "ORDER BY c." + req.query.order_by
//       : "";
//   let query_c = "";

//   if (req.query.position == 1) query_c = "ASC";

//   if (req.query.position == 2) query_c = "DESC";

//   db.query(`SELECT COUNT(*) count FROM customers`, (err, kiekis) => {
//     let customers_count = kiekis[0].count;
//     let page_count = customers_count / per_page;
//     let pager = [];

//     for (let i = 1; i <= page_count; i++) pager.push(i);

//     db.query(`SELECT * FROM companies`, (err, companies) => {
//       if (!err) {
//         if (company_id) {
//           //Sutikriname kompanijas ar kuri nors iš jų buvo priskirta klientui,
//           companies.forEach(function (val, index) {
//             //Jeigu einamas kompanijos id atitinka id iš kliento informacijos, prisikiriame naują indeksą ir reikšmę
//             if (company_id == val["id"]) companies[index]["selected"] = true;
//           });
//         }
//         //kad imoniu pavadinimai, o ne indeksai atsispindetu liste
//         db.query(
//           `SELECT c.id, c.name,
//     c.surname, c.phone, c.email,
//     c.photo, c.company_id,
//     co.name AS company_name FROM customers AS c
//     LEFT JOIN companies AS co
//     ON c.company_id = co.id ${query_a} ${query_b} ${query_c}`,
//           (err, resp) => {
//             if (!err) {
//               //must be same as in db - customers
//               res.render("list-clients", {
//                 customers: resp,
//                 order_by,
//                 position,
//                 companies,
//                 messages,
//                 status,
//                 pager,
//               });
//             } else {
//               res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
//             }
//           }
//         );
//       } else {
//         res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
//       }
//     });
//   });
// });

app.get("/list-clients", (req, res) => {
  //   if (!req.session.auth) {
  //     res.redirect("/");
  //     return;
  //   }

  let messages = req.query.m;
  let status = req.query.s;
  let company_id = req.query.company_id != -1 ? req.query.company_id : "";
  let order_by = req.query.order_by;
  let position = req.query.position;
  let query_a = company_id ? "WHERE c.company_id = " + company_id : "";
  let query_b =
    req.query.order_by && req.query.order_by != -1
      ? "ORDER BY c." + req.query.order_by
      : "";
  let query_c = "";

  if (req.query.position == 1) query_c = "ASC";

  if (req.query.position == 2) query_c = "DESC";

  //if( !company_id.isInteger() || company.id == -1)

  db.query(`SELECT COUNT(*) count FROM customers`, (err, kiekis) => {
    // if (!req.session.auth) {
    //   res.redirect("/");
    //   return;
    // }

    let customers_count = kiekis[0].count;
    let page_count = customers_count / per_page;
    let pager = [];

    for (let i = 1; i <= page_count; i++) pager.push(i);

    db.query(`SELECT * FROM companies`, (err, companies) => {
      if (!err) {
        if (company_id) {
          //Sutikriname kompanijas ar kuri nors iš jų buvo priskirta klientui,
          companies.forEach(function (val, index) {
            //Jeigu einamas kompanijos id atitinka id iš kliento informacijos, prisikiriame naują indeksą ir reikšmę
            if (company_id == val["id"]) companies[index]["selected"] = true;
          });
        }

        db.query(
          `SELECT c.id, c.name, 
                c.surname, c.phone, c.email, 
                c.photo, c.company_id, 
                co.name AS company_name FROM customers AS c
                LEFT JOIN companies AS co
                ON c.company_id = co.id ${query_a} ${query_b} ${query_c}`,
          (err, customers) => {
            if (!err) {
              res.render("list-clients", {
                customers: customers,
                order_by,
                position,
                companies,
                messages,
                status,
                pager,
              });
            } else {
              res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
            }
          }
        );
      } else {
        res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
      }
    });
  });
});

app.get("/list-clients/:page", (req, res) => {
  //   if (!req.session.auth) {
  //     res.redirect("/");
  //     return;
  //   }

  let page = req.params.page;
  let messages = req.query.m;
  let status = req.query.s;
  let company_id = req.query.company_id != -1 ? req.query.company_id : "";
  let order_by = req.query.order_by;
  let position = req.query.position;
  let query_a = company_id ? "WHERE c.company_id = " + company_id : "";
  let query_b =
    req.query.order_by && req.query.order_by != -1
      ? "ORDER BY c." + req.query.order_by
      : "";
  let query_c = "";

  if (req.query.position == 1) query_c = "ASC";

  if (req.query.position == 2) query_c = "DESC";

  //if( !company_id.isInteger() || company.id == -1)

  db.query(`SELECT COUNT(*) count FROM customers`, (err, kiekis) => {
    let customers_count = kiekis[0].count;
    let page_count = customers_count / per_page;
    let limitFrom = page == 1 ? 0 : per_page * (page - 1);
    let limitTo = limitFrom + per_page;
    let pager = [];

    for (let i = 1; i <= page_count; i++) pager.push(i);

    db.query(`SELECT * FROM companies`, (err, companies) => {
      if (!err) {
        if (company_id) {
          //Sutikriname kompanijas ar kuri nors iš jų buvo priskirta klientui,
          companies.forEach(function (val, index) {
            //Jeigu einamas kompanijos id atitinka id iš kliento informacijos, prisikiriame naują indeksą ir reikšmę
            if (company_id == val["id"]) companies[index]["selected"] = true;
          });
        }

        db.query(
          `SELECT c.id, c.name, 
                c.surname, c.phone, c.email, 
                c.photo, c.company_id, 
                co.name AS company_name FROM customers AS c
                LEFT JOIN companies AS co
                ON c.company_id = co.id ${query_a} ${query_b} ${query_c} LIMIT ${limitFrom}, ${limitTo}`,
          (err, customers) => {
            if (!err) {
              res.render("list-clients", {
                customers: customers,
                order_by,
                position,
                companies,
                messages,
                status,
                pager,
              });
            } else {
              res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
            }
          }
        );
      } else {
        res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
      }
    });
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
//first try
// atvaizduoti editinimo langa perkeliant jau suvestus duomenis

// app.get("/edit-client/:id", (req, res) => {
//   let id = req.params.id;
//   db.query(`SELECT * FROM customers WHERE id='${id}'`, (err, resp) => {
//     if (!err) {
//       res.render("edit-client", {
//         edit_client: resp,
//       });
//     }
//   });
// });

app.get("/edit-client/:id", (req, res) => {
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM customers WHERE id = ${id}`, (err, customer) => {
    if (!err) {
      //Išsitraukiame kompaniju sąrašą.
      db.query(`SELECT id, name FROM companies`, (err, companies) => {
        customer = customer[0];

        //Sutikriname kompanijas ar kuri nors iš jų buvo priskirta klientui,
        companies.forEach(function (val, index) {
          //Jeigu einamas kompanijos id atitinka id iš kliento informacijos, prisikiriame naują indeksą ir reikšmę
          if (customer["company_id"] == val["id"])
            companies[index]["selected"] = true;
        });

        // customer[0]['companies'] = companies;

        if (err) {
          res.render("add-client", {
            edit_client: customer,
            messages: "Nepavyko paimti kompanijų iš duomenų bazės.",
            status: "danger",
          });
        } else {
          res.render("edit-client", {
            edit_client: customer,
            companies,
            messages,
            status,
          });
        }
      });
    } else {
      res.redirect("/list-clients/?m=Tokio kliento rasti nepavyko&s=danger");
    }
  });
});

// First try
// issaugoti pakeistus duomenis
// app.post("/edit-client", (req, res) => {
//   let name = req.body.name;
//   let surname = req.body.surname;
//   let phone = req.body.phone;
//   let email = req.body.email;
//   // let photo = !req.files ? "" : req.file.filename;
//   let photo = req.file ? req.file.filename : "";
//   let comment = req.body.comment;
//   let company_id = req.body.company;

//   let id = req.body.id;

//   if (
//     !validator.isAlphanumeric(name, "en-US", {
//       ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
//     }) ||
//     !validator.isLength(name, { min: 3, max: 50 })
//   ) {
//     res.redirect("/list-clients/?m=Įveskite kliento vardą&s=danger");
//     return;
//   }

//   if (
//     !validator.isAlphanumeric(surname, "en-US", {
//       ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ",
//     }) ||
//     !validator.isLength(surname, { min: 3, max: 50 })
//   ) {
//     res.redirect("/list-clients/?m=Įveskite kliento pavarde&s=danger");
//     return;
//   }
//   if (
//     !validator.isEmail(email) ||
//     !validator.isLength(email, { min: 3, max: 64 })
//   ) {
//     res.redirect("/list-clients/?m=Įveskite email adresa&s=danger");
//     return;
//   }
//   if (
//     !validator.isMobilePhone(phone) ||
//     !validator.isLength(phone, { min: 3, max: 100 })
//   ) {
//     res.redirect("/list-clients/?m=Įveskite telefono numeri&s=danger");
//     return;
//   }

//   db.query(
//     `UPDATE customers SET name ='${name}', surname = '${surname}', phone = '${phone}', email= '${email}', photo = '${photo}', comment= '${comment}', company_id = '${company_id}' WHERE id='${id}'`,
//     (err, resp) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.redirect("/list-clients/?m=Irasas sekmingai atnaujintas&s=success");
//       }
//     }
//   );
// });

app.post("/edit-client/:id", upload.single("photo"), (req, res) => {
  let id = req.params.id;
  let name = req.body.name;
  let surname = req.body.surname;
  let phone = req.body.phone;
  let email = req.body.email;
  let photo = req.file ? req.file.filename : ""; //If funkcijos trumpinys, jeigu req.files neegzistuoja, tuomet grąžiname tuščią stringą. Priešingu atveju, grąžiname failo pavadinimą.
  let comment = req.body.comment;
  let company_id = req.body.company;
  let del_photo = req.body.delete_photo;
  let sql = "";
  let values = [];

  if (
    !validator.isAlpha(name, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento vardą&s=danger");
    return;
  }

  if (
    !validator.isAlpha(surname, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento pavardę&s=danger");
    return;
  }

  if (!validator.isMobilePhone(phone, "lt-LT")) {
    res.redirect("/list-clients/?m=Įveskite kliento telefono numerį&s=danger");
    return;
  }

  if (!validator.isEmail(email)) {
    res.redirect("/list-clients/?m=Įveskite kliento el. pašto adresą&s=danger");
    return;
  }

  if (!validator.isInt(company_id)) {
    res.redirect("/list-clients/?m=Pasirinkite kompaniją&s=danger");
    return;
  }

  if (photo || del_photo == 1) {
    sql = `UPDATE customers SET name = ?, surname = ?, phone = ?, email = ?, photo = ?, comment = ?, company_id = ? WHERE id = ?`;
    values = [name, surname, phone, email, photo, comment, company_id, id];
  } else {
    sql = `UPDATE customers SET name = ?, surname = ?, phone = ?, email = ?, comment = ?, company_id = ? WHERE id = ?`;
    values = [name, surname, phone, email, comment, company_id, id];
  }

  db.query(sql, values, (err) => {
    if (err) {
      res.redirect("/list-clients/?m=Nepavyko pridėti kliento&s=danger");
      return;
    }

    res.redirect("/list-clients/?m=Sėkmingai pridėjote klientą&s=success");
  });
});

//DELETE

app.get("/delete-client/:id", (req, res) => {
  let id = req.params.id;
  db.query(`DELETE FROM customers WHERE id='${id}'`, (err, resp) => {
    if (!err) {
      res.redirect("/list-clients?message=Klineto duomenys istrinti&m=danger");
    } else {
      res.redirect("/list-clients/?m=Nepavyko ištrinti įrašo&s=danger");
    }
  });
});

module.exports = app;

//kad istrinti nuotraukas is upload folderio // neveikia

// app.get("/delete-client/:id", (req, res) => {
//   let id = req.params.id;

//   db.query(`SELECT photo FROM customers WHERE id = ${id}`, (err, customer) => {
//     if (!err) {
//       if (customer[0]["photo"]) {
//         fs.unlink(
//           __dirname + "../../uploads/" + customer[0]["photo"],
//           (err) => {
//             if (err) {
//               res.redirect(
//                 "/list-clients/?m=Nepavyko ištrinti nuotraukos&s=danger"
//               );
//             }
//           }
//         );
//       }

//       db.query(`DELETE FROM customers WHERE id = ${id}`, (err, resp) => {
//         if (!err) {
//           res.redirect("/list-clients/?m=Įrašas sėkmingai ištrintas&s=success");
//         } else {
//           res.redirect("/list-clients/?m=Nepavyko ištrinti įrašo&s=danger");
//         }
//       });
//     }
//   });
// });
