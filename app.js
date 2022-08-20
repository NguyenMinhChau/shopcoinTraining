require('dotenv').config()
const expres = require('express')
const Users = require('./routes/User')
const Coins = require('./routes/Coins')
const mongoose = require('mongoose')
const session = require('express-session')

const app = expres()

app.use(session({
  secret: 'keyboard cat',
  cookie: { secure: true, maxAge: 60 * 60 * 1000},
}))
app.use(expres.json())
app.use(expres.urlencoded({extended: false}))

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