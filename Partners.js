function Partners(){
    this.SPREADSHEET_ID = '1Yu8HRvLPyVMeJcD_IpfpodBKzserOGi_LjurTXbXIJU'
    this.SHEET_NAME = 'Контрагенты'
  
    this.getSheet = function(){
      return SpreadsheetApp.openById(this.SPREADSHEET_ID).getSheetByName(this.SHEET_NAME)
    }
    this.getAll = function(){
      const allPartners = this.getSheet()
      .getDataRange()
      .getValues()
      allPartners.shift()
      return allPartners
    }
    this.create = function(name, inn){
      const sheet = this.getSheet()
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
    }
    this.getKeyboard = function(){
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
    this.getNameByInn = function(inn){
      return this.getAll().filter(el => el[1] == inn)[0][0] || null
    }
    this.isINN = function(inn){
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
  function getNameByInn(inn){
    return SpreadsheetApp
      .openById(SS_ID)
      .getSheetByName(SHEET_NAME_PARTNERS)
      .getDataRange()
      .getValues()
      .filter(el => el[1] == inn)[0][0] || ''
  }
  function desctructMessageToPartner(str){
    const inn = str.match(/\b\d{12}\b|\b\d{10}\b/g) ? str.match(/\b\d{12}\b|\b\d{10}\b/g)[0].toString() : null
    const name = str.replace(/\b\d{12}\b|\b\d{10}\b/g, '')
    return { 
      name, 
      inn
    }
  }
  
  