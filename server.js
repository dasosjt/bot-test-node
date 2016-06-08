var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
//the imports

app = express()
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())
app.get('/',function(req,res){
        if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(hub.query['hub.challenge'])
        }
        res.send('wrong token,error'
                 )
        })


app.get('/webhook',function(req,res){
        if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(hub.query['hub.challenge'])
        }
        res.send('wrong token,error'
                 )
        })


app.listen(app.get('port'), function(req,res) {
           console.log('server running on port',app.get('port'))
           })
