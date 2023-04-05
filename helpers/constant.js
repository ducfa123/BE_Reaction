const MALICIOUS = 1;
const UNMALICIOUS = 0;
const LAB_FOLDER = "modelDir";  
const DATA_FOLDER = "datasetDir";
const WEB_FOLDER = "webDir";
const MODEL_SAMPLE_FOLDER = "sampleDir";
const LAB_SUBFOLDER = {
    trainLogPath: "log_train",
    testLogPath: "log_test",
    trainedModelPath: "trained_model"
};
const CONFIG_FOLDER = "config";
const FILE_CFG = ".cfg";
const DATA_SUBFOLDER = {
    uploadsFolder : "uploads",
  }
module.exports = {           
    DATA_FOLDER,    WEB_FOLDER,                                                       
    CONFIG_FOLDER,                      
    FILE_CFG,
    MALICIOUS,
    UNMALICIOUS,
    DATA_SUBFOLDER,
    MODEL_SAMPLE_FOLDER,
    LAB_FOLDER,
    LAB_SUBFOLDER
};