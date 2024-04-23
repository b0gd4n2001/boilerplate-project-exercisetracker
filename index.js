const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
mongoose.connect('mongodb+srv://bogdan:2Ff2NfVvK42ZbWw4@cluster0.qjyufua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const usernameSchema = new mongoose.Schema({ username: { type: String, required: true } });
const usernameModel = mongoose.model('username', usernameSchema);
const exerciseSchema = new mongoose.Schema(
  {
    userid: { type: String, required: true },
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String, required: true }
  }
);
const exerciseModel = mongoose.model('exercises', exerciseSchema);
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
  const username = await usernameModel.findById(req.params._id);
  const exercise = await exerciseModel.create(
    {
      userid: req.params._id,
      username: username.username,
      date: new Date(req.body.date) != 'Invalid Date' ? new Date(req.body.date).toDateString() : new Date().toDateString(),
      duration: Number(req.body.duration),
      description: req.body.description
    }
  );
  res.json(
    {
      _id: exercise.userid,
      username: exercise.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description
    }
  );
})

app.get('/api/users/:_id/logs/:from?/:to?/:limit?', async function (req, res) {
  //console.log(req.params, req.query);
  const user = await usernameModel.findById(req.params._id);
  const exercises = await exerciseModel.find({ userid: user._id });
  let from = req.params.from ?? req.query.from ?? -Infinity;
  let to = req.params.to ?? req.query.to ?? Infinity;
  let limit = req.params.limit ?? req.query.limit ?? Infinity;
  let log = new Array(exercises);
  log = log.flat(Infinity);

  log = log.filter((x) => Date.parse(x.date) >= from && Date.parse(x.date) <= to);

  log = log.slice(0, limit);
  log = log.map((x) => (
    {
      date: x.date,
      duration: x.duration,
      description: x.description
    }
  ));
  console.log(log);
  let answer = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  };

  res.json(answer);
})

app.get('/api/users', async function (req, res) {
  res.send(await usernameModel.find());
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
