const SHEET_NAME_KS3 = 'КС3'
const COLUMS_COUNT_KS3 = 13

function createScan(date, counterparty, contract, price){
  const ss = SpreadsheetApp.openById(SS_ID)
  const sheet = ss.getSheetByName(SHEET_NAME_KS3)
  const lastRow = sheet.getLastRow()
  sheet.insertRowAfter(lastRow)
  const range = sheet.getRange(lastRow + 1, 1, 1, 5)
  const rangeCheckbox = sheet.getRange(lastRow + 1, 6)
  const id = sheet.getRange(lastRow, 1).getValue() + 1
  range.setValues([
    [id, date, contract, counterparty, price]
  ])
  rangeCheckbox.insertCheckboxes('ИСТИНА').check()

}
function editScan() {
  const ss = SpreadsheetApp.openById(SS_ID)
  const sheet = ss.getSheetByName(SHEET_NAME_KS3)
  const lastRow = sheet.getLastRow()
  sheet.insertRowAfter(lastRow)
}
function rejectScan(id){

}
function getFolders(folder_id){
  const folder = DriveApp.getFolderById(folder_id)
}
