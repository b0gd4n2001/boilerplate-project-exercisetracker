const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
mongoose.connect('mongodb+srv://bogdan:2Ff2NfVvK42ZbWw4@cluster0.qjyufua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const usernameSchema = new mongoose.Schema({ username: { type: String, required: true } });
const usernameModel = mongoose.model('username', usernameSchema);
const logsSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    count: { type: Number, default: 0 },
    log: [
      {
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        date: { type: String, required: true }
      }
    ]
  }
);
const logsModel = mongoose.model('logs', logsSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', bodyParser.urlencoded({ extended: false }), async function (req, res) {
  const user = await usernameModel.create({ username: req.body.username });
  await logsModel.create({ _id: user._id, username: user.username });
  res.json({ username: user.username, _id: user._id });
})

app.post('/api/users/:_id/exercises', bodyParser.urlencoded({ extended: false }), async function (req, res) {
  let answer = {
    description: req.body.description,
    duration: Number(req.body.duration),
    date: new Date(req.body.date) != 'Invalid Date' ? new Date(req.body.date).toDateString() : new Date().toDateString()
  }
  const userDoc = await logsModel.findById(req.params._id);
  userDoc.log.push(answer);
  await userDoc.save();
  answer._id = userDoc._id;
  answer.username = userDoc.username;
  res.json(answer);
})

app.get('/api/users/:_id/logs/:from?/:to?/:limit?', function (req, res) {
  //console.log(req.params, req.query);
  res.send(req.params);
})

app.get('/api/users', async function (req, res) {
  res.send(await usernameModel.find());
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
