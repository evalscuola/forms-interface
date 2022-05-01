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
var sheet = newSpreadsheet.getSheetByName("Questions");
if (sheet != null) {
  sheet.clear();
}
else {
  sheet = newSpreadsheet.insertSheet("Questions");
}

// Deletes the original sheet "Sheet1"
sheet1 = newSpreadsheet.getSheetByName("Sheet1")
if (sheet1 != null) {
  newSpreadsheet.deleteSheet(sheet1);
}



// Extracts an array of questions, answers, and keys for Multiple Choice Questions from the form.
function extractMCQArray() {
  var questionsArray = [];

  //Gets all the MCQ items of the form.
  var formItems = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE);

  var i = 0;
  for (i; i < formItems.length; i++){
    var questionArray = [];
    item = formItems[i];

    // changes the type from Item to MultipleChoiceItem
    var question = item.asMultipleChoiceItem();

    questionNumber = i + 1;
    sheet.getRange(i+1, 1).setValue(questionNumber);
    sheet.getRange(i+1, 2).setValue(question.getIndex());
    sheet.getRange(i+1, 3).setValue(question.getId());
    sheet.getRange(i+1, 4).setValue(question.getTitle());


    questionArray.push(questionNumber, question.getIndex(), question.getId(), question.getTitle(), "");

    // console.log(questionNumber + ": " + "Question " + question.getIndex() + "\t" +
    //                     question.getId() + " " + question.getTitle());


    var choices = question.getChoices();

    var k = 0;
    var choicesArray = []
    // Gets the possible answers of the given item
    for (k; k < choices.length; k++){
      var choice = choices[k];
      sheet.getRange(i+1, 6+k).setValue(choice.getValue());
      // console.log("\t" + alphaArray[k] + ". " + choice.getValue());
      choicesArray.push(choice.getValue());
      // Insert right answer and creates key array
      if (choice.isCorrectAnswer()) {
        sheet.getRange(i+1, 5).setValue(alphaArray[k]);
        questionArray[4] = alphaArray[k];
          // keysArray[i]=i;
          // keysArray.push(i+1);
      }

    }

    questionArray.push(choicesArray);

    questionsArray.push(questionArray);
  }

  console.log(questionsArray);
  return questionsArray;

}
