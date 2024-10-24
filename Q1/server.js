const express = require("express");
const app = express();

const userRouter = require("./Router/UserRouter");
app.use("/user", userRouter);

app.listen(8000, (err) => {
    console.log("App is listening on PORT 8000");
});