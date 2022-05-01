/////////////////////// COMMON TO SCRIPTS ///////////////////////////

var formId ='1R78psIiBuPW6e3R0f8x5fGVIDB5sDcI48vMyePSF6X0';

var form = FormApp.openById(formId);

var formTitle = form.getTitle();
console.log(formTitle);

// Creates a spreadsheet with the given name of the form inside a specific folder.
function createSpreadSheetInFolder(ss_new_name, folder_dest_id) {
  var haBDs  = DriveApp.getFilesByName(ss_new_name);
  if(haBDs.hasNext()){
    var ss_new_id = haBDs.next().getId();
  }
  else{
    var ss_new = SpreadsheetApp.create(ss_new_name);
    var ss_new_id = ss_new.getId();
  }
  var newfile = DriveApp.getFileById(ss_new_id);
  newfile.moveTo(DriveApp.getFolderById(folder_dest_id))
  return ss_new_id;
}

// Creates a spreadsheet with the name of the form inside a specific folder.
var spreadsheetName = formTitle + " - Questions and Responses - " + formId;
var folderId = '1-mOIH668WwtUbXFiqbGTUJnVnYdgEphc';
var newSpreadsheetId = createSpreadSheetInFolder(spreadsheetName, folderId)
var newSpreadsheet = SpreadsheetApp.openById(newSpreadsheetId);

// The array of the alphabet, to be used to name possible answers in a MCQ item.
var alphaArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
/////////////////////////////////////////////////////////////////////////////////


// Creates a new sheet named Questions in the spreadsheet.
var sheet = newSpreadsheet.getSheetByName("Responses");
if (sheet != null) {
  sheet.clear();
}
else {
  sheet = newSpreadsheet.insertSheet("Responses");
}

// Deletes the original sheet "Sheet1"
sheet1 = newSpreadsheet.getSheetByName("Sheet1")
if (sheet1 != null) {
  newSpreadsheet.deleteSheet(sheet1);
}

function extractMCQResponsesArray() {
  var responsesArray = [];

  //Gets all the MCQ items of the form.
  var formItems = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE); // ();

  // Logs all the responses to each question in the form.
  var formResponses = form.getResponses();

  if (formResponses.lenght == 0) {
    console.log("Missing Responses.");
  }

  // Iterates over the different test takers i
  // and produces an array with each element the array of the responses of each test taker.
  for (var i = 0; i < formResponses.length; i++) {
    var responseArray = [];

    var formResponse = formResponses[i];
    var itemResponses = formResponse.getItemResponses();

    // Iterates over the items j in order to find the response to that item
    // and produces the array with all the responses of the test taker i.
    var foundItemResponseNumber = 0;
    for (var j = 0; j < formItems.length; j++) {

      item = formItems[j];

      var foundItem = false;

      // Finds the response for that given item j from the test taker i.
      for (var k = foundItemResponseNumber+1; k < itemResponses.length; k++) {
        // console.log(j + "; " + k);
        var itemResponse = itemResponses[k];
        var itemFromResponse = itemResponse.getItem();

        if (itemFromResponse.getId() == item.getId()) {
          var question = itemFromResponse.asMultipleChoiceItem();
          var choices = question.getChoices();

          var l = 0;
          var answer;

          var foundAnswer = false;
          // gets the possible answers
          for (l; l < choices.length; l++){
            if (itemResponse.getResponse().replace(/\s{2,}/g, ' ') == choices[l].getValue().replace(/\s{2,}/g, ' ')) {
              answer = alphaArray[l];
              responseArray[j] = answer;
              // newSpreadsheet.getRange(i + 1, j+1).setValue(k+1);

              foundAnswer = true;
              break;
            }
          }
          if (foundAnswer == false){
            console.log("test taker "+ i +", question "+ j + ": MISSING ANSWER");
            console.log("\t" + itemResponse.getResponse() );
            console.log("\t" + choices[3].getValue() );
          }

          foundItemResponseNumber = k;
          foundItem = true;
          break;
        }

      }

      // If the answer is missing, it is assigned an empty answer "-"
      if (foundItem == false){
        answer = "-";
        responseArray[j] = answer;
      }

      sheet.getRange(i+1, j+1).setValue(responseArray[j]);
      // console.log("test taker " + i + ", question " + j + ": FOUND ANSWER " + responseArray[j] );

    }

    // console.log(responseArray);

    responsesArray[i] = responseArray;

  }

  // console.log(responsesArray);

  // Saves the Array of the responses to a csv file.
  CSVText = arrayMatrixToCSVText(responsesArray, "\t");
  CSVFileName = formTitle + " - Responses - " + formId + ".csv";
  // Deletes previos file with same name
  var previousCSVFile  = DriveApp.getFilesByName(CSVFileName);
  if(previousCSVFile.hasNext()){
    previousCSVFile.next().setTrashed(true);
  }
  CSVFile = DriveApp.createFile(CSVFileName, CSVText);
  CSVFile.moveTo(DriveApp.getFolderById(folderId));

  // console.log(CSVText);

  return responsesArray;


  // sheet.autoResizeColumns(1,formItems.length);


}



function arrayMatrixToCSVText(array, separator) { // array
  //array =[["A", "B", "C"], ["C","D"]];
  //separator = "\t"; // ",";

  text ="";
  for (var i = 0; i < array.length; i++) {
    text = text + array[i][0]
    for (var j = 1; j < array[i].length; j++) {
      element = array[i][j];
      text =  text + separator + element;
    }
    text = text + "\n";
  }

  return text;
  console.log(text);
}
