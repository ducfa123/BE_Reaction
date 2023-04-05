const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webSchema = new Schema(
    {
        webId: { type: String, unique: true, required: true },
        webName: { type: String, required: true},
        webURL: { type: String, required: true},
        imagePath: {type: String},
        imgSrcArr: {type: Array, required: true},
        imgSrcArrPath: {type: Array, required: true}
    },
    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
    }
);

const Web = mongoose.model("web", webSchema);
module.exports = Web;