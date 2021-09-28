
import "./styles.css";
import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import SignatureCanvas from "react-signature-canvas";
import ReactToPdf from "react-to-pdf";
import {
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputBase,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";

import * as db from "firebase/database";
import UsersDataService from "../../services/users.services";
import { BootstrapInput } from "../../component/BootstrapInput";
import * as storage from "firebase/storage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function CovidForm() {
  const pad_zeros = (n) => {
    return n < 10 ? "0" + n : n;
  };
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var d_ate = today.getDate();
  // var currentdate = `${year + "-" + pad_zeros(month) + "-" + d_ate}`;
  const componentRef = useRef({});
  const signatureRef = useRef({});
  const ref = React.createRef();
  const [name, SetName] = useState("");
  const [compnyname, SetCompny] = useState("");
  const [email, SetEmail] = useState("");
  const [reason, SetReason] = useState("Veena Arangradram");
  const [newquestion, SetNewQuestion] = useState("");
  const [radiobtn, SetRadio] = useState(false);
  const [signatureImage, SetSignatureImage] = useState(null);
  // const [date, setDate] = useState(currentdate);
  const [date, setDate] = useState("2021-09-05");
  const [bodyTemp, SetBodyTemp] = useState(0);
  const [question, SetQuestion] = useState([]);
  const [userLength, SetUserLength] = useState(0);
  const [addFormData, SetAddFormData] = useState(null);
  const [allquestionData, SetAllQuestionData] = useState([]);
  const [nameError, SetNameError] = useState(false);
  const [emailError, SetEmailError] = useState(false);
  const [questionError, SetQuestionError] = useState(false);
  const [addquestionError, SetAddQuestionError] = useState(false);
  const [addquestionSuccess, SetAddQuestionSuccess] = useState(false);
  const [formAddedSuccessfully, SetFormAddedSuccessfully] = useState(false);
  const [signatureError, SetSignatureError] = useState(false);
  const [formError, SetFormError] = useState(0);
  const [emailErrorMessage, SetEmailMessageError] = useState("");
  const [addQuestionForm, SetAddQuestionForm] = useState(false);

  const handleNameChange = (event) => {
    SetName(event.target.value);
    if (event.target.value !== "") {
      SetNameError(false);
    }
  };

  const handleCompanyChange = (event) => {
    SetCompny(event.target.value);
  };

  const handleEmailChange = (event) => {
    SetEmail(event.target.value);
    if (event.target.value !== "") {
      SetEmailError(false);
    }
  };

  const handleReasonChange = (event) => {
    SetReason(event.target.value);
  };

  const handleRadio = (event, value, objIndex) => {
    if (event.target.value === "Y") {
      SetQuestionError(false);
      question[0][objIndex].yes = true;
      question[0][objIndex].no = false;
    } else if (event.target.value === "N") {
      SetQuestionError(false);
      question[0][objIndex].no = true;
      question[0][objIndex].yes = false;
    }
    SetQuestion([...question]);
  };

  useEffect(() => {
    console.log("QUESTIONSSS useEffect: " + JSON.stringify(question));
  }, [question]);

  const handleAnyTraveller = (event) => {
    SetRadio(event.target.value);
  };

  const SaveAll = (toPdf) => {
    SetSignatureImage(
      signatureRef.current.getTrimmedCanvas().toDataURL("image/png")
    );
    var validateSave = ValidateForm();
    if (validateSave === true) {
      SetFormError(1);
    } else {
      SetFormError(2);
      toPdf();
    }
  };

  const ValidateForm = () => {
    ResetFormError();
    var answeredQuestions = 0;
    var questionval = question[0];
    for (var i = 0; questionval.length > i; i++) {
      if (questionval[i].yes == true) {
        answeredQuestions += 1;
      } else if (questionval[i].no == true) {
        answeredQuestions += 1;
      }
    }
    var emailRegx =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var error = false;
    if (name == "") {
      SetNameError(true);
      error = true;
    }
    /* if (email == "") {
      SetEmailError(true);
      SetEmailMessageError("Please Enter Email Id.");
      error = true;
    } else if (!emailRegx.test(email.toLowerCase())) {
      SetEmailError(true);
      SetEmailMessageError("Please Enter valid Email Id.");
      error = true;
    } */
    if (answeredQuestions !== question[0].length) {
      SetQuestionError(true);
    }
    if (signatureRef.current.isEmpty()) {
      SetSignatureError(true);
      error = true;
    }
    return error;
  };
  const PrintPage = useReactToPrint({
    content: () => componentRef.current,
  });

  const handlePrint = () => {
    var validate = ValidateForm();
    if (validate === false) {
      PrintPage();
    }
  };

  const getQuestion = (val) => {
    const starCountRef = db.ref(db.getDatabase(), "question/");
    db.onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log("qurse ==> " + JSON.stringify(Object.values(data)));
      if (data != null) {
        SetAllQuestionData([...allquestionData, data]);
        let rendom_question = [];
        let randomindexs = [];
        /*   for (var i = 0; i < 2; i++) {
            let question_r = getRandomItem(data, randomindexs);
            randomindexs.push(question_r[1]);
            rendom_question.push(question_r[0]);
          } */
        var questionData = [];
        for (var i = 0; i < Object.values(data).length; i++) {
          if (Object.keys(data)[i] !== undefined) {
            var dataque = {
              id: Object.values(data)[i]?.id,
              question: Object.values(data)[i]?.que,
              yes: false,
              no: true,
            };
            questionData.push(dataque);
          }
        }
        if (val == 1) {
          SetQuestion((question) => [...question, questionData]);
        } else {
          SetQuestion([questionData]);
        }
      }

    });
    const userCountRef = UsersDataService.getUser();
    db.onValue(userCountRef, (snapshot) => {
      const userdata = snapshot.val();
      if (userdata !== null) {
        SetUserLength(Object.keys(userdata).length);
      } else {
        SetUserLength(0);
      }
    });
  };

  const getRandomIndex = (min, max, except) => {
    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    if (except != null && except != undefined) {
      return [except].includes(randomIndex)
        ? getRandomIndex(min, max, except)
        : randomIndex;
    } else {
      return randomIndex;
    }
  };

  const getRandomItem = (arr, indexes) => {
    var keys = [];
    if (arr !== null) {
      var max = Object.keys(arr).length;
      var randomIndex = getRandomIndex(1, max);
      var item = null;
      var response = [];
      if (indexes.length > 0) {
        var isExists = indexes.includes(randomIndex);
        if (isExists === true) {
          randomIndex = getRandomIndex(1, max, randomIndex);
        }
      }
      console.log("randomIndex ,,, ", randomIndex);
      keys = Object.keys(arr)[randomIndex].toString();
      console.log("key ,,, ", keys);
      item = arr[keys];
      var response = [item, randomIndex];
      return response;
    }

  };

  const ResetFormError = () => {
    SetNameError(false);
    SetEmailError(false);
    SetQuestionError(false);
    SetSignatureError(false);
    SetEmailMessageError("");
  };

  const ResetForm = () => {
    SetQuestion([]);
    SetName("");
    SetBodyTemp("");
    SetCompny("");
    SetReason("");
    SetEmail("");
    SetFormAddedSuccessfully(false);
    signatureRef.current.clear();
    getQuestion(2);
  };

  const getUser = () =>{
    console.log("getUser")
    const getUserRef = UsersDataService.getUser();
    const WholeDataArray = []
    db.onValue(getUserRef, (snapshot) => {
      const userdata = snapshot.val();
      const getAnswerRef = UsersDataService.getAnswer();
      db.onValue(getAnswerRef, (snapshot) => {
        const answer = snapshot.val();
        console.log(" ", answer)
        for(let i=0; i<Object.keys(userdata).length; i++){
          for(let j=i; j<Object.keys(answer).length; j++){
            if(Object.values(userdata)[i].id === Object.values(answer)[j].user_id && Object.values(userdata)[i].Name !== "" ){
                let data = {
                  name:Object.values(userdata)[i].Name,
                  company:Object.values(userdata)[i].Company,
                  date:Object.values(userdata)[i].Date,
                  email:Object.values(userdata)[i].Email,
                  signu:Object.values(userdata)[i].signu,
                  qus_1:Object.values(answer)[j].Answer[0].question,
                  ans_1:Object.values(answer)[j].Answer[0].ans,
                  qus_2:Object.values(answer)[j].Answer[1].question,
                  ans_2:Object.values(answer)[j].Answer[1].ans,
                  qus_3:Object.values(answer)[j].Answer[2].question,
                  ans_3:Object.values(answer)[j].Answer[2].ans,
                }
                WholeDataArray.push(data);
            }
          }
        }
      }) 
      SetAddFormData(WholeDataArray)
    });
    //console.log("Data ===> "+JSON.stringify(WholeDataArray))
    
  }

  useEffect(() => {
    getUser();
    if (question.length < 1) {
      getQuestion(1);
    }

    let formData = {
      id: userLength + 1,
      Name: name,
      Company: compnyname,
      Email: email,
      Date: date,
      BodyTemp: `${bodyTemp}°F`,
      Reason: reason,
      //QuestionsAns: question,
      //travel: radiobtn,
      signu: signatureImage,
    };

    let ansData = [];
    for (var i = 0; i < question[0]?.length; i++) {
      if (question[0][i].yes === true) {
        let ques = {
          question: question[0][i].question,
          ans: "Yes",
        };
        ansData.push(ques);
      } else if (question[0][i].no === true) {
        let ques = {
          question: question[0][i].question,
          ans: "No",
        };
        ansData.push(ques);
      }
    }
    //console.log("ansData> ==", JSON.stringify(ansData));
    let answ = {
      user_id: userLength + 1,
      user_name: name,
      Answer: ansData,
    };
    //console.log("ansData ==", answ)
    if (formError === 2) {
      ResetFormError();
      UsersDataService.create(formData);
      UsersDataService.createAsnwer(answ)
      //SetAddFormData([...addFormData, formData]);

      // sendEmail()

      // SetQuestion([]);
      SetFormAddedSuccessfully(true);
      setTimeout(() => {
        // SetQuestion([]);
        ResetForm();
      }, 2000);
    }
  }, [signatureImage]);

  useEffect(() => {
    localStorage.setItem("state==>", JSON.stringify(addFormData));
  }, [addFormData]);
  useEffect(() => { console.log(":question:" + JSON.stringify(addFormData)) }, [question,addFormData]);
  useEffect(() => { }, [date]);
  useEffect(() => { }, [userLength]);
  const handleDate = (event) => {
    setDate(event.target.value);
  };

  const handleBodyTempChange = (event) => {
    SetBodyTemp(event.target.value);
  };
  const getStateFromLocalStorage = () => {
    let data = localStorage.getItem("state");
    if (data !== undefined) {
      this.setState(JSON.parse(data));
    }
  };
  const uploadImageAsync = async (uri) => {
    /* const ref = firebase
      .storage()
      .ref()
      .child(uuid.v4()); */

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    var mimeString = uri
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];
    console.log('mimeString:- ', mimeString);
    console.log('blob:- ', blob);
    //const snapshot = await ref.put(blob, { contentType: mimeString });

    //let url = await snapshot.ref.getDownloadURL();

    //return url;
  }
  var canvasToImage = function (canvas: any) {
    var img = new Image();
    var dataURL = canvas.toDataURL('image/png', 0.92);
    img.src = dataURL;
    return img;
  };
  var canvasShiftImage = function (oldCanvas: any, shiftAmt: any) {
    shiftAmt = parseInt(shiftAmt) || 0;
    if (!shiftAmt) { return oldCanvas; }

    var newCanvas = document.createElement('canvas');
    newCanvas.height = oldCanvas.height - shiftAmt;
    newCanvas.width = oldCanvas.width;
    var ctx = newCanvas.getContext('2d');
    ctx['imageSmoothingEnabled'] = false; /* standard */
    ctx['mozImageSmoothingEnabled'] = false; // Firefox 
    ctx['oImageSmoothingEnabled'] = false; // Opera /
    ctx['webkitImageSmoothingEnabled'] = false; // Safari /
    ctx['msImageSmoothingEnabled'] = false; // IE */
    //ctx.fillStyle = "#";
    var img = canvasToImage(oldCanvas);
    ctx.drawImage(img, 0, shiftAmt, img.width, img.height, 0, 0, img.width, img.height);
    console.log("new canvcas ===> " + JSON.stringify(newCanvas));
    return newCanvas;
  };
  const sendEmail = () => {
    const input = document.getElementById('divToPrint');
    var A4_width = 595; //pixels
    var A4_height = 842; //pixels
    var ratio = 2; // scale for higher image's dpi
    input.width = A4_width * ratio;
    input.height = A4_height * ratio;

    /*  var pdf_i = new jsPDF('l','px')
         ///source = $('main')[0];
     
         pdf_i.addHTML(document.querySelector('#divToPrint'), 0, 0, {
               pagesplit: true
           },
           function(dispose){
             pdf_i.save('test.pdf');
           }
       ); */
    //oldContext.drawImage(oldImg, 0, 0, A4_width, A4_height);
    html2canvas(input)
      .then((canvas) => {
        const height_ = document.getElementById('divToPrint').clientHeight;
        const width_ = document.getElementById('divToPrint').clientWidth;
        /*  const imgData = canvas.toDataURL('image/png',0.92);
         console.log("image data: " + imgData)
         const pdf = new jsPDF({unit: 'px'}); */
        /*  var pdfInternals = pdf.internal
          var pdfPageSize = pdfInternals.pageSize
          var pdfScaleFactor = pdfInternals.scaleFactor
          var pdfPageWidth = pdfPageSize.width
          var pdfPageHeight = pdfPageSize.height
          var totalPdfHeight = 0
          var htmlPageHeight = canvas.height
          var htmlScaleFactor = canvas.width / (pdfPageWidth * pdfScaleFactor)
          var safetyNet = 0;
              while (totalPdfHeight < htmlPageHeight && safetyNet < 15) {
                  var newCanvas = canvasShiftImage(canvas, totalPdfHeight);
                  pdf.addImage(newCanvas, 'PNG', 0, 16);
  
                  totalPdfHeight += (pdfPageHeight * pdfScaleFactor * htmlScaleFactor);
  
                  if (totalPdfHeight < (htmlPageHeight)) {
                      pdf.addPage();
                  }
                  safetyNet++;
              } */
        //pdf.addImage(imgData, 'PNG', 0, 20);
        console.log("window height ===> " + height_)
        console.log("window width ===> " + width_)
        var pdf = null
        // if(width>1023){
        //   pdf = new jsPDF("l", "mm", "a4");   //orientation: landscape
        // }else{
        // }
        pdf = new jsPDF("p", "mm", "a4");   //orientation: landscape
        var imgData = canvas.toDataURL('image/png');
        var width = pdf.internal.pageSize.getWidth();
        var height = pdf.internal.pageSize.getHeight();
        console.log("window in width ==> " + width)
        console.log("window in height ==> " + height)
        pdf.text(`Registration No. ${userLength + 1}`, 4, 10);
        pdf.addImage(imgData, 'PNG', 0, 12, width, height);
        //pdf.save('download.pdf');
        pdf.save(`${name}_${userLength + 1}_Covid.pdf`);
      })
      ;
  }

  const handleAddQuestionFrom = () => {
    if (addQuestionForm === false) {
      SetAddQuestionForm(true);
    } else {
      SetAddQuestionForm(false);
    }
    SetAddQuestionError(false);
    SetAddQuestionSuccess(false);
  };

  const handleNewquestionChange = (event) => {
    SetAddQuestionError(false);
    SetAddQuestionSuccess(false);
    SetNewQuestion(event.target.value);
  };

  const AddNewQuestionToDb = () => {
    if (newquestion === "") {
      SetAddQuestionError(true);
    } else {
      SetAddQuestionError(false);
      var id = allquestionData.length !== 0 ? Object.keys(allquestionData[0]).length + 1 : 1;
      var option = {
        A: "YES",
        B: "NO",
      };
      var question = {
        id: id,
        option,
        que: newquestion,
      };
      db.push(db.ref(db.getDatabase(), "question/"), question);
      SetAddQuestionSuccess(true);
    }
  };

  return (
    <div className="App">
      <div className="App" ref={componentRef}>
        <div className="App" id="divToPrint" ref={ref}>
          <Grid container spacing={2} className="containersmall">
            <Grid item xs={12} sm={2}>
              <b>Name: </b>
              <b className={"requiredSign"}>*</b>
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                type="text"
                value={name}
                placeholder="Enter Name"
                name="name"
                id="name"
                onChange={handleNameChange}
              />
            </Grid>
            {nameError == true && (
              <Grid item xs={12} sm={2}>
                <b className={"requiredSign"}>Please Enter Name.</b>
              </Grid>
            )}
          </Grid>
          <Grid container spacing={2} className="containersmall">
            <Grid item xs={12} sm={2}>
              <b>Company: </b>
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                type="text"
                value={compnyname}
                placeholder="Enter Company Name"
                name="company"
                id="company"
                onChange={handleCompanyChange}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} className="containersmall">
            <Grid item xs={12} sm={2}>
              <b>Email: </b>
              {/*  <b className={"requiredSign"}>*</b> */}
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                type="text"
                value={email}
                placeholder="Enter Email / Telphone Number"
                name="email"
                id="email"
                onChange={handleEmailChange}
              />
            </Grid>
            {emailError && (
              <Grid item xs={12} sm={2}>
                <b className={"requiredSign"}>{emailErrorMessage}</b>
              </Grid>
            )}
          </Grid>
          <Grid container spacing={2} className="containersmall">
            <Grid item xs={12} sm={2}>
              <b>Date : </b>
            </Grid>
            <Grid item xs={12} sm={10}>
              <TextField
                id="date"
                style={{ width: "75%", padding: 15, background: "#f1f1f1" }}
                type="date"
                defaultValue={date}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleDate}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} className="containersmall">
            <Grid item xs={12} sm={2}>
              <b>Reason : </b>
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                type="text"
                value={reason}
                placeholder="Enter Reason "
                name="reason"
                id="reason"
                onChange={handleReasonChange}
              />
            </Grid>
          </Grid>
          {/* <Grid container spacing={2} className="containersmall">
            <Grid item xs={12} sm={2}>
              <b>Body Temperature: (°F) </b>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Select
                labelId="demo-customized-select-label"
                id="demo-customized-select"
                value={bodyTemp}
                onChange={handleBodyTempChange}
                input={<BootstrapInput />}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"95"}>95°F Or Below</MenuItem>
                <MenuItem value={"95-96"}>95.1°F to 96.9°F</MenuItem>
                <MenuItem value={"97-98"}>97°F to 98.6°F </MenuItem>
                <MenuItem value={"98-100"}>98.6°F to 100.4 °F</MenuItem>
                <MenuItem value={"100-103"}>100.4°F to 103°F </MenuItem>
                <MenuItem value={"103"}>103 °F or above</MenuItem>
              </Select>
            </Grid>
          </Grid> */}
          <div className={"addQuestionContainer"}>
            <Grid container sm={12} md={12} className="containersmall">
              <Grid
                sm={12}
                md={2}
                container
                style={{ marginLeft: "", marginTop: 0, marginBlock: 0 }}
              >
                {/* <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  onClick={handleAddQuestionFrom}
                >
                  Add New Question
                </Button> */}
              </Grid>
              {addQuestionForm && (
                <Grid container spacing={2} className="containersmall">
                  <Grid
                    item
                    xs={12}
                    sm={2}
                    style={{ justifyContent: "center" }}
                  >
                    <b>Question : </b>
                    <b className={"requiredSign"}>*</b>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <input
                      type="text"
                      value={newquestion}
                      placeholder="Enter Question "
                      name="reason"
                      id="reason"
                      onChange={handleNewquestionChange}
                    />
                  </Grid>
                  {addquestionError == true && (
                    <Grid item xs={12} sm={2}>
                      <b className={"requiredSign"}>Please Enter Question.</b>
                    </Grid>
                  )}
                  {addquestionSuccess == true && (
                    <Grid item xs={12} sm={2}>
                      <b className={"successSign"}>
                        Question Added Successfully.
                      </b>
                    </Grid>
                  )}
                  <Grid
                    sm={12}
                    md={2}
                    style={{ marginTop: 10, marginBlock: 10 }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      type="submit"
                      onClick={AddNewQuestionToDb}
                    >
                      Add Question
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </div>
          <div className="questionMainContainer">
            <Grid xs={12} spacing={2}>
              <b className={"heading"}>Please Give Blelow Question Answer.</b>
              <b className={"requiredSign"}>*</b>
            </Grid>

            {question[0]?.map((item, index) => {
              return (
                <Grid
                  container
                  spacing={2}
                  style={{ paddingBlock: 5, paddingLeft: 5 }}
                  className="questionContainer"
                >
                  <Grid item xs={12} sm={12}>
                    <b>
                      ({index + 1}) {item.question}
                    </b>
                  </Grid>
                  <Grid container item xs={12} sm={12}>
                    <Grid
                      className={"answerContainer"}
                      item
                      xs={5}
                      sm={2}
                      style={{ marginLeft: 11 }}
                    >
                      <input
                        id={item.id}
                        type="radio"
                        value="Y"
                        style={{ padding: 2 }}
                        checked={item.yes}
                        onChange={(event) => handleRadio(event, item, index)}
                      />{" "}
                      Yes
                    </Grid>
                    <Grid className={"answerContainer"} item xs={5} sm={5}>
                      <input
                        id={item.id}
                        type="radio"
                        value="N"
                        checked={item.no}
                        onChange={(event) => handleRadio(event, item, index)}
                      />{" "}
                      No
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
            {questionError && (
              <Grid item xs={12} sm={2}>
                <b className={"requiredSign"}>
                  Please provide all questions answer.
                  {/* {questionError} */}
                </b>
              </Grid>
            )}
          </div>

          <Grid container spacing={0} className="signContainer">
            <Grid xs={2} sm={2} className="signText">
              <lable>Signature : </lable>
              <b className={"requiredSign"}> * </b>
              {signatureError && (
                <Grid className="signText">
                  <b className={"requiredSign"}>Please provide signature.</b>
                </Grid>
              )}
            </Grid>
            {/* <Grid xs={2} sm={2}> */}
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 200, height: 70, className: "sigCanvas" }}
              ref={signatureRef}
            />
            {/* </Grid> */}
          </Grid>
        </div>
      </div>

      <Grid container spacing={2} className="btnContainer">
        {formAddedSuccessfully == true && (
          <Grid item xs={12} sm={2}>
            <b className={"successSign"}>Question Added Successfully.</b>
          </Grid>
        )}
        <ReactToPdf targetRef={ref} filename={`${name}_${userLength + 1}_Covid.pdf`} no={userLength + 1}>
          {({ toPdf, }) => (
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              onClick={() => SaveAll(toPdf)}
            >
              Save and Download
            </Button>)
          }</ReactToPdf>

        <Button
          variant="contained"
          color="secondary"
          type="submit"
          onClick={ResetForm}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          onClick={handlePrint}
        >
          Print
        </Button>
      </Grid>
      <div className="SheetContiner">
        {addFormData?.map((item, index) => {
          return (
            <Grid container spacing={2} className="sheetItemContainer">
              <Grid item xs={6} sm={2}>
                {index + 1}
              </Grid>
              <Grid item xs={6} sm={2}>
                {item.name}
              </Grid>
              <Grid item xs={6} sm={1}>
                {item.company}
              </Grid>
              <Grid item xs={6} sm={3}>
                {item.email}
              </Grid>
              <Grid item xs={6} sm={2}>
                {item.date}
              </Grid>
              {/* <Grid item xs={6} sm={1}>
                {item.BodyTemp}
              </Grid> */}
              <Grid item xs={6} sm={1}>
                <img className="imagStyle" src={item.signu} />
              </Grid>
            </Grid>
          );
        })}
      </div>

      {/*      {({ toPdf, }) => <button onClick={toPdf}>Generate pdf</button>}
      </ReactToPdf> */}
    </div>
  );
}

export default CovidForm;
