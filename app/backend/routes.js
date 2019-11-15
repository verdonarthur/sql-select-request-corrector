const express = require("express");
const MSSQLCorrectorController = require("./controller/mssql-corrector.controller");

const mssqlCorrector = express.Router();

let mssqlCorrectorController = new MSSQLCorrectorController();

mssqlCorrector.post("/correct", async (req, res) => {
  try {
    let responseData = await mssqlCorrectorController.correct(
      req.body.tabRqstsCorrection,
      req.body.tabRqstsStudent
    );
    res.json(responseData);
  } catch (e) {
    console.error(e)
    res.json({});
  }
});

mssqlCorrector.post("/sanitizeFile", async (req, res) => {
  let requests = mssqlCorrectorController.sanitizeFileContent(
    req.body.fileContent
  );

  res.json({ requests: requests });
});

module.exports = {
  mssqlCorrector
};
