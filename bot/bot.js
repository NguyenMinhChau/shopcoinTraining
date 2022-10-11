const axios = require('axios');

const TelegramBot = require('node-telegram-bot-api');

const { BOT_TELEGRAM_TOKEN, URL_API } = process.env;

const bot = new TelegramBot(BOT_TELEGRAM_TOKEN, { polling: true });

const getDataBuyCoin = async () => {
    const data = await axios.get(`${URL_API}/admin/getAllBuy/`);
    return data.data;
};

const getDataSellCoin = async () => {
    const data = await axios.get(`${URL_API}/admin/getAllSell/`);
    return data.data;
};

let status = '';

bot.onText(/\/list_buy_coin/, async (msg) => {
    const chatId = msg.chat.id;
    const { sells } = await getDataBuyCoin();
    new Promise((resolve, reject) => {
        sells.forEach((data, index) => {
            bot.sendMessage(
                chatId,
                `
        <b>STT: ${index + 1}</b>
        <b>Id : ${data._id}</b>
        <b>Email: ${data.buyer.gmailUSer}</b>
        <b>Rank: ${data.buyer.rank}</b>
        <b>Amount: ${data.amount}</b>
        <b>Type: ${data.symbol}</b>
        <b>Fee: ${data.fee}</b>
        <b>Status: ${data.status}</b>
      `,
                { parse_mode: 'HTML' }
            );
        });
        resolve('OK');
    }).then((val) => {
        status = 'ConfirmBuyCoin';
    });
});

bot.onText(/\/list_sell_coin/, async (msg) => {
    const chatId = msg.chat.id;
    const { sells } = await getDataSellCoin();
    new Promise((resolve, reject) => {
        sells.forEach((data, index) => {
            bot.sendMessage(
                chatId,
                `
        <b>STT: ${index + 1}</b>
        <b>Id : ${data._id}</b>
        <b>Email: ${data.buyer.gmailUSer}</b>
        <b>Rank: ${data.buyer.rank}</b>
        <b>Amount: ${data.amount}</b>
        <b>Type: ${data.symbol}</b>
        <b>Fee: ${data.fee}</b>
        <b>Status: ${data.status}</b>
      `,
                { parse_mode: 'HTML' }
            );
        });
        resolve('OK');
    }).then((val) => {
        status = 'ConfirmSellCoin';
    });
});

let scriptWarn = ['/list_buy_coin', '/list_sell_coin'];

const handleConfirmBuyCoin = async (id, status) => {
    const data = await axios.put(
        `http://localhost:4000/admin/handleBuyCoinBot/${id}`,
        { status: status }
    );
    return data.data;
};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.includes(scriptWarn)) {
        const raw = msg.text.split(' ');
        if (status === 'ConfirmBuyCoin' && raw[0] === 'ConfirmBuyCoin') {
            const idOrder = raw[1];
            const statusOrder = raw[2];

            const order = {
                chatId: chatId,
                idOrder: idOrder,
                statusOrder: statusOrder == 'on_hold' ? 'On hold' : statusOrder
            };
            const res = await handleConfirmBuyCoin(
                idOrder,
                statusOrder == 'on_hold' ? 'On hold' : statusOrder
            );
            if (res.code === 0) {
                bot.sendMessage(
                    chatId,
                    JSON.stringify(order) + '. ' + res.message
                );
            } else {
                bot.sendMessage(
                    chatId,
                    JSON.stringify(order) + '. ' + res.message
                );
            }
        }
    }
});
