class Partners extends Default{
  constructor(sheet_name){
    super(sheet_name)
  }
  create(chat_id, text){
    const sheet = this.getSheet()
    const inn = text.match(/\b\d{12}\b|\b\d{10}\b/g) ? text.match(/\b\d{12}\b|\b\d{10}\b/g)[0].toString() : null
    const name = text.replace(/\b\d{12}\b|\b\d{10}\b/g, '')
    if(!inn){
      throw new Error('ИНН - не указан или указан не верно. ИНН состоит из 10 цифр для юр.лиц и 12 для физ.лиц.')
    }
    if(sheet.getDataRange().getValues().flat().filter(el => el == inn).length >= 1){
      throw new Error('Контрагент с таким ИНН уже существует. Выход.')
    }
    if(sheet.getDataRange().getValues().flat().includes(name)){
      throw new Error('Контрагент с таким названием уже существует. Выход.')
    }
    const last_row = sheet.getLastRow()
    sheet.insertRowAfter(last_row)
    sheet.getRange(last_row + 1, 1, 1, 2).setValues([[name, inn]])
    sendText(chat_id, `Создан новый контрагент: ${name}, ИНН: ${inn}`)
  }
  getKeyboard(){
    const buttons = this.getAll().map(el => {
      const callback_data = JSON.stringify({ cmd: GET_CONTRACTS_BY_PARTNER, pl: el[1] })
      return [{ 
        text: el[0], 
        callback_data 
      }]
    })
    const lastButton = [{
      text: `Добавить нового контрагента. `, 
      callback_data: JSON.stringify({ cmd: STATE_WAIT_PARTNER })
    }]
    return { 
      inline_keyboard : [...buttons, lastButton]
    }
  }
  getNameByInn(inn){
    return this.getAll().filter(el => el[1] == inn)[0][0] || null
  }
  isInn(inn){
    return inn.match(/\b\d{12}\b|\b\d{10}\b/g) ? str.match(/\b\d{12}\b|\b\d{10}\b/g)[0].toString() : null
  }
}
//Вспомогательные функции
function formatDate(str){
  const date = new Date(str)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
