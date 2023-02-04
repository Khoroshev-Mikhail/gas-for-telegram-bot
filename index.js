function createPartner(name, inn) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME_COUNTERPATRY)
  if(sheet.getDataRange().getValues().flat().includes(name)){
    throw new Error('Контрагент с таким названием уже существует.')
  }
  if(sheet.getDataRange().getValues().flat().includes(inn)){
    throw new Error('Контрагент с таким ИНН уже существует.')
  }
  const lastRow = sheet.getLastRow()
  sheet.getRange(lastRow + 1, 1, 1, 2).setValues([[name, inn]])
}
function desctructMessageToPartner(str){
  const inn = str.match(/\b\d{12}\b|\b\d{10}\b/g) ? str.match(/\b\d{12}\b|\b\d{10}\b/g)[0] : null
  const name = str.replace(/\b\d{12}\b|\b\d{10}\b/g, '')
  return { 
    name, 
    inn
  }
}

//Вспомогательные функции
function formatDate(str){
  const date = new Date(str)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
function getNameByInn(inn){
  return SpreadsheetApp
    .openById(spreadsheetId)
    .getSheetByName(SHEET_NAME_COUNTERPATRY)
    .getDataRange()
    .getValues()
    .filter(el => el[1] == inn)[0][0] || ''
}
function getKeyboardFromCounterparties() {
  const sheet = SpreadsheetApp
    .openById(spreadsheetId)
    .getSheetByName(SHEET_NAME_COUNTERPATRY)
    .getDataRange()
    .getValues()
  sheet.shift()
  const buttons = sheet.map(el => {
    const callback_data = JSON.stringify({ command: GET_CONTRACTS_BY_PARTNER, inn: el[1] })
    return [{ 
      text: el[0], 
      callback_data 
    }]
  })
  const lastButton = [{
    text: `Добавить нового контрагента. `, 
    callback_data: JSON.stringify({ command: ADD_NEW_PARTNER })
  }]
  return { 
    inline_keyboard : [...buttons, lastButton]
  }
}

function getKeyboardFromContracts(inn) {
  const sheet = SpreadsheetApp
    .openById(spreadsheetId)
    .getSheetByName(SHEET_NAME_CONTRACT)
    .getDataRange()
    .getValues()
  sheet.shift()
  const buttons = sheet
    .filter(el => el[0] == inn)
    .sort((a, b) => new Date(b[1]) - new Date(a[1]))
    .map(el => [{text: `№${el[2]} от ${formatDate(el[1])}`, callback_data: el[2]}, {text: 'Скачать', callback_data: el[2]}])
  const lastButton = [{
    text: `Добавить новый договор с ${getNameByInn(inn)}`, 
    callback_data: JSON.stringify({ command: ADD_NEW_CONTRACT, inn})
  }]
  return { 
    inline_keyboard : [...buttons, lastButton], 
    remove_keyboard: true 
  }
}



function ara(){
  const keyboard = getKeyboardFromCounterparties()
  // const keyboard = getKeyboardFromContracts(11111111111111)
  sendText(chat_id, 'Выберите контрагента: ', keyboard)
}
