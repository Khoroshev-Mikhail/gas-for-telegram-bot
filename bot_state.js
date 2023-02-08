const SHEET_NAME_STATE = 'state'

const STATE_WAIT_PARTNER = 'WAIT_PARTNER'
const STATE_WAIT_CONTRACT_INN = 'WAIT_CONTRACT_INN'
const STATE_WAIT_CONTRACT_NAME = 'WAIT_CONTRACT_NAME'
const STATE_WAIT_CONTRACT_DATE = 'WAIT_CONTRACT_DATE'
const STATE_WAIT_CONTRACT_FILE = 'WAIT_CONTRACT_FILE'
const STATE_WAIT_KS3 = 'WAIT_KS_3'

function getState(chat_id){
  const ss = SpreadsheetApp.openById(SS_ID)
  const sheet = ss.getSheetByName(SHEET_NAME_STATE)
  const range = sheet.getDataRange().getValues()
  const data = range.find(el => el[0] == chat_id)
  if(data == undefined){
    return undefined
  }
  return { status: data[1], value: data[2] }
}
function clearState(chat_id){
  const ss = SpreadsheetApp.openById(SS_ID)
  const sheet = ss.getSheetByName(SHEET_NAME_STATE)
  const range = sheet.getDataRange().getValues()
  const index = range.findIndex(el => el[0] == chat_id)
  if(index != -1){
    sheet.deleteRow(index + 1)
  }
}
function setState(chat_id, status, value) {
  clearState(chat_id)
  const ss = SpreadsheetApp.openById(SS_ID)
  const sheet = ss.getSheetByName(SHEET_NAME_STATE)
  const lastRow = sheet.getLastRow()
  sheet.insertRowAfter(lastRow)
  const range = sheet.getRange(lastRow + 1, 1, 1, 3)
  range.setValues([[ chat_id, status, value ? JSON.stringify(value) : '' ]])
}
function modifyState(chat_id, status, value){
  const state = getState(chat_id)
  const lastValue = state.value ? JSON.parse(state.value) : {}
  const newValue = {...lastValue, ...value}
  clearState(chat_id)
  setState(chat_id, status, newValue)
}
