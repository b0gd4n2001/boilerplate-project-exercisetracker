const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
mongoose.connect('mongodb+srv://bogdan:2Ff2NfVvK42ZbWw4@cluster0.qjyufua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const usernameSchema = new mongoose.Schema({username: String});
const usernameModel = mongoose.model('username', usernameSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', bodyParser.urlencoded({extended: false}), async function (req, res) {
  const user = await usernameModel.create({username: req.body.username});
  res.json({username: user.username, _id: user._id});
})

app.post('/api/users/:_id/exercises', bodyParser.urlencoded({extended: false}), function (req, res) {
  res.send('retrieveng exercises')
})

app.get('/api/users/:_id/logs/:from?/:to?/:limit?', function (req, res) {
  console.log(req.params, req.query);
  res.send(req.params);
})

app.get('/api/users', async function (req, res) {
  res.send(await usernameModel.find());
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
