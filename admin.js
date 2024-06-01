const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { exec } = require("child_process");

mongoose.connect("mongodb://localhost:27017/weatherBot", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", { chatId: String });

const app = express();
app.use(bodyParser.json());

const adminPassword = "#anysamplepasswordofyourchoice";

// Middleware to check admin password
function checkAdmin(req, res, next) {
  if (req.headers.authorization === `Bearer ${adminPassword}`) {
    next();
  } else {
    res.sendStatus(403);
  }
}

app.use(checkAdmin);

// Routes
app.post("/update-settings", (req, res) => {
  const { token, weatherApiKey } = req.body;
  exec(
    `echo 'const token = "${token}"; const weatherApiKey = "${weatherApiKey}";' > settings.js`,
    (error) => {
      if (error) {
        res.status(500).send("Error updating settings");
      } else {
        res.send("Settings updated");
      }
    }
  );
});

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.delete("/users/:chatId", async (req, res) => {
  await User.findOneAndDelete({ chatId: req.params.chatId });
  res.send("User deleted");
});

app.listen(3000, () => {
  console.log("Admin panel running on port 3000");
});
