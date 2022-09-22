const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema({
  projectName: {
    type: String,
    required: true,
  },
  projectSubTitle:{
    type:String,
    required:true
  },
  projectImage: {
    type: String,
    required: true,
  },
  projectCategory: {
    type: String,
    required: true,
  },
  projectLink: {
    type: String,
  },
});

const Project = mongoose.model("Project",projectSchema);

module.exports = Project;
