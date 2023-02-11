const STATE_WAIT_PARTNER = 'WAIT_PARTNER'
const STATE_WAIT_CONTRACT_INN = 'WAIT_CONTRACT_INN'
const STATE_WAIT_CONTRACT_NAME = 'WAIT_CONTRACT_NAME'
const STATE_WAIT_CONTRACT_DATE = 'WAIT_CONTRACT_DATE'
const STATE_WAIT_CONTRACT_FILE = 'WAIT_CONTRACT_FILE'
const STATE_WAIT_KS3 = 'WAIT_KS_3'

class State extends Default{
  constructor(sheet_name){
    super(sheet_name)
  }
  getOne(chat_id){
    const range = this.getAll()
    const data = range.find(el => el[0] == chat_id)
    if(data == undefined){
      return undefined
    }
    return { 
      status: data[1], 
      value: data[2] 
    }
  }
  clearOne(chat_id){
    const sheet = this.getSheet()
    const range = this.getAll()
    const index = range.findIndex(el => el[0] == chat_id)
    if(index != -1){
      sheet.deleteRow(index + 1 + 1) //+1 у строк индексы начинаются с 1, а это массив c 0. И еще +1 потому что в getAll() - shift
    }
  }
  setOne(chat_id, status, value){
    if(!chat_id){
      throw new Error('Не указан id владельца состояния.')
    }
    if(!status){
      throw new Error('Не указан статус состояния.')
    }
    this.clearOne(chat_id)
    const sheet = this.getSheet()
    const lastRow = sheet.getLastRow()
    sheet.insertRowAfter(lastRow)
    const range = sheet.getRange(lastRow + 1, 1, 1, 3)
    range.setValues([[ chat_id, status, value ? JSON.stringify(value) : '' ]])
  }
  modifyOne(chat_id, status, value, nextStepMessage){
    if(!chat_id){
      throw new Error('Не указан id владельца состояния.')
    }
    if(!status){
      throw new Error('Не указан статус состояния.')
    }
    const state = this.getOne(chat_id)
    const lastValue = state.value ? JSON.parse(state.value) : {}
    const newValue = {...lastValue, ...value}
    this.clearOne(chat_id)
    this.setOne(chat_id, status, newValue)
    nextStepMessage && sendText(chat_id, nextStepMessage)
  }
}
