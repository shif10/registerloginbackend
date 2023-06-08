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
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    console.log(user);
    if (user) {
      if (password === user.password) {
        res.send({ message: "login successfully", user });
      } else {
        res.send({ message: "password dodnt match" });
      }
    } else {
      res.send({ message: "User not registerd yet" });
    }
  });
});
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const useremail = User.findOne({ email: email });
  // console.log("email is", useremail);
  User.findOne({ email: email })
    .then((user) => {
      console.log("user is", user);
      if (user) {
        return res.status(400).send({
          error: "User Exist",
        });
      } else {
        const user = new User({
          name,
          email,
          password,
        });
        user.save().then(
          (data) => {
            return res.status(200).send({
              data,
              Message: "User is created",
            });
          },
          (err) => {
            console.log(err);
          }
        );
      }
    })
    .catch((error) => {
      console.log("error", error);
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
