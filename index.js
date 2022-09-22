const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const User = require("./models/user.js");
const Profile = require("./models/profile");
const Education = require("./models/education");
const Project = require("./models/project");
const Experience = require("./models/experience");
const Message = require("./models/message");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const checkAuth = require("./middleware/auth");
const Skill = require("./models/skill");

const app = express();
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
const port = 3000;
app.listen(port);
mongoose
  .connect("mongodb://127.0.0.1:27017/testdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log("I am connected"))
  .catch((err) => console.error(err));

const maxAge = 24 * 60 * 60;
function createToken(id) {
  return jwt.sign({ id }, "node-js-secret", { expiresIn: maxAge });
}

app.get("/", async (req, res) => {
  const profile = await Profile.findOne();
  const experience = await Experience.find();
  const educations = await Education.find();
  const personalSkills = await Skill.find({ skillType: "personal" });
  const professionalSkills = await Skill.find({ skillType: "professional" });
  const projects = await Project.find();
  res.render("index", {
    profile,
    experience,
    educations,
    personalSkills,
    professionalSkills,
    projects,
  });
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login_post", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    res.cookie("jwt", token, { maxAge: maxAge * 1000 });
    res.status(201).json({ user });
  } catch (err) {
    console.log(err.message);
    res.status(403).json({ err: err.message });
  }
});
app.post("/signup", async (req, res) => {
  try {
    const user = await User.create({
      email: req.body.email,
      password: req.body.password,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { maxAge: maxAge * 1000 });
    res.status(200).send({ user });
  } catch (err) {
    console.log(err);
    const error = { email: "", password: "" };
    if (err.message.includes("User validation failed")) {
      Object.values(err.errors).forEach((e) => {
        error[e.properties.path] = e.properties.message;
      });
    }
    if (err.code == 11000) {
      error["email"] = "Email is already registered";
    }
    res.status(403).send({ err: error });
  }
});
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });

  res.redirect("/login");
});

app.use(checkAuth);
app.get("/dashboard", async (req, res) => {
  const skills = await Skill.find();
  const educations = await Education.find();
  const projects = await Project.find();
  const messages = await Message.find();
  res.render("dashboard", { skills, educations, projects, messages });
});
app.get("/add/education", (req, res) => {
  res.render("education/addEducation");
});

app.post("/store/education", async (req, res) => {
  const { schoolName, department, dateFrom, dateTo } = req.body;
  try {
    const result = await Education.create({
      schoolName: schoolName,
      department: department,
      dateFrom: dateFrom,
      dateTo: dateTo,
    });
    console.log(result);
    res.redirect("back");
  } catch (e) {
    console.error(e);
  }
});

app.get("/educations", async (req, res) => {
  const educations = await Education.find();

  res.render("education/index", { educations });
});

app.get("/edit/education/:id", async (req, res) => {
  const education = await Education.findById(req.params.id);
  res.render("education/editEducation", { education });
});

app.post("/update/education/:id", (req, res) => {
  Education.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true },
    (err, doc) => {
      if (err) {
        console.error(err);
      } else {
        console.log(doc);
      }
      res.redirect("back");
    }
  );
});

app.get("/delete/education/:id", (req, res) => {
  Education.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      console.error(err);
    } else {
      console.log(doc);
    }
    res.redirect("back");
  });
});

app.get("/add/experience", (req, res) => {
  res.render("experiences/addExperience");
});

app.get("/experiences", async (req, res) => {
  const experiences = await Experience.find();

  res.render("experiences/index", { experiences });
});
app.post("/store/experience", async (req, res) => {
  const { companyName, position, dateFrom, dateTo } = req.body;
  try {
    const result = await Experience.create({
      companyName,
      jobRole: position,
      dateFrom,
      dateTo,
    });
    const experiences = await Experience.find();

    res.render("experiences/index", { experiences });
  } catch (e) {
    console.log(e);
    res.redirect("back");
  }
});

app.get("/edit/experience/:id", async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  res.render("experiences/editExperience", { experience });
});

app.post("/update/experience/:id", async (req, res) => {
  Experience.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
      res.redirect("back");
    }
  );
});

app.get("/delete/experience/:id", (req, res) => {
  Experience.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      console.error(err);
    } else {
      console.log(doc);
    }
    res.redirect("back");
  });
});

app.get("/add/project", (req, res) => {
  res.render("projects/addProject");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage: storage });
app.post("/store/project", upload.single("image"), async (req, res, next) => {
  const { category, title, subTitle, link } = req.body;
  try {
    const result = await Project.create({
      projectCategory: category,
      projectLink: link,
      projectName: title,
      projectSubTitle: subTitle,
      projectImage: "uploads/" + req.file.filename,
    });
    console.log(result);
    res.redirect("back");
  } catch (e) {
    console.log(e);
    res.redirect("back");
  }
});
app.get("/projects", async (req, res) => {
  const projects = await Project.find();
  res.render("projects/index", { projects });
});
app.get("/edit/project/:id", async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.render("projects/editProject", { project });
});

app.post("/update/project/:id", upload.single("image"), async (req, res) => {
  let project = await Project.findById(req.params.id);
  const { category, title, subTitle, link } = req.body;
  if (req.file) {
    project.projectImage = "uploads/" + req.file.filename;
  }
  project.projectName = title;
  project.projectSubTitle = subTitle;
  project.projectCategory = category;
  project.projectLink = link;

  await project.save();

  res.redirect("back");
});

app.get("/delete/project/:id", (req, res) => {
  Project.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      console.error(err);
    } else {
      console.log(doc);
    }
    res.redirect("back");
  });
});

app.get("/skills", (req, res) => {
  Skill.find().then((result) => {
    res.render("skills/index", { skills: result });
  });
});
app.get("/add/skill", (req, res) => {
  res.render("skills/addSkill");
});
app.get("/edit/skill/:id", (req, res) => {
  res.render("skills/editSkill");
});
app.post("/store/skill", (req, res) => {
  const skill = new Skill({
    skillName: req.body.skillName,
    skillAverage: req.body.average,
    skillType: req.body.skillType,
  });

  skill
    .save()
    .then((result) => {
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("back");
    });
});

app.post("/store/message", async (req, res) => {
  try {
    const result = await Message.create({
      fullName: req.body.fullName,
      subject: req.body.subject,
      message: req.body.message,
    });
    console.log(result);
  } catch (err) {
    console.log(err);
  }
  res.redirect("back");
});
