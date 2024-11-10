const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors());
app.use(express.json());
app.use(require("./routes/index"));
app.use("/Api/v1", require("./routes/index"));

app.use((req, res) => {
  const msg = "page not found";
  res.send(msg, "error", 404, res);
});

app.listen(process.env.PORT ?? 3000, () => {
  // makes it easy to dynamically configure the db \\
  // just create a CLUSTER on atlas cloud, \\
  // pick the URL and add... voila!, you're connected to the DB! \\
  //   appConfig({ type: "db" });
  process.on("warning", (e) => console.warn(e.stack));
  console.log(`app is running ${process.env.PORT ?? 3000}`);
});

module.exports = { app };
