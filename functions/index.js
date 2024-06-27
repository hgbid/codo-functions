const { onRequest } = require("firebase-functions/v2/https");
const cors = require('cors');
const getCoduckResHandler = require("./getCoduckRes");
const getTaskTranslationHandler = require('./getTaskTranslation');

const corsHandler = cors({ origin: true });

exports.getCoduckRes = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    await getCoduckResHandler.getCoduckRes(req, res);
  });
});

exports.getTaskTranslation = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    await getTaskTranslationHandler.getTaskTranslation(req, res);
  });
});