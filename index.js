const fs = require('fs').promises
const Netstorage = require('netstorageapi');
const ns = new Netstorage({
  cpCode: '871079',
  hostname: 'anfimages-nsu.akamaihd.net',
  keyName: 'moakes_anf_images',
  key: 'someprivatekey',
  ssl: false
})

const getListOfFileNames = (aPathRange) => {
  return new Promise((resolve, reject) => {
    try {
      ns.list(aPathRange, (error,response, body) => {
        console.log('Fetching data')
        let kicArr = []
        if (error) {
          console.log(`Error: ${error.message}`)
        }
        if (response.statusCode == 200) {
          console.log('Data received!')
          resolve(body.list.file)
        }
      })
    } catch(anError) {
      console.error(anError)
      reject(anError)
    }
  })
}

const createJsonFromArr = (arr) => {
  return JSON.stringify(Object.assign({}, arr))
}

const writeManifestFileToDisk = async(aList) => {
  console.log('Writing file')
  let file = await fs.writeFile('manifest.json', aList, 'utf8').catch((anError) => {
    console.error(anError)
  })
  console.log('File created')
  return file
}

const uploadFileToNetstorage = (aFileName) => {
  return ns.upload(aFileName, '871079/', (error) => {
    console.log('Starting upload')
    if (error) {
      console.log(`Error: ${error.message}`)
    }
    console.log('The file has been uploaded!')
  })
} 

const createAndUploadManifestFile = async(aPathRange) => {
  const allFiles = await getListOfFileNames(aPathRange)
  const allKicFiles = allFiles 
                        .filter(file => file.name.includes('KIC'))
                        .map(file => file.name)
  const json = createJsonFromArr(allKicFiles)
  await writeManifestFileToDisk(json)
  uploadFileToNetstorage('manifest.json')
}

const nsListOptionsConfig = {
  path: `/871079/is/image/anf`,
  actions: {
    end: `/871079/test/`
  }
}
createAndUploadManifestFile(nsListOptionsConfig);