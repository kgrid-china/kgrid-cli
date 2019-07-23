const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const os = require('os')
const axios = require('axios')
const shelljs = require('shelljs')
const documentations = require('../json/extradoc.json')
const userConfig = require('../user_config')
const parseInput = require('../parse_input')

class PlayCommand extends Command {
  async run() {
      const {args, flags} = this.parse(PlayCommand)
      var localurl = flags.port ? 'http://localhost:'+flags.port : flags.port
      const userConfigJson =  userConfig()
      let activator_port = 8080
      if(userConfigJson){
        if(userConfigJson.devDefault.activator_port!=''){
          activator_port  = userConfigJson.devDefault.activator_port
        }
      }
      activator_port=flags.port || activator_port
      let url = flags.url || localurl  || 'http://localhost:'+activator_port
      let openurl = flags.open
      let targeturl='https://editor.swagger.io/'
      let ark = args.ark
      let koid = {naan:'',name:'',imp:''}
      var parsedinput = parseInput ('play', ark, null, null)
      if(parsedinput == 1){
        return 1
      }
      koid=JSON.parse(JSON.stringify(parsedinput.koid))
      // Retrieve the implementation list for the KOs on the activator shelf
      let imples = []
      let targetimple =''
      axios({
        method: 'get',
        url: url+'/kos/'
      })
      .then(async function (response) {
        imples = []
        Object.keys(response.data).forEach(function(e){
          let kometa = response.data[e]
          kometa.hasImplementation.forEach(function(ie){
            if(koid.imp!=''){
              if(ie==(koid.naan+'-'+koid.name+'/'+koid.imp)){
                imples.push('ark:/'+ie.replace('-','/'))
              }
            } else {
              if(koid.name!=''){
                if(ie.includes(koid.naan+'-'+koid.name)){
                  imples.push('ark:/'+ie.replace('-','/'))
                }
              } else {
                imples.push('ark:/'+ie.replace('-','/'))
              }
            }
          })
        });
        if(imples.length!=0){
          if(koid.imp==''){
            let responses = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'implementation',
                  message: 'Please select an implementation: ',
                  default: 0,
                  scroll: false,
                  choices: imples,
                  pageSize: Math.min(15, imples.length)
                }
              ])
            targetimple = responses.implementation.replace('ark:/','')
          } else {
            targetimple= koid.naan+'/'+koid.name+'/'+koid.imp
          }
          targeturl = `https://editor.swagger.io/?url=${url}/kos/${targetimple}/service`
          console.log('\nOpen the URL in your browser:\n')
          console.log('    '+targeturl)
          if(openurl){
            if(os.platform()=='win32'){
              shelljs.exec('start '+targeturl, {async:true})
            } else {
              shelljs.exec('open '+targeturl, {async:true})
            }
          }
          return 0
        } else {
          console.log('No implementation with ark id of ark:/'+ koid.naan+'/'+koid.name+'/'+koid.imp+' has been activated.\n')
        }
      })
      .catch(function(error){
          console.log('Cannot connect to the activator at:  '+url+'\n\nPlease make sure the activator is running and the correct url and/or port is specified to connect.\n\n  Example:  kgrid play [ARK] -p [port]\n\nOr\n\n  Example:  kgrid play [ARK] -l [url]\n');
      });
  }
}

PlayCommand.description = `Try out a Knowledge Object implementation using Swagger Editor.
${documentations.play}
`
PlayCommand.flags = {
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator', exclusive:['url']}),
  help: flags.help({char:'h'}),
  open: flags.boolean({char:'o', description:'Open the url in the default browser'}),
  url: flags.string({ char:'l',description:'The URL of the activator or library to upload the packaged KO', exclusive:['port']})
}
PlayCommand.args = [
  {name:'ark'}
]
module.exports = PlayCommand
