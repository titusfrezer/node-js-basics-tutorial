const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const educationSchema = new Schema(
    {
        schoolName: {
          type: String,
          required: true,
        },
        department: {
          type: String,
          required: true,
        },
        dateFrom: {
          type: Date,
          required: true,
        },
        dateTo: {
          type: Date,
          required: true,
        },
      },
      { timestamps: true }
    );

    const Education = mongoose.model("Education",educationSchema);

    module.exports = Education;