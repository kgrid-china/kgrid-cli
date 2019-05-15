const {Command, flags} = require('@oclif/command')
const addImplementation = require('../../add_bundled_implementation')

class BundledCommand extends Command {
  async run() {
    const {flags} = this.parse(BundledCommand)
    let version = flags.version || ''
    addImplementation('',version)
  }
}

BundledCommand.description = 'Add an implementation to the knowledge object.'

BundledCommand.flags = {
  version: flags.string({char: 'v'}),
}

module.exports = BundledCommand
