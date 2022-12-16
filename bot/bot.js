const axios = require('axios');

const { bot } = require('../function');

const { URL_API } = process.env;
// let URL_API = `http://localhost:4000`;
let chatId = -756899178;

const handleService = async (status, url) => {
    const data = await axios.put(url, { status: status });
    return data.data;
};

const handleConfirmBuyCoin = async (id, status) => {
    return handleService(status, `${URL_API}/admin/handleBuyCoinBot/${id}`);
};

const handleConfirmSellCoin = async (id, status) => {
    return handleService(status, `${URL_API}/admin/handleSellCoinBot/${id}`);
};

const handleDeposit = async (id, status) => {
    return handleService(status, `${URL_API}/admin/handleDepositBot/${id}`);
};

const handleConfirmWithdraw = async (id, status) => {
    return handleService(status, `${URL_API}/admin/handleWithdrawBot/${id}`);
};

const handleServiceMessage = async (bot, chatId, raw, def) => {
    const idOrder = raw[1];
    const statusOrder = raw[2];

    const order = {
        chatId: chatId,
        idOrder: idOrder,
        statusOrder: statusOrder == 'on_hold' ? 'On hold' : statusOrder
    };

    const res = await def(
        idOrder,
        statusOrder == 'on_hold' ? 'On hold' : statusOrder
    );
    if (res.code === 0) {
        // bot.sendMessage(chatId, JSON.stringify(order) + '. ' + res.message);
        bot.sendMessage(
            chatId,
            `
            <b>Id: ${order.idOrder}</b>
            <b>Result: ${res.message}</b>
        `,
            { parse_mode: 'HTML' }
        );
    } else {
        // bot.sendMessage(chatId, JSON.stringify(order) + '. ' + res.message);
        bot.sendMessage(
            chatId,
            `
            <b>Id: ${order.idOrder}</b>
            <b>Result: ${res.message}</b>
        `,
            { parse_mode: 'HTML' }
        );
    }
};

bot.on('message', async (msg) => {
    // const chatId = msg.chat.id;
    const raw = msg.text.split(' ');
    if (raw[0] === 'ConfirmBuyCoin') {
        handleServiceMessage(bot, chatId, raw, handleConfirmBuyCoin);
    } else if (raw[0] === 'ConfirmSellCoin') {
        handleServiceMessage(bot, chatId, raw, handleConfirmSellCoin);
    } else if (raw[0] === 'ConfirmDeposit') {
        handleServiceMessage(bot, chatId, raw, handleDeposit);
    } else if (raw[0] === 'ConfirmWithdraw') {
        handleServiceMessage(bot, chatId, raw, handleConfirmWithdraw);
    }
});
