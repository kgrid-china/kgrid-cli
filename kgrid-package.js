#!/usr/bin/env node
var download = require('download-git-repo')
const downloadurl = require('download');
var program = require('commander')
var path=require('path')
var inquirer = require('inquirer');
const fs=require('fs-extra')
const ncp=require('ncp').ncp
const exists = require('fs').existsSync
const zipFolder = require('zip-folder');

program
  .name('kgrid packge')
  .usage('[options]')
  .option('-l, --legacy','The option to package knowledge objects using legacy model')
 	.parse(process.argv)

var ver = program.args[0]
var tmp = 'tmp'
var dest = 'activator/shelf'
const inputfile ='input.xml'
const outputfile='output.xml'
const payloadfile='payload'
var payloadext = 'js'
const metadatafile='metadata.json'
const basefile='base.json'
const project=path.basename(process.cwd())

var prop= JSON.parse(fs.readFileSync('project.json', 'utf8'))
var packfile=prop.object
var srcpath = 'src/'+prop.object+'/'
switch(prop.template){
  case 'jslegacy':
    payloadext ='js'
    break
  case 'pythonlegacy':
    payloadext ='py'
    break
}
var isLegacy = prop.template.includes('legacy')
if(program.legacy){
  if(isLegacy){
    packaginglegacy()
  }else {
    console.log('This knowledge Object cannot be packaged using l--legacy option. Please remove the option and try again.')
  }
}else{
  if(isLegacy){
    console.log('This knowledge Object is using a legacy model. Though it can be packged as instructed, it won\'t be runnable in the activator.')
    inquirer.prompt([{
            type: 'confirm',
            name: 'continue',
            message: 'Would you like to continue? ',
            default: false
          }]).then(answers=>{
            if (answers.continue){
              packagingzip()
            }else {
              console.log('Please add the option of -l or --legacy and try again.')
            }
          })
  }else {
    packagingzip()
  }
}

function packagingzip(){
  zipFolder('src/'+prop.object, 'src/'+prop.object+'.zip', function(err) {
  	if(err) {
  		console.log('oh no!', err);
  	} else {
  		console.log(prop.object+'.zip is created in the target folder.');
      fs.ensureDir('target', err => {
         if(err!=null){console.log(err) }
         fs.copySync('src/'+prop.object+'.zip','target/'+prop.object+'.zip')
         if(!isLegacy){
          fs.moveSync('src/'+prop.object+'.zip','activator/shelf/'+prop.object+'.zip',{overwrite:true})
         }
       })
  	}
  });
}

function packaginglegacy(){
var data = fs.readFileSync(srcpath+basefile, 'utf8')
var myobject = JSON.parse(data)
data = fs.readFileSync(srcpath+inputfile, 'utf8')
myobject.inputMessage=data
data = fs.readFileSync(srcpath+outputfile, 'utf8')
myobject.outputMessage=data
data = fs.readFileSync(srcpath+payloadfile+'.'+payloadext, 'utf8')
myobject.payload.content=data
data = fs.readFileSync(srcpath+metadatafile, 'utf8')
myobject.metadata=JSON.parse(data).metadata
console.log(JSON.stringify(myobject))
fs.ensureDir('target', err => {
   if(err!=null){console.log(err) }
   fs.writeFileSync('target/'+packfile,JSON.stringify(myobject))
   fs.writeFileSync('./activator/shelf/'+packfile,JSON.stringify(myobject))
 })
}
