const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const telegramMessages = new mongoose.Schema(
    {
        id: Number,
        text: { type: String, default: '' }
    },
    { timestamps: true, collection: 'telegram_messages' }
);

telegramMessages.plugin(AutoIncrement, { inc_field: 'id' });

const TelegramMessages = mongoose.model('TelegramMessages', telegramMessages);

module.exports = TelegramMessages;
