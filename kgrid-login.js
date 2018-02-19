#!/usr/bin/env node
var request = require('superagent')
var program = require('commander')
const inquirer = require('inquirer')

program
  .name('kgrid login')
  .description('This will log into https://kgrid.med.umich.edu/library2')
  .usage('')
  .parse(process.argv)

inquirer.prompt([{
            type: 'input',
            name: 'username',
            message: 'Username: '
          },{
            type: 'password',
            name: 'password',
            message: 'Password: ',
            mask:'*'
          }]).then(ans=>{
            request
             .post('http://kgrid.med.umich.edu/library2/login?username='+ans.username+'&password='+ans.password)
             .end(function (err, res) {
                if(err!=null){
                  console.log('Login failed. Please try again late.')
                }
                if(res!=null){
                  console.log('\n')
                  console.log('Welcome, '+res.body.first_name)
                }
             })
          })
