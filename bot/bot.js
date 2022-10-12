const axios = require('axios');

const TelegramBot = require('node-telegram-bot-api');

const { BOT_TELEGRAM_TOKEN, URL_API } = process.env;

const bot = new TelegramBot(BOT_TELEGRAM_TOKEN, { polling: true });

const getData = async (url) => {
    const data = await axios.get(url);
    return data.data;
};

const getDataBuyCoin = async () => {
    return getData(`${URL_API}/admin/getAllBuy/`);
};

const getDataSellCoin = async () => {
    return getData(`${URL_API}/admin/getAllSell/`);
};

const getDataDeposit = async () => {
    return getData(`${URL_API}/admin/getAllDeposit/`);
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

bot.onText(/\/list_deposit/, async (msg) => {
    const chatId = msg.chat.id;
    const { dataDeposit } = await getDataDeposit();
    new Promise((resolve, reject) => {
        dataDeposit.forEach((data, index) => {
            bot.sendMessage(
                chatId,
                `
            <b>STT: ${index + 1}</b>
            <b>Id : ${data._id}</b>
            <b>Email: ${data.user}</b>
            <b>Code: ${data.code}</b>
            <b>Amount: ${data.amount}</b>
            <b>Bank Name: ${data.method.methodName}</b>
            <b>Name account: ${data.method.accountName}</b>
            <b>Number account: ${data.method.accountNumber}</b>
            <b>Transform: ${data.method.transform.toLocaleString('it-IT', {
                style: 'currency',
                currency: 'VND'
            })}</b>
            <b>Amount USDT: ${data.amountUsd}</b>
            <b>Status: ${data.status}</b>
            `,
                { parse_mode: 'HTML' }
            );
        });
        resolve('OK');
    }).then((val) => {
        status = 'ConfirmDeposit';
    });
});

let scriptWarn = ['/list_buy_coin', '/list_sell_coin', '/list_deposit'];

const handleService = async (status, url) => {
    const data = await axios.put(url, { status: status });
    return data.data;
};

const handleConfirmBuyCoin = async (id, status) => {
    return handleService(
        status,
        `http://localhost:4000/admin/handleBuyCoinBot/${id}`
    );
};

const handleConfirmSellCoin = async (id, status) => {
    return handleService(
        status,
        `http://localhost:4000/admin/handleSellCoinBot/${id}`
    );
};

const handleDeposit = async (id, status) => {
    return handleService(
        status,
        `http://localhost:4000/admin/handleDepositBot/${id}`
    );
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
        } else if (
            status === 'ConfirmSellCoin' &&
            raw[0] === 'ConfirmSellCoin'
        ) {
            const idOrder = raw[1];
            const statusOrder = raw[2];

            const order = {
                chatId: chatId,
                idOrder: idOrder,
                statusOrder: statusOrder == 'on_hold' ? 'On hold' : statusOrder
            };
            const res = await handleConfirmSellCoin(
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
        } else if (status === 'ConfirmDeposit' && raw[0] === 'ConfirmDeposit') {
            const idOrder = raw[1];
            const statusOrder = raw[2];

            const order = {
                chatId: chatId,
                idOrder: idOrder,
                statusOrder: statusOrder == 'on_hold' ? 'On hold' : statusOrder
            };

            const res = await handleDeposit(
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
