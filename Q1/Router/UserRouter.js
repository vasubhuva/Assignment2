const router = require("express").Router();
const user = require("../Models/UserModel");
const multer = require("multer");
const path = require("path");

let configure = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads/"))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + Math.floor(Math.random() * 10000000) + path.extname(file.originalname))
    }
});

let upload = multer({ storage: configure });

let files = upload.fields([
    { name: "profile", maxCount: 1 }
]);

router.post("/register", files, (req, res) => {
    // console.log(req.files.profile[0].filename);
    var User = new user({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        phoneno: req.body.phoneno,
        profilepic: req.files.profile[0].filename
    })

    User.save({})
        .then(() => {
            res.redirect("/display.html");
        })
});

router.get("/data", (req, res) => {
    user.find({})
        .then((users) => {
            res.send(users);
        })
})

router.get("/:name", (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.name);

    res.download(filePath);
});

module.exports = router;