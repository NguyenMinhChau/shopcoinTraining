require('dotenv').config()
const express = require('express')
const Admin = require('./routes/Admin')
const Coins = require('./routes/Coins')
const Authen = require('./routes/Authen')
const Users = require('./routes/Users')
const Ranks = require('./routes/Ranks')
const test = require('./routes/test')
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser');

const app = express()

app.use(session({
  secret: 'keyboard cat',
  cookie: { secure: true, maxAge: 60 * 60 * 1000},
}))

const corOptions = {
  origin: true,
  credentials: true
}

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(cors(corOptions))
app.use(express.static(path.resolve('./uploads')));

switch(process.env.TYPE){
    case 'product':
        // for product
        mongoose.connect('mongodb://shopcoin:shopcoin123@139.59.97.145:27017/shopcoin?authSource=admin')
        break
    case 'development':
        // for dev
        mongoose.connect(process.env.MONGO_DEV)
        break
}
// mongoose.connect('mongodb://shopcoin:shopcoin123@139.59.97.145:27017/shopcoin?authSource=admin')
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use('/admin', Admin)
app.use('/coins', Coins)
app.use('/users', Users)
app.use('/authen', Authen)
app.use('/ranks', Ranks)
app.use('/test', test)

let port = process.env.PORT || 3000
app.listen(port, () => console.log("Running at port " + port))
