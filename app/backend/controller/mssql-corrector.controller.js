const SqlCorrector = require('../class/sqlcorrector.class')


module.exports = class {
    constructor() {
        this.sqlCorrector = new SqlCorrector()
    }
    
    
    static async correct(correctionFileContent, studentFileContent) {
        return await this.sqlCorrector.correctFile(studentFileContent, correctionFileContent)
    }
}