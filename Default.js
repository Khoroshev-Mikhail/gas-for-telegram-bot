class Default {
    constructor(sheet_name){
      this.SHEET_NAME = sheet_name
    }
    getSheet(){
      return SpreadsheetApp.openById(SS_ID).getSheetByName(this.SHEET_NAME)
    }
    getAll(){
      const essence = this.getSheet()
      .getDataRange()
      .getValues()
      essence.shift()
      return essence
    }
    exportDate(str){
      const date = new Date(str)
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }
  }
  