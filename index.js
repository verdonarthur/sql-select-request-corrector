const sql = require('mssql')
const fs = require('fs')

const DB_URL = 'mssql://sa:.heig-123@localhost/FabriqueFiltres'

const removeLastOrderBy = (slctRqst) => {
    if (slctRqst.toUpperCase().lastIndexOf('ORDER') == -1) {
        return slctRqst
    }


    return slctRqst.substring(
        0, slctRqst.toUpperCase().lastIndexOf('ORDER'))
}

const removeAllComent = (slctRqst) => {
    let newSelectRqst = ""
    let tabLine = slctRqst.split('\n')
    tabLine.forEach((line, i) => {

        if (line.indexOf("--") == -1) {
            newSelectRqst += line
        }
    })

    return newSelectRqst
}

const sanitizeRequest = (slctRqst) => {
    return removeLastOrderBy(removeAllComent(slctRqst))
}

/**
 * 
 * @param {*} correctRequest 
 * @param {*} studentRequest 
 * @param {*} sqlConnection 
 */
const isCorrect = async (correctRequest, studentRequest, sqlConnection) => {
    try {
        const result = await sqlConnection.request().query(`
            ${correctRequest}
            \nEXCEPT\n
            ${studentRequest}
        `)

        return result.recordsets[0].length == 0

    } catch (err) {
        if (err instanceof sql.RequestError && err.code === 'EREQUEST') {
            console.log(err.message)
        }

        return false
    }
}

/**
 * src : https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
 * @param {*} array 
 * @param {*} callback 
 */
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

if (process.argv.length < 3) {
    console.error('Expected at least two arguments !');
    process.exit(1);
}

const FILE_CORRECT_REQUESTS = process.argv[2]
const FILE_STUDENT_REQUESTS = process.argv[3]

let contentFileCorrectRequest = fs.readFileSync(FILE_CORRECT_REQUESTS, 'utf8')
let contentFileStudentRequest = fs.readFileSync(FILE_STUDENT_REQUESTS, 'utf8')

let tabsCorrectRequest = []
let tabsStudentRequest = []

contentFileCorrectRequest.split(';').forEach((rqst) => {
    if (rqst.toUpperCase().indexOf('SELECT') != -1)
        tabsCorrectRequest.push(sanitizeRequest(rqst))
})

contentFileStudentRequest.split(';').forEach((rqst) => {
    if (rqst.toUpperCase().indexOf('SELECT') != -1)
        tabsStudentRequest.push(sanitizeRequest(rqst))
})

let pool = new sql.ConnectionPool(DB_URL)

pool.connect().then(async (sqlConnection) => {
    await asyncForEach(tabsCorrectRequest, async (correctRqst, i) => {
        console.log(`\nQuestion ${i + 1} :`)

        let studentRqst = tabsStudentRequest[i];

        if (studentRqst && studentRqst != '' && studentRqst.toUpperCase().indexOf('SELECT') != -1 && correctRqst.toUpperCase().indexOf('SELECT') != -1 && await isCorrect(correctRqst, studentRqst, sqlConnection)) {
            console.log(`[✔]`);
        }
        else {
            console.log(`[X]`);
        }
    })

    console.log("TERMINE")
    pool.close()
}).catch(err => console.error('ERROR CONNECT ', err))

