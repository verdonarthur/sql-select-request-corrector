const express = require("express");
const MSSQLCorrectorController = require("./controller/mssql-corrector.controller");

const mssqlCorrector = express.Router();

let mssqlCorrectorController = new MSSQLCorrectorController()


mssqlCorrector.post("/", async (req, res) => {
  console.log(req.body);

  const data = JSON.parse(req.body);

  let responseData = await mssqlCorrectorController.correct(
    data.studentFileContent,
    data.correctionFileContent
  );

  res.json(responseData);
});

mssqlCorrector.post("/sanitizeFile", async (req, res) => {

  let requests = mssqlCorrectorController.sanitizeFileContent(req.body.fileContent)

  res.json({requests:requests})
});

module.exports = {
  mssqlCorrector
};
