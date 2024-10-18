require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { PerclScript, Say, Pause, GetDigits, Hangup } = require('@freeclimb/sdk')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 80
const host = process.env.HOST

// Specify this route with 'Voice URL' in App Config
app.post('/incomingCall', (req, res) => {
  res.status(200).json(new PerclScript({
    commands: [
      new Say({ text: "Hello" }),
      new Pause({ length: 100 }),
      new GetDigits({
        prompts: [
          new Say({ text: "Please select a color. Enter one for green, two for red, and three for blue. " })
        ],
        maxDigits: 1,
        minDigits: 1,
        flushBuffer: true,
        actionUrl: `${host}/colorSelectionDone`
      })
    ]
  }).build())
})

app.post('/colorSelectionDone', (req, res) => {
  const colors = {
    '1': 'green',
    '2': 'red',
    '3': 'blue'
  }
  if (req.body.digits && req.body.digits in colors) {
    res.status(200).json(new PerclScript({
      commands: [
        new Say({ text: `You selected ${colors[req.body.digits]}` }),
        new Hangup({})
      ]
    }).build())
  } else {
    res.status(200).json(new PerclScript({
      commands: [
        new Say({ text: "You did not select a number between 1 and 3" }),
        new Hangup({})
      ]
    }).build())
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