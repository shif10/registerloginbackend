import express, { urlencoded } from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const con = mongoose.connect(`mongodb://0.0.0.0:27017/myloginregdb`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get("/", (req, res) => {
  res.send("my api");
  console.log("be started Api");
});

app.post("/login", (req, res) => {
  res.send("login");
});
app.post("/register", (req, res) => {
  res.send("register");

  const { name, email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ message: "user already registered" });

      console.log("already");
    } else {
      const user = new User({
        name,
        email,
        password,
      });
      user.save().then(
        (res) => {
          console.log("response is", res);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  });

  //   user.save((err) => {
  //     if (err) {
  //       res.send(err);
  //       console.log(err);
  //     } else {
  //       res.send({ message: "success" });
  //       console.log("successs");
  //     }
  //   });
});
console.log(con);
if (con) {
  console.log("started connected", con);
}

const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

app.listen(9003, () => {
  console.log("started 9003");
});
