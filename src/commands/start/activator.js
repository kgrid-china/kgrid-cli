const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const runKgrid = require('../../run_kgrid')
const documentations = require('../../json/extradoc.json')
const userConfig = require('../../user_config')
const kVersion = require('../../check_kgridversion')

class ActivatorCommand extends Command {
  async run() {
    const {args, flags} = this.parse(ActivatorCommand)
    let khome = await kVersion('activator')
    if(fs.pathExistsSync(khome)){
      const userConfigJson =  userConfig()
      let activator_port = ''
      if(userConfigJson){
          activator_port  = userConfigJson.devDefault.activator_port
      }
      let cmdObj = {name:'activator',component: '', shelf: '', port: '', khome:khome}
      cmdObj.shelf = flags.shelf || ''
      cmdObj.port = flags.port || activator_port
      cmdObj.jar = flags.jarfile || ''
      runKgrid(cmdObj)
    } 
  }
}

ActivatorCommand.description = `Start KGrid Activator.
${documentations.startactivator}
`
ActivatorCommand.flags = {
  shelf: flags.string({char: 's', description:'Specify an absolute path to use as the shelf containing KOs'}),
  port: flags.string({char: 'p', description:'Specify the port for KGRID Activator'}),
  jarfile: flags.string({char: 'j', description:'Specify the activator JAR file to use other than the installed one'}),
}
module.exports = ActivatorCommand
