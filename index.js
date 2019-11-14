const express = require('express')
const bodyParser = require('body-parser');

const routes = require('./app/backend/routes')

const app = express()

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', express.static('public'))

app.use('/api/v1/mssql-corrector', routes.mssqlCorrector)

app.listen('3000', ()=> {
    console.log('app launched')
})
