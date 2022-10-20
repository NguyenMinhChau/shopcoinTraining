require('dotenv').config();
const express = require('express');
const Admin = require('./routes/Admin');
const Coins = require('./routes/Coins');
const Authen = require('./routes/Authen');
const Users = require('./routes/Users');
const Ranks = require('./routes/Ranks');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const { createServer } = require('http');
// require('./bot/bot');
const methods = require('./function');
const Rates = require('./routes/Rate');
const { default: axios } = require('axios');
const fs = require('fs');

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        //origins: ['http://localhost:5500']
        origin: '*'
    }
});

const corOptions = {
    origin: true,
    credentials: true
};

app.set('conn', io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corOptions));
app.use(express.static(path.resolve('./uploads')));

switch (process.env.TYPE) {
    case 'product':
        // for product
        mongoose.connect(process.env.MONGO_PRO);
        break;
    case 'development':
        // for dev
        mongoose.connect(process.env.MONGO_DEV);
        break;
}
// mongoose.connect('mongodb://shopcoin:shopcoin123@139.59.97.145:27017/shopcoin?authSource=admin')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    console.log('Connected successfully');
});

app.use('/admin', Admin);
app.use('/coins', Coins);
app.use('/users', Users);
app.use('/authen', Authen);
app.use('/ranks', Ranks);
app.use('/rates', Rates);

const DIR_UPLOADS = `./uploads`;
const images = `${DIR_UPLOADS}/images`;
const images_user = `${DIR_UPLOADS}/images_user`;

if (!fs.existsSync(DIR_UPLOADS)) {
    fs.mkdirSync(DIR_UPLOADS);
}

if (!fs.existsSync(images)) {
    fs.mkdirSync(images);
}

if (!fs.existsSync(images_user)) {
    fs.mkdirSync(images_user);
}

setInterval(() => {
    // axios.get(`${process.env.URL_API}/coins/updatePriceAllCoin`).catch(err => {});
    // axios.get(`${process.env.URL_API}/coins/updateHighLowAllCoin`).catch(err => {});
    // axios.get('http://localhost:4000/coins/updatePriceAllCoin').catch(err => {});
    // axios.get('http://localhost:4000/coins/updateHighLowAllCoin').catch(err => {});
}, 60000);

// app.use('/', (req, res) => {
//     const io = methods.getSocket(req, res);
//     const binance = methods.getBinance(req, res);
//     setInterval(() => {
//         binance.futuresMiniTickerStream('BTCUSDT', (data) => {
//             // io.sockets.emit('send-data-btc', data);
//             const { close, high, low } = data;
//             // console.log(close, high, low);
//             io.emit('send-data-btc', data);
//         });
//         binance
//             .futuresPrices()
//             .then((prices) => {
//                 io.emit('send-price-future', prices);
//             })
//             .catch((err) => console.log(err));
//     }, 3000);
//     return res.send('Welcome to api shop coin');
// });

let port = process.env.PORT || 3000;
httpServer.listen(port, () => console.log('Running at port ' + port));
