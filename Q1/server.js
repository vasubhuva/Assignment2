const express = require("express");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"))

const userRouter = require("./Router/UserRouter");
app.use("/user", userRouter);

app.get("/", (req, res) => {
    res.redirect("/form.html")
})

app.listen(8000, (err) => {
    console.log("App is listening on PORT 8000");
});