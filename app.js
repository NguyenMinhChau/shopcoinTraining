require('dotenv').config();
const express = require('express');
const Admin = require('./routes/Admin');
const Coins = require('./routes/Coins');
const Authen = require('./routes/Authen');
const Users = require('./routes/Users');
const Ranks = require('./routes/Ranks');
const Services = require('./routes/services');
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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// import model
const Commission = require('./models/Commission');
const rateWithdrawDeposit = require('./models/RateWithdrawDeposit');

const { errCode1 } = require('./function');

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

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

app.set('conn', io);
app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corOptions));
app.use(express.static(path.resolve('./uploads')));

if (process.env.TYPE === 'product') {
    app.use(limiter);
}

switch (process.env.TYPE) {
    case 'product':
        // for product
        mongoose.connect(process.env.MONGO_PRO);
        break;
    case 'development':
        // for dev
        mongoose.connect(process.env.MONGO_DEV);
        // mongoose.connect(process.env.MONGO_PRO);
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
app.use('/services', Services);

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

const commission = new Commission();
Commission.find({}, (err, comms) => {
    if (err) errCode1(res, err);

    if (comms.length == 0) {
        commission.save();
    }
});

const newRate = new rateWithdrawDeposit();
rateWithdrawDeposit.find({}, (err, rate) => {
    if (err) errCode1(res, err);

    if (rate.length == 0) {
        newRate.save();
    }
});

// setInterval(() => {
//     // axios.get(`${process.env.URL_API}/coins/updatePriceAllCoin`).catch(err => {});
//     axios
//         .get(`${process.env.URL_API}/coins/updateHighLowAllCoin`)
//         .catch((err) => {});
//     // axios.get('http://localhost:4000/coins/updatePriceAllCoin').catch(err => {});
//     // axios
//     //     .get('http://localhost:4000/coins/updateHighLowAllCoin')
//     //     .catch((err) => {});
// }, 10000);

setInterval(() => {
    axios
        .get('http://localhost:4000/coins/updatePriceAllCoin')
        .catch((err) => {});
    // axios
    //     .get(`${process.env.URL_API}/coins/updatePriceAllCoin`)
    //     .catch((err) => {});
}, 1000);

let port = process.env.PORT || 3000;
httpServer.listen(port, () => console.log('Running at port ' + port));
