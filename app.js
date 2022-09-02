require('dotenv').config()
const express = require('express')
const Users = require('./routes/User')
const Coins = require('./routes/Coins')
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

app.use('/users', Users)
app.use('/coins', Coins)

let port = process.env.PORT || 3000
app.listen(port, () => console.log("Running at port " + port))
