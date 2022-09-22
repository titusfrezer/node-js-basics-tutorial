const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const skillSchema = new Schema({
  skillType: {
    type: String,
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  skillAverage: {
    type: Number,
    required: true,
  },
});

const Skill = mongoose.model("Skill",skillSchema);

module.exports = Skill;
