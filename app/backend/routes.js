const express = require('express')
const MSSQLCorrectorController = require('./controller/mssql-corrector.controller')


const mssqlCorrector = express.Router()

mssqlCorrector.post('/', async (res, req) => {
    console.log(req.body)
    
    //let data = JSON.parse(req.body)

    let responseData = await MSSQLCorrectorController.correct(data.studentFileContent,
        data.correctionFileContent)

    res.json(responseData)
})


module.exports = {
    mssqlCorrector
}