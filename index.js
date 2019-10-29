const express = require('express')
const routes = require('./backend/routes')


const app = express()

app.use('/', express.static('public'))

app.use('api/v1/mssql-corrector', routes.mssqlCorrector)