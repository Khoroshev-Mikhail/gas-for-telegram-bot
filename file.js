function setFileFromTG(file_id, folder_id, file_name){
  const data = {
    method: "post",
    payload: {
      method: "getFile",
      file_id: String(file_id)
    }
  }
  const response = UrlFetchApp.fetch(API_URL, data)
  const url_document = API_FILE + JSON.parse(response).result.file_path
  const blob_document = UrlFetchApp.fetch(url_document).getBlob().setName(file_name)
  DriveApp.getFolderById(folder_id).createFile(blob_document)
}
function getOrCreateFolderReturningId(parent_folder_id, inn){
  const partner = partners.getNameByInn(inn)
  const folders = DriveApp.getFolderById(parent_folder_id).getFolders()
  while (folders.hasNext()) {
    const folder = folders.next();
    if(folder.getName() == partner){
      return folder.getId()
    }
  }
  return DriveApp.getFolderById(parent_folder_id).createFolder(partner).getId()
}