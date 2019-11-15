const sql = require("mssql");
const Utils = require("../../shared/class/utils.class")
const DB_URL = "mssql://sa:.heig-123@localhost/FabriqueFiltres";

module.exports = class {
  constructor() {}

  /**
   *
   * @param {*} slctRqst
   */
  removeLastOrderBy(slctRqst) {
    if (slctRqst.toUpperCase().lastIndexOf("ORDER") == -1) {
      return slctRqst;
    }

    return slctRqst.substring(0, slctRqst.toUpperCase().lastIndexOf("ORDER"));
  }

  /**
   *
   * @param {*} slctRqst
   */
  removeAllComent(slctRqst) {
    let newSelectRqst = "";
    const NEWLINE_CHAR = slctRqst.includes("\r\n") ? "\r\n" : "\n";

    let tabLine = slctRqst.split(NEWLINE_CHAR);

    tabLine.forEach((line, i) => {
      if (!line.includes("--")) {
        newSelectRqst += line + " ";
      }
    });

    return newSelectRqst;
  }

  /**
   *
   * @param {*} slctRqst
   */
  sanitizeRequest(slctRqst) {
    let sanitizedRqst = this.removeAllComent(slctRqst);
    sanitizedRqst = sanitizedRqst.replace("\t", "");

    return sanitizedRqst;
  }

  /**
   *
   * @param {*} fileContent
   */
  transformFileContentInTabOfRequest(fileContent) {
    let tabRqst = [];
    const tabRqstFileContent = fileContent.split(";");

    tabRqstFileContent.forEach((rqst, i) => {
      if (
        rqst.toUpperCase().indexOf("SELECT") != -1 &&
        i < tabRqstFileContent.length - 2
      ) {
        tabRqst.push(this.sanitizeRequest(rqst));
      }
    });

    return tabRqst;
  }

  async isRequestCorrect(studentRqst, correctRqst) {
    let pool = new sql.ConnectionPool(DB_URL);
    let sqlConnection = await pool.connect();

    try {
      const result = await sqlConnection.request().query(`
              ${this.removeLastOrderBy(correctRqst)}
              \nEXCEPT\n
              ${this.removeLastOrderBy(studentRqst)}
          `);

      return result.recordsets[0].length == 0;
    } catch (err) {
      if (err instanceof sql.RequestError && err.code === "EREQUEST") {
        console.error(err.message);
      }

      return false;
    }
  }

  /**
   *
   * @param {*} tabRqstStudent
   * @param {*} tabRqstCorrection
   */
  async correctTabOfRequests(tabRqstStudent, tabRqstCorrection) {
    let tabResultCorrection = [];
    
    await Utils.asyncForEach(tabRqstCorrection, async (correctedRqst, i) => {
      if (
        tabRqstStudent[i] &&
        (await this.isRequestCorrect(tabRqstStudent[i], correctedRqst))
      ) {
        tabResultCorrection.push(true);
      } else {
        tabResultCorrection.push(false);
      }
    });

    return tabResultCorrection;
  }

};
