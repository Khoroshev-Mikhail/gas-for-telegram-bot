function Contracts(){
    this.SHEET_NAME = 'Договора'
  
    this.getSheet = function(){
      return SpreadsheetApp.openById(SS_ID).getSheetByName(this.SHEET_NAME)
    }
    this.getAll = function(){
      const allContracts = this.getSheet()
      .getDataRange()
      .getValues()
      allContracts.shift()
      return allContracts
    }
    this.getAllByInn = function(inn){
      return this.getAll().filter(el => el[0] == inn)
    }
    this.create = function(inn, date, name, file_id, chat_id){
      if(!inn){
        throw new Error('Не выбран контрагент с которым заключен договор.')
      }
      if(!date){
        throw new Error('Не указана дата')
      }
      if(!name){
        throw new Error('Не указано название договора')
      }
      const sheet = this.getSheet()
      const partner = partners.getNameByInn(inn)
      const last_row = sheet.getLastRow()
      const file_name = generateContractFileName(inn, name, date)
      const folder_id = getOrCreateFolderReturningId(FOLDER_ID_CONTRACTS, inn)
      setFileFromTG(file_id, folder_id, file_name)
      sheet.insertRowAfter(last_row)
      sheet.getRange(last_row + 1, 1, 1, 5).setValues([[inn, date, name, 'ссылка пустая', last_row]])
      sendText(chat_id, `Загружен новый договор "${name}" от ${date} с ${partner}`)
    }
    this.getAllByInnOnKeyboard = function(inn){
      const buttons = this.getAllByPartner(inn)
      .sort((a, b) => new Date(b[1]) - new Date(a[1]))
      .map(el => {
        const callback_data = JSON.stringify({ cmd: STATE_WAIT_KS3, pl: el[4] })
        const callback_data_contract = JSON.stringify({ 
          cmd: DOWNLOAD_CONTRACT, 
          pl: `${formatDate(el[1])}-${el[2]}`
        }) //Нужна проверка что меньше 1-64 или придумать название какойнибудт фиксированой длины
        return [
          {
            text: `№${el[2]} от ${formatDate(el[1])}`, 
            callback_data
          }, 
          {
            text: 'Скачать', 
            callback_data: callback_data_contract
          }
        ]
      })
      const lastButton = [{
        text: `Добавить договор с ${getNameByInn(inn)}`, 
        callback_data: JSON.stringify({ cmd: STATE_WAIT_CONTRACT_NAME, pl: inn})
      }]
      return { 
        inline_keyboard : [...buttons, lastButton]
      }
    }
  }
  function generateContractFileName(inn, name, date){
    const partner = getNameByInn(inn)
    return `Договор ${name} от ${date} с ${partner}`
  }
  
  