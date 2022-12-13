const fs = require('fs');

const DIR_UPLOADS = `./uploads`;
const DIR_LOGS = `./logs`;
const images = `${DIR_UPLOADS}/images`;
const images_user = `${DIR_UPLOADS}/images_user`;
const log_file = `${DIR_LOGS}/access.log`;

if (!fs.existsSync(DIR_UPLOADS)) {
    fs.mkdirSync(DIR_UPLOADS);
}

if (!fs.existsSync(DIR_LOGS)) {
    fs.mkdirSync(DIR_LOGS);
}

if (!fs.existsSync(images)) {
    fs.mkdirSync(images);
}

if (!fs.existsSync(images_user)) {
    fs.mkdirSync(images_user);
}

if (!fs.existsSync(log_file)) {
    fs.writeFileSync(log_file, '');
}
