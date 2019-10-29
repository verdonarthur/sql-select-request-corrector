global.$ = require("jquery")
import './sass/main.scss'

const URL_API = window.location.host + '/api/v1'

const TXTAREA_STUDENT = $("#txtarea-student")
const TXTAREA_CORRECTION = $("#txtarea-correction")
const CONTENT_RSLT = $("#correction-result")


$('correction-launch').click(async () => {
    let studentFileContent = TXTAREA_STUDENT.val()
    let correctionFileContent = TXTAREA_CORRECTION.val()

    const response = await fetch(URL_API + '/mssql-corrector/', {
        method: 'POST',
        body: JSON.stringify({
            studentFileContent,
            correctionFileContent
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()

    CONTENT_RSLT.text(JSON.stringify(data))
})