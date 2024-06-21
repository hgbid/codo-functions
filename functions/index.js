const { onRequest } = require("firebase-functions/v2/https");
const cors = require('cors');
const getCoduckRespHandler = require("./getCoduckResp");

const corsHandler = cors({ origin: true });

exports.getCoduckResp = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    await getCoduckRespHandler.getCoduckResp(req, res);
  });
});
