const { onRequest } = require("firebase-functions/v2/https");
const getCoduckResp = require("./getCoduckResp");

exports.getCoduckResp = getCoduckResp.getCoduckResp;
