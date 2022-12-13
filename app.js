// libs
require('dotenv').config();
require('./services/createDir');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// routes
const Authentication = require('./routes/Authentication');
const Admin = require('./routes/Admin');
const User = require('./routes/User');

// import models
const Rate = require('./models/Rate');
const Commission = require('./models/Commission');

const app = express();

// configs
const corOptions = {
    origin: true,
    credentials: true
};

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs/access.log'),
    { flags: 'a' }
);

app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
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
        // mongoose.connect(process.env.MONGO_PRO);
        break;
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    console.log('Connected successfully');
});

Rate.find({}, (err, rates) => {
    if (err) return res.json({ err });

    if (rates.length == 0) {
        const rate = new Rate();
        rate.save();
    }
});

Commission.find({}, (err, commissions) => {
    if (err) return res.json({ err });

    if (commissions.length == 0) {
        const commission = new Commission();
        commission.save();
    }
});

setInterval(() => {
    const url = 'http://localhost:4000/admin/updateRate';
    const url1 = `${process.env.URL}/admin/updateRate`;
    axios
        .get(url)
        .then()
        .catch((err) => {});
}, 5 * 60 * 1000);

// routes
app.use('/authentication', Authentication);
app.use('/admin', Admin);
app.use('/users', User);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running at port = ${port}`));
