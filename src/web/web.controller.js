const Joi = require("joi");
require("dotenv").config();
const { v4: uuid } = require("uuid");
const Web = require("./web.model"); //
const {
  responseServerError,
  responseInValid,
  responseSuccess,
  responseSuccessWithData,
} = require("../../helpers/ResponseRequest");
const path = require("path");
const { WEB_FOLDER } = require("../../helpers/constant");
const { getDir, removeDir, createFile } = require("../../helpers/file");
const { type } = require("os");
const { config } = require("dotenv");
const Crawler = require("crawler");
const fs = require("fs");
const axios = require("axios");

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: "stream",
  }).then(
    (response) =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on("finish", () => resolve())
          .on("error", (e) => reject(e));
      })
  );

const webCreateSchema = Joi.object().keys({
  webName: Joi.string().required(),
  webURL: Joi.string().required(),
});

const webUpdateSchema = Joi.object().keys({
  webId: Joi.string().required(),
  webName: Joi.string().required(),
  webURL: Joi.string().optional(),
});

exports.listWeb = async (req, res) => {
  try {
    let { search, page, limit, from_time, to_time } = req.query;
    let options = {};
    if (search && search !== "") {
      options = {
        ...options,
        $or: [
          { url: new RegExp(search.toString(), "i") },
          { type: new RegExp(search.toString(), "i") },
        ],
      };
    }
    if (from_time && to_time) {
      options = {
        ...options,
        create_At: {
          $gte: new Date(from_time).toISOString(),
          $lt: new Date(to_time).toISOString(),
        },
      };
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const data = await Web.find(options)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
    const total = await Web.find(options).countDocuments();
    return responseSuccessWithData({
      res,
      data: {
        data,
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return responseServerError({ res, err: error.message });
  }
};

exports.createWeb = async (req, res) => {
  try {
    const result = webCreateSchema.validate(req.body);
    if (result.error) {
      return responseServerError({ res, err: result.error.message });
    }
    const { webName, webURL } = req.body;
    const webId = uuid();
    // create folder
    const root = path.resolve("./");
    const webDir = getDir({ dir: root + `/${WEB_FOLDER}/${webId}` });
    //go to URL and dowload images
    let imgSrcArr = []
    let imgSrcArrPath = []
    const c = new Crawler({
      callback: async function (error, res, done) {
        if (error) {
          console.log({ error });
        } else {
          const images = res.$("img");
          images.each((index) => {
            // here you can save the file or save them in an array to download them later
            var url = images[index].attribs.src
            imgSrcArr.push(url)
            var path = `${webDir}/${uuid()}`
            imgSrcArrPath.push(path)
            if(url.includes('https://')) {
                let example_image_1 = download_image(
                    url,
                     path
                );}
              })
              // done create
              const webData = {
                webId,
                webName,
                webURL,
                imagePath: webDir,
                imgSrcArr,
                imgSrcArrPath
              };
              const newWeb = new Web(webData);
              await newWeb.save();
            }
          }}); 
          
          c.queue(webURL)
          return responseSuccessWithData({res,data: webId})
          
  } catch (error) {
    return responseServerError({ res, err: error.message });
  }
};

exports.updateWeb = async (req, res) => {
  try {
    const result = webUpdateSchema.validate(req.body);
    if (result.error) {
      return responseServerError({ res, err: result.error.message });
    }
    const { webId, webName, webURL } = req.body;
    var webItem = await Web.findOneAndUpdate(
      { webId: webId },
      {
        webName,
        webURL,
      }
    );
    if (!webItem) {
      return responseServerError({ res, err: "Web not found" });
    }
    return responseSuccessWithData({ res, data: webItem });
  } catch (error) {
    return responseServerError({ res, err: error.message });
  }
};

exports.readWeb = async (req, res) => {
  try {
    const { webId } = req.query;
    let webItem = await Web.findOne({ webId: webId });
    if (webItem) {
      return responseSuccessWithData({ res, data: webItem });
    } else {
      return responseServerError({ res, err: "Web not found" });
    }
  } catch (error) {
    return responseServerError({ res, err: error.message });
  }
};
exports.readImgWeb = async (req, res) => {
  try {
    const { webId } = req.query;
    let webItem = await Web.findOne({ webId: webId });
    if (webItem) {
      return responseSuccessWithData({ res, data: webItem.imgSrcArr });
    } else {
      return responseServerError({ res, err: "Web not found" });
    }
  } catch (error) {
    return responseServerError({ res, err: error.message });
  }
};

exports.deleteWeb = async (req, res) => {
  try {
    const { webId } = req.query;

    let webItem = await Web.findOne({
      webId: webId,
    });
    if (!webItem) {
      return responseServerError({ res, err: "Web không tồn tại!" });
    }
    await Web.deleteOne({ webId: webId });
    // delete folder
    const root = path.resolve("./");
    const webDir = removeDir({
      dir: root + `/${WEB_FOLDER}/${webId}`,
    });
    // done delete
    return responseSuccess({ res });
  } catch (err) {
    return responseServerError({ res, err: err.message });
  }
};
