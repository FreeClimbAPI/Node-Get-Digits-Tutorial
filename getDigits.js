const express = require('express')
const bodyParser = require('body-parser')
const persephonySDK = require('@persephony/sdk')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000
// Where your app is hosted ex. www.myapp.com
const host = process.env.HOST

const persephony = persephonySDK()
// Handles incoming calls
app.post('/incomingCall', (req, res) => {
  // Create PerCL say script
  const greeting = persephony.percl.say('Hello')
  // Create PerCL say script
  const greetingPause = persephony.percl.pause(100)
  // Create PerCL say script
  const promptForColor = persephony.percl.say('Please select a color. Enter one for green, two for red, and three for blue.')
  // Create options for getDigits script
  const options = {
    prompts: persephony.percl.build(promptForColor),
    maxDigits: 1,
    minDigits: 1,
    flushBuffer: true
  }
  // Create PerCL for getDigits script
  const getDigits = persephony.percl.getDigits(`${host}/colorSelectionDone`, options)
  // Build and respond with Percl script
  const percl = persephony.percl.build(greeting, greetingPause, getDigits)
  res.status(200).json(percl)
})

app.post('/colorSelectionDone', (req, res) => {
  // Get Persephony response
  const getDigitResponse = req.body
  // Get the digits the user entered
  const digits = getDigitResponse.digits
  // Create PerCL say script based on the selected DTMF with US English as the language
  if (digits) {
    colors = {
      '1': 'green',
      '2': 'red',
      '3': 'blue'
    }
    const color = colors[digits]
    let sayResponse = color ? `You selected ${color}` : 'you did not select a number between 1 and 3'
    let say = persephony.percl.say(sayResponse)
    // Create PerCL hangup script
    const hangup = persephony.percl.hangup()
    // Build PerCL script
    const percl = persephony.percl.build(say, hangup)
    // Repsond with PerCL scripts
    res.status(200).json(percl)
  }
})

// Specify this route with 'Status Callback URL' in App Config
app.post('/status', (req, res) => {
  // handle status changes
  res.status(200)
})

app.listen(port, () => {
  console.log(`Starting server on port ${port}`)
})