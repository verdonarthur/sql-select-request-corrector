const express = require('express')
const routes = require('./app/backend/routes')


const app = express()

app.use('/', express.static('public'))

app.use('api/v1/mssql-corrector', routes.mssqlCorrector)

app.listen('3000', ()=> {
    console.log('app launched')
})