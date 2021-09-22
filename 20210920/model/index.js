const mongoose = require("mongoose");
const express = require("express");

mongoose.connect("mongodb://localhost:27017/blogas", (error) => {
  if (!error) {
    console.log("Prisijungimas sekmingas");
  } else {
    console.log("Prisijungimas nepavyko");
  }
});

const irasai = require("./irasai.model");
