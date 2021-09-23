const mongoose = require("mongoose");
const validator = require("validator");

var IrasuSchema = new mongoose.Schema({
  pavadinimas: {
    type: String,
    required: true,
    trim: true,
  },
  turinys: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: Date,
    required: true,
    validate(value) {
      if (!validator.isDate(value)) {
        throw new Error("Neteisingas datos formatas");
      }
    },
  },
});

mongoose.model("irasai", IrasuSchema);
