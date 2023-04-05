const express = require("express");
const router = express.Router();
const cleanBody = require("../middlewares/cleanbody");
const webController = require("../src/web/web.controller");

router.get("/", cleanBody, webController.listWeb);
router.post("/create", cleanBody, webController.createWeb);
router.get('/about',cleanBody,webController.readWeb);
router.get("/read", cleanBody, webController.readImgWeb);
router.patch("/update", cleanBody, webController.updateWeb);
router.delete("/delete", cleanBody, webController.deleteWeb);
module.exports = router;
