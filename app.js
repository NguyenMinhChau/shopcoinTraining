// libs
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

// routes
const Authentication = require('./routes/Authentication');
const Admin = require('./routes/Admin');
const User = require('./routes/User');

// import models
const Rate = require('./models/Rate');

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

// routes
app.use('/authentication', Authentication);
app.use('/admin', Admin);
app.use('/users', User);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running at port = ${port}`));
