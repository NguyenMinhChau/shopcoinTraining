const axios = require('axios');

const { bot } = require('../function');

// const { URL_API } = process.env;
let URL_API = `http://localhost:4000`;
let chatId = -756899178;

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

const getDataWithdraw = async () => {
    return getData(`${URL_API}/admin/getAllWithdraw/`);
};

const getDataCoin = async () => {
    return getData(`${URL_API}/coins/getAllCoin`);
};

let status = '';

// bot.onText(/\/list_buy_coin/, async (msg) => {
//     const chatId = msg.chat.id;
//     const { data } = await getDataBuyCoin();
//     new Promise((resolve, reject) => {
//         data.forEach((data, index) => {
//             bot.sendMessage(
//                 chatId,
//                 `
//         <b>STT: ${index + 1}</b>
//         <b>Id : ${data._id}</b>
//         <b>Email: ${data.buyer.gmailUSer}</b>
//         <b>Rank: ${data.buyer.rank}</b>
//         <b>Amount: ${data.amount}</b>
//         <b>Type: ${data.symbol}</b>
//         <b>Fee: ${data.fee}</b>
//         <b>Status: ${data.status}</b>
//       `,
//                 { parse_mode: 'HTML' }
//             );
//         });
//         resolve('OK');
//     }).then((val) => {
//         status = 'ConfirmBuyCoin';
//     });
//     console.log(chatId);
//     // bot.sendMessage(chatId, "Hello")
// });

// bot.onText(/\/list_sell_coin/, async (msg) => {
//     const chatId = msg.chat.id;
//     const { data } = await getDataSellCoin();
//     new Promise((resolve, reject) => {
//         data.forEach((data, index) => {
//             bot.sendMessage(
//                 chatId,
//                 `
//         <b>STT: ${index + 1}</b>
//         <b>Id : ${data._id}</b>
//         <b>Email: ${data.buyer.gmailUSer}</b>
//         <b>Rank: ${data.buyer.rank}</b>
//         <b>Amount: ${data.amount}</b>
//         <b>Type: ${data.symbol}</b>
//         <b>Fee: ${data.fee}</b>
//         <b>Status: ${data.status}</b>
//       `,
//                 { parse_mode: 'HTML' }
//             );
//         });
//         resolve('OK');
//     }).then((val) => {
//         status = 'ConfirmSellCoin';
//     });
// });

// bot.onText(/\/list_deposit/, async (msg) => {
//     const chatId = msg.chat.id;
//     const { data } = await getDataDeposit();
//     new Promise((resolve, reject) => {
//         data.forEach((data, index) => {
//             bot.sendMessage(
//                 chatId,
//                 `
//             <b>STT: ${index + 1}</b>
//             <b>Id : ${data._id}</b>
//             <b>Email: ${data.user}</b>
//             <b>Code: ${data.code}</b>
//             <b>Amount: ${data.amount}</b>
//             <b>Bank Name: ${data.method.methodName}</b>
//             <b>Name account: ${data.method.accountName}</b>
//             <b>Number account: ${data.method.accountNumber}</b>
//             <b>Transform: ${data.method.transform.toLocaleString('it-IT', {
//                 style: 'currency',
//                 currency: 'VND'
//             })}</b>
//             <b>Amount USDT: ${data.amountUsd}</b>
//             <b>Status: ${data.status}</b>
//             `,
//                 { parse_mode: 'HTML' }
//             );
//         });
//         resolve('OK');
//     }).then((val) => {
//         status = 'ConfirmDeposit';
//     });
// });

// bot.onText(/\/list_withdraw/, async (msg) => {
//     const chatId = msg.chat.id;
//     const { data } = await getDataWithdraw();
//     // console.log(data);
//     new Promise((resolve, reject) => {
//         data.forEach((data, index) => {
//             bot.sendMessage(
//                 chatId,
//                 `
//             <b>STT: ${index + 1}</b>
//             <b>Id : ${data._id}</b>
//             <b>Email: ${data.user}</b>
//             <b>Code: ${data.code}</b>
//             <b>Amount: ${data.amount}</b>
//             <b>Bank Name: ${data.method.methodName}</b>
//             <b>Name account: ${data.method.accountName}</b>
//             <b>Number account: ${data.method.accountNumber}</b>
//             <b>Transform: ${data.method.transform.toLocaleString('it-IT', {
//                 style: 'currency',
//                 currency: 'VND'
//             })}</b>
//             <b>Amount USDT: ${data.amountUsd}</b>
//             <b>Status: ${data.status}</b>
//             `,
//                 { parse_mode: 'HTML' }
//             );
//         });
//         resolve('OK');
//     }).then((val) => {
//         status = 'ConfirmWithdraw';
//     });
// });

// bot.onText(/\/list_coin/, async (msg) => {
//     const chatId = msg.chat.id;
//     const { data } = await getDataCoin();
//     // console.log(data);
//     new Promise((resolve, reject) => {
//         data.forEach((data, index) => {
//             bot.sendMessage(
//                 chatId,
//                 `
//             <b>STT: ${index + 1}</b>
//             <b>Id : ${data._id}</b>
//             <b>Name: ${data.name}</b>
//             <b>Symbol: ${data.symbol}</b>
//             <b>Full Name Coin: ${data.fullName}</b>
//             `,
//                 { parse_mode: 'HTML' }
//             );
//         });
//         resolve('OK');
//     }).then((val) => {
//         status = 'ConfirmCoin';
//     });
// });

let scriptWarn = ['/list_buy_coin', '/list_sell_coin', '/list_deposit'];

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
    if (!msg.text.includes(scriptWarn)) {
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
    }
});
