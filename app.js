const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv");
const { v4: uuid } = require("uuid"); //gen id
const { DATA_FOLDER,DATA_SUBFOLDER, MODEL_SAMPLE_FOLDER} = require('./helpers/constant')
const {getDir,removeDir} = require('./helpers/file')
const authRoutes = require("./routes/users");
const webRoutes = require("./routes/web");
const {responseServerError,ResponseSuccess,responseSuccessWithData, responseSuccess} = require("./helpers/ResponseRequest")
const Joi = require("joi"); //validate
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Database connection Success.");
  })
  .catch((err) => {
    console.error("Mongo Connection Error", err);
  });

const app = express();
const http = require("http");
const Web = require("./src/web/web.model");
const server = http.createServer(app);
// const { Server } = require("socket.io");
// const _io = new Server(server);
var _io = require("socket.io")(server, {
  pingTimeout: 99999999,
  pingInterval: 99999999,
  cors: {
    origin: "*",
  },
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  // socket
  _io.on("connection", (socket) => {
    console.log('socket connected');
    //=======INFER======
    socket.on("start_infer_model", async (data) => {
      const {imgSrcArrPath} = await Web.findOne({ webId: data.webId.webId });
      await _io.emit(`start_infering`, {
        // img_path: imgSrcArrPath[data.index],
        img_path:'./image/sample_det/sample.png' ,
        sid: data.sid
          // response: true
      });
      // console.log(imgSrcArrPath[data.index],data.sid);
    });
    socket.on(`receive_infering_process`, async (data) => {
      const dataRecieve = JSON.parse(data);
      console.log(dataRecieve["response"]);
      await _io.emit(`send_infering_result_${dataRecieve["sid"]}`, dataRecieve["response"]);
     
    });
    //=======infer======
    
  });
  
  app.get("/ping", (req, res) => {
    return res.status(200).send({
      status: true,
      message: "Server is healthy",
    });
  });

  

  app.use("/api/v1/users", authRoutes);
  app.use("/api/v1/web", webRoutes);


  const PORT = process.env.PORT || 8686;
  server.listen(PORT, "0.0.0.0", () => {
    console.log("Server started listening on PORT : " + PORT);
  });
})();
