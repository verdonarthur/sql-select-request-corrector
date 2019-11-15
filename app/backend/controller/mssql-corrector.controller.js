const SqlCorrector = require('../class/sqlcorrector.class')


module.exports = class {
    constructor() {
        this.sqlCorrector = new SqlCorrector()
    }
    
    
    async correct(correctionFileContent, studentFileContent) {
        return await this.sqlCorrector.correctFile(studentFileContent, correctionFileContent)
    }

    sanitizeFileContent(fileContent) {
        return this.sqlCorrector.transformFileContentInTabOfRequest(fileContent)        
    }
}