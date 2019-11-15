const sql = require("mssql");
const DB_URL = "mssql://sa:.heig-123@localhost/FabriqueFiltres";

module.exports = class {
  constructor() {}

  removeLastOrderBy(slctRqst) {
    if (slctRqst.toUpperCase().lastIndexOf("ORDER") == -1) {
      return slctRqst;
    }

    return slctRqst.substring(0, slctRqst.toUpperCase().lastIndexOf("ORDER"));
  }

  removeAllComent(slctRqst) {
    let newSelectRqst = "";
    const NEWLINE_CHAR = slctRqst.includes('\r\n') ? '\r\n' : '\n'

    let tabLine = slctRqst.split(NEWLINE_CHAR);

    tabLine.forEach((line, i) => {
      if (!line.includes("--")) {
        newSelectRqst += line + " ";        
      }
    });

    return newSelectRqst;
  }

  sanitizeRequest(slctRqst) {
    let sanitizedRqst = this.removeAllComent(slctRqst);
    sanitizedRqst = sanitizedRqst.replace('\t','')

    return sanitizedRqst;
  }

  /**
   *
   * @param {*} correctRequest
   * @param {*} studentRequest
   * @param {*} sqlConnection
   */
  async isCorrect(correctRequest, studentRequest, sqlConnection) {
    try {
      const result = await sqlConnection.request().query(`
            ${correctRequest}
            \nEXCEPT\n
            ${studentRequest}
        `);

      return result.recordsets[0].length == 0;
    } catch (err) {
      if (err instanceof sql.RequestError && err.code === "EREQUEST") {
        console.log(err.message);
      }

      return false;
    }
  }

  transformFileContentInTabOfRequest(fileContent) {
    let tabRqst = [];
    const tabRqstFileContent = fileContent.split(";");

    tabRqstFileContent.forEach((rqst, i) => {
      if (rqst.toUpperCase().indexOf("SELECT") != -1 && i < tabRqstFileContent.length - 2) {
        tabRqst.push(this.sanitizeRequest(rqst));
      }
    });

    return tabRqst;
  }

  async correctFile(studentFileContent, correctionFileContent) {
    let result = {};

    let tabsCorrectRequest = transformFileContentInTabOfRequest(
      correctionFileContent
    );
    let tabsStudentRequest = transformFileContentInTabOfRequest(
      studentFileContent
    );

    let pool = new sql.ConnectionPool(DB_URL);

    pool
      .connect()
      .then(async sqlConnection => {
        await asyncForEach(tabsCorrectRequest, async (correctRqst, i) => {
          let studentRqst = tabsStudentRequest[i];

          result[`question-${i + 1}`] = {
            studentRqst: studentRqst,
            correctRqst: correctRqst,
            result: false
          };

          if (await this.isCorrect(correctRqst, studentRqst, sqlConnection)) {
            console.log(`Question ${i + 1} : [✔]`);
            result[`question-${i + 1}`].result = true;
          } else {
            console.log(`Question ${i + 1} : [X]`);
            result[`question-${i + 1}`].result = false;
          }
        });

        pool.close();

        return result;
      })
      .catch(err => {
        console.error("ERROR CONNECT ", err);
        return { error: err };
      });
  }
};
