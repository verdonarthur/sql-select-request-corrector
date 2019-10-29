const express = require('express')
const MSSQLCorrectorController = require('./controller/mssql-corrector.controller')


const mssqlCorrector = express.Router()

mssqlCorrector.post('/', (res,req) => {
    
})


module.exports = {
    mssqlCorrector
}