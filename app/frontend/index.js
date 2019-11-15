global.$ = require("jquery");
import "./sass/main.scss";

/* -------------------------------------- VAR AND CONST DECLARATION */
const URL_API = "//" + window.location.host + "/api/v1";
let tabRqstsCorrection = [];
let tabRqstsStudent = [];

/* -------------------------------------- FUNCTION DECLARATION*/
const jsonPost = async (url, body) => {
  let response = await fetch(url, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json"
    }
  });

  return response.json();
};

const loadFileContent = async (
  inputFileContent,
  divToLoadContent,
  tpmToUse,
  fncCallback
) => {
  let file = inputFileContent.prop("files")[0];

  let fr = new FileReader();

  fr.onload = async () => {
    const data = await jsonPost(
      URL_API + "/mssql-corrector/sanitizeFile",
      JSON.stringify({
        fileContent: fileContent
      })
    );

    if (data.requests) {
      divToLoadContent.text("");
      data.requests.forEach((rqst, i) => {
        let divRqst = tpmToUse.clone();
        $(".title", divRqst).text(`Request : ${i + 1}`);
        $(".request-content", divRqst).text(rqst);

        divToLoadContent.append(divRqst);
      });

      fncCallback(data.req);
      return;
    }
    fncCallback([]);
    return;
  };
  fr.readAsText(file);
};

/* -------------------------------------- ON DOM READY*/
$(() => {
  /* -------------------------------------- DOM VARIABLE ASSIGNATION*/
  const RQST_STUDENT = $("#request-student");
  const RQST_CORRECTION = $("#request-correction");
  const CONTENT_RSLT = $("#correction-result");
  const INPUT_FILE_CORRECTION = $("#input-file-correction");
  const INPUT_FILE_STUDENT = $("#input-file-student");
  const BTN_LAUNCH_CORRECTION = $("#correction-launch");

  /* -------------------------------------- DOM TEMPLATE ASSIGNATION*/
  const TPM_CARD_REQUEST = $(".card-request")
    .remove()
    .clone();

  /* -------------------------------------- DOM EVENT MANAGEMENT*/
  INPUT_FILE_CORRECTION.on("change", async e => {
    loadFileContent(
      INPUT_FILE_CORRECTION,
      RQST_CORRECTION,
      TPM_CARD_REQUEST,
      requests => {
        tabRqstsCorrection = requests;
      }
    );
  });

  INPUT_FILE_STUDENT.on("change", async () => {
    loadFileContent(
      INPUT_FILE_STUDENT,
      RQST_STUDENT,
      TPM_CARD_REQUEST,
      requests => {
        tabRqstsStudent = requests;
      }
    );
  });

  BTN_LAUNCH_CORRECTION.on("click", async () => {
    const data = await jsonPost(
      URL_API + "/mssql-corrector/correct",
      JSON.stringify({
        tabRqstsStudent: tabRqstsStudent,
        tabRqstsCorrection: tabRqstsCorrection
      })
    );

    console.log(data);

    CONTENT_RSLT.text(data);
  });
});
