const SS_ID = '1Yu8HRvLPyVMeJcD_IpfpodBKzserOGi_LjurTXbXIJU';
const WEBHOOK = 'https://script.google.com/macros/s/AKfycbxLBOl5UdOUUareIqcU4zPc1-cyhIyffEWEc_Jtr0MTpYo7vE58sataM1og4ZQEyUeTxw/exec';
const TOKEN = '';
const API_URL = "https://api.telegram.org/bot" + TOKEN + '/';
const API_FILE = 'https://api.telegram.org/file/bot' + TOKEN + '/'
const ADMIN_ID = '529134211'

const SHEET_NAME_PARTNERS = 'Контрагенты'
const SHEET_NAME_CONTRACT = 'Договора'
const SHEET_NAME_STATE = 'state'

//Commands
const GET_CONTRACTS_BY_PARTNER = 'getContractsByPartner'
const ADD_NEW_CONTRACT = 'addNewContract'
const ADD_NEW_PARTNER = 'addNewPartner'
const ADD_NEW_KS3_BY_CONTRACT = 'addNewKS3ByContract'
const DOWNLOAD_CONTRACT = 'dwCNT'

//Commands-menu
const menu = {
  GET_PARTNERS_KS3: '/get_partners',
  SET_NEW_PARTNER: '/set_new_partner',
  SEND_KS3: '/send_ks3',
  GET_DELETED_KS3: '/get_deleted_ks3',
  GET_REJECTS_KS3: '/get_rejected_ks3',
  GET_COMPLETED_KS3: '/get_completed_ks3',
}

const FOLDER_ID_KS3 = '1GA58hbIkBz4wQ9wH8BJWGWGHUuWjARYz';
const FOLDER_ID_CONTRACTS = '1zVv28CuGSdd18-hBRDhFfWUPXNq1_gnA';


function setWebHook() {
  let response = UrlFetchApp.fetch(API_URL + "setWebHook?url=" + WEBHOOK);
  console.log(response.getContentText());
}

const partners = new Partners(SHEET_NAME_PARTNERS)
const contracts = new Contracts(SHEET_NAME_CONTRACT)
const state = new State(SHEET_NAME_STATE)

function doPost(e){
  const req = JSON.parse(e.postData.contents)
  // SpreadsheetApp.openById(SS_ID).getSheetByName('data').getRange(1, 1).setValue(req)
  try{
    
    //Ответы на inline_menu
    if(req?.callback_query?.data != undefined){
      const data = JSON.parse(req.callback_query.data)
      const { id: chat_id } = req.callback_query.from
      if(data.cmd === GET_CONTRACTS_BY_PARTNER){
        const keyboard = contracts.getAllByInnOnKeyboard(data.pl)
        sendText(chat_id, 'Выберите договор с контрагентом: ', keyboard)
      }
      if(data.cmd === STATE_WAIT_KS3){
        state.setOne(chat_id, data.cmd)
      }
      if(data.cmd === STATE_WAIT_PARTNER){
        state.setOne(chat_id, data.cmd)
        sendText(chat_id, 'Введите название контрагента вместе с формой собственности и ИНН:', {
          input_field_placeholder: 'ООО СиАрСиСиРус 7730212723'
        })
      }
      if(data.cmd === STATE_WAIT_CONTRACT_NAME){
        state.setOne(chat_id, data.cmd, { inn: data.pl })
        // setState(chat_id, data.cmd, { inn: data.pl })
        sendText(chat_id, 'Напишите название договра:', {
          input_field_placeholder: '14-ПТК/17'
        })
      }
    }

    //Ответы на сообщения
    if(req?.message != undefined){
      const { text } = req?.message
      const { id: chat_id } = req?.message?.from
      const current_state = state.getOne(chat_id)

      if(text == menu.GET_PARTNERS_KS3){
        const keyboard = partners.getKeyboard()
        sendText(chat_id, 'Все контрагенты: ', keyboard)
      }else if(text == menu.SET_NEW_PARTNER){
        sendText(chat_id, 'Введите название контрагента вместе с формой собственности и ИНН. Например -> ООО СиАрСиСиРус 7730212723')
        state.setOne(chat_id, STATE_WAIT_PARTNER)
      } else if(current_state){
        switch(current_state.status){
          case undefined: {
            state.clearOne(chat_id)
            break;
          }
          case STATE_WAIT_PARTNER: {
            partners.create(chat_id, text)
            state.clearOne(chat_id)
            break;
          }

          case STATE_WAIT_CONTRACT_NAME: {
            state.modifyOne(chat_id, STATE_WAIT_CONTRACT_DATE, { name: text }, `Укажите дату договора в формате: 16.05.2022`)
            break;
          }
          case STATE_WAIT_CONTRACT_DATE: {
            state.modifyOne(chat_id, STATE_WAIT_CONTRACT_FILE, { date: text }, `Загрузите договор в формате pdf.`)
            break;
          }
          case STATE_WAIT_CONTRACT_FILE: {
            const { file_id, mime_type } = req?.message?.document
            if(mime_type !== 'application/pdf'){
              throw new Error('Скан договора должен быть в формате .pdf')
            }
            const { inn, date, name } = JSON.parse(current_state.value)
            contracts.create( chat_id, inn, date, name, file_id )
            state.clearOne(chat_id)
            break;
          }
        }
      }

    }
  }catch(e){
    const chat_id = req?.message?.from?.id
    const text = req?.message?.text
    const first_name = req?.message?.from?.first_name
    const last_name = req?.message?.from?.last_name
    const callback_query_id = req?.callback_query?.from?.id
    state.clearOne(chat_id)
    sendText(chat_id || callback_query_id, 'Ошибка: ' + e.message)
    sendText(
      ADMIN_ID, 
      `Ошибка ${last_name || ''} ${first_name || ''} id${chat_id || callback_query_id}: ` + e.message + `. Запрос: ${text}`
      )
  }
}

function sendText(chat_id, text, keyboard){
  const data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chat_id),
      text,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(keyboard ? keyboard: { 
        remove_keyboard: true
      }),
    }
  }
  UrlFetchApp.fetch(API_URL, data)
}

function editMenu(chat_id, message_id, keyboard){
  const data = {
    method: "post",
    payload: {
      method: "editMessageReplyMarkup",
      chat_id: String(chat_id),
      message_id,
      reply_markup: JSON.stringify(keyboard),
    }
  }
  UrlFetchApp.fetch(API_URL, data)
}
