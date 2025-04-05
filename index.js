const express = require("express");
const cors = require("cors");
const dbConnection = require("./DB/dbConnention");
const userRouter = require("./routes/userRouter");
const workerRouter = require("./routes/workerRouter");
const attendanceRouter = require("./routes/attendanceRouter")
const investmentRouter = require("./routes/investmentRouter")
const router = require("./routes/paymentRouter")
const productionRouter = require("./routes/productionRouter");
const partnerRouter = require("./routes/partnerRouter");
const pInvestmentRouter = require("./routes/pinvestmentRouter");
const returnRouter = require("./routes/returnRouter");
const reviewRouter = require("./routes/reviewRouter");
const { getAllReviews } = require("./controllers/reviewController");


require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

dbConnection();

app.use("/api/user", userRouter);
app.use("/api/user", workerRouter);
app.use("/api/user", attendanceRouter);
app.use("/api/user", investmentRouter);
app.use("/api/user", router);
app.use("/api/user", productionRouter);
app.use("/api/user", partnerRouter);
app.use("/api/user", pInvestmentRouter)
app.use("/api/user", returnRouter)
app.use("/api/user", reviewRouter)

app.get("/" ,getAllReviews)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running port number ${PORT}`);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
