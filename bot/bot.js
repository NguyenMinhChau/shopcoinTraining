const axios = require('axios');

const { bot, formatUSD, precisionRound } = require('../function');
const User = require('../models/User');

// const { URL_API } = process.env;
let URL_API = `http://localhost:4000`;
let chatId = -756899178;
// let idAdmin = 1172210542;
let idAdmin = 5752059699;

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

const handleCreateUser = async (bot, chatId, raw) => {
    const username = raw[1];
    const email = raw[2];
    const password = raw[3];

    axios
        .post(`${URL_API}/users/createUser`, {
            username: username,
            email: email,
            password: password
        })
        .then((res) => {
            if (res.data) {
                if (res.data.code == 0) {
                    let message = res.data.message;
                    bot.sendMessage(chatId, `<b>${message.toUpperCase()}</b>`, {
                        parse_mode: 'HTML'
                    });
                } else {
                    bot.sendMessage(
                        chatId,
                        `<b>Create User Fail</b>\n<b>${res.data.message}</b>
                        `,
                        {
                            parse_mode: 'HTML'
                        }
                    );
                }
            }
        })
        .catch((err) => {
            bot.sendMessage(chatId, `<b>Error</b><b>${err.message}</b>`, {
                parse_mode: 'HTML'
            });
        });
};

const get_balance_user = async (id) => {
    const balance = await axios.get(
        `http://localhost:4000/users/getBalance/${id}`
    );
    return balance;
};

const get_coin_user = async (id, symbol) => {
    const coin = await axios.post(
        `http://localhost:4000/users/getCoinBySymbol/${id}`,
        {
            coin: symbol
        }
    );
    return coin.data;
};

const handleChangeCoin = async (bot, chatId, id, amount, symbol) => {
    let url = `http://localhost:4000/admin`;
    if (symbol == 'USDT') {
        axios
            .put(`${url}/changeCoinBot/${id}`, {
                coin: symbol,
                quantity: amount,
                createBy: 'admin'
            })
            .then(async (res) => {
                if (res.data) {
                    if (res.data.code == 0) {
                        let message = res.data.message;
                        const getBalance = await get_balance_user(id);
                        // console.log(getBalance);
                        bot.sendMessage(
                            chatId,
                            `<b>${message.toUpperCase()}</b> \n <b>Balance ${formatUSD(
                                getBalance.data.data.balance
                            )}</b>`,
                            { parse_mode: 'HTML' }
                        );
                    } else {
                        bot.sendMessage(
                            chatId,
                            `<b>Change Coin ${symbol} failed with quantity = ${Math.abs(
                                amount
                            )}</b> \n <b>${res.data.message}</b>`,
                            { parse_mode: 'HTML' }
                        );
                    }
                }
            })
            .catch((err) => {
                bot.sendMessage(
                    chatId,
                    `<b>Change Coin ${symbol} failed with quantity = ${Math.abs(
                        amount
                    )}</b> \n <b>${err.message}</b>`,
                    { parse_mode: 'HTML' }
                );
            });
    } else {
        axios
            .put(`${url}/changeCoinBot/${id}`, {
                coin: symbol,
                quantity: amount,
                createBy: 'admin'
            })
            .then(async (res) => {
                if (res.data) {
                    // console.log(res.data);
                    if (res.data.code == 0) {
                        let message = res.data.message;
                        const get_coin = await get_coin_user(id, symbol);
                        // console.log(get_coin);
                        if (get_coin.code == 0) {
                            bot.sendMessage(
                                chatId,
                                `<b>${message.toUpperCase()}</b> \n <b>${symbol}: ${
                                    get_coin.data[0].amount
                                }</b>`,
                                { parse_mode: 'HTML' }
                            );
                        } else {
                            bot.sendMessage(
                                chatId,
                                `<b>Subtract all coin of user with symbol ${symbol}</b>`,
                                { parse_mode: 'HTML' }
                            );
                        }
                    } else {
                        bot.sendMessage(
                            chatId,
                            `<b>Change Coin ${symbol} failed with quantity = ${Math.abs(
                                amount
                            )}</b> \n <b>${res.data.message}</b>`,
                            { parse_mode: 'HTML' }
                        );
                    }
                }
            })
            .catch((err) => {
                bot.sendMessage(
                    chatId,
                    `<b>Change Coin ${symbol} failed with quantity = ${Math.abs(
                        amount
                    )}</b> \n <b>${err.message}</b>`,
                    { parse_mode: 'HTML' }
                );
            });
    }
};

const handleBuySellCoin = async (
    bot,
    chatId,
    email,
    amount,
    symbol,
    price,
    type,
    fee
) => {
    let url = `http://localhost:4000`;
    if (type == 'BuyCoin') {
        axios
            .post(`${url}/users/BuyCoinBot`, {
                gmailUser: email,
                amount: amount,
                amountUsd: precisionRound(
                    parseFloat(amount) *
                        parseFloat(price) *
                        (1 + parseFloat(fee))
                ),
                symbol: symbol,
                price: price,
                type: type
            })
            .then(async (res) => {
                if (res.data) {
                    let result = res.data;
                    if (result.code == 0) {
                        const bill = result.data.billInfo;
                        const completeBuyCoin = await handleConfirmBuyCoin(
                            bill._id,
                            'Completed'
                        );
                        if (completeBuyCoin.code == 0) {
                            bot.sendMessage(
                                chatId,
                                `<b>SUCCESSFULLY!!</b>\n<b>${completeBuyCoin.message.toUpperCase()}</b>`,
                                { parse_mode: 'HTML' }
                            );
                        } else {
                            bot.sendMessage(
                                chatId,
                                `${completeBuyCoin.message}`,
                                { parse_mode: 'HTML' }
                            );
                        }
                    } else {
                        bot.sendMessage(chatId, `${result.message}`);
                    }
                }
            })
            .catch((err) => {
                bot.sendMessage(chatId, `${err.message}`);
            });
    } else if (type == 'SellCoin') {
        axios
            .post(`${url}/users/SellCoinBot`, {
                gmailUser: email,
                amount: amount,
                amountUsd: precisionRound(
                    parseFloat(amount) *
                        parseFloat(price) *
                        (1 + parseFloat(fee))
                ),
                symbol: symbol,
                price: price,
                type: type
            })
            .then(async (res) => {
                if (res.data) {
                    let result = res.data;
                    if (result.code == 0) {
                        const bill = result.data.billInfo;
                        const completeSellCoin = await handleConfirmSellCoin(
                            bill._id,
                            'Completed'
                        );
                        if (completeSellCoin.code == 0) {
                            bot.sendMessage(
                                chatId,
                                `<b>SUCCESSFULLY!!</b>\n<b>${completeSellCoin.message.toUpperCase()}</b>`,
                                { parse_mode: 'HTML' }
                            );
                        } else {
                            bot.sendMessage(
                                chatId,
                                `${completeSellCoin.message}`,
                                { parse_mode: 'HTML' }
                            );
                        }
                    } else {
                        bot.sendMessage(chatId, `${result.message}`);
                    }
                }
            })
            .catch((err) => {
                bot.sendMessage(chatId, `${err.message}`);
            });
    } else {
        bot.sendMessage(chatId, `Method ${type} is not valid`);
    }
};

bot.on('message', async (msg) => {
    const chatIdUser = msg.chat.id;
    if (chatIdUser == chatId) {
    } else if (chatIdUser == idAdmin) {
        const rawText = msg.text.split(';');
        if (rawText[0] == 'newuser') {
            if (rawText.length == 4) {
                handleCreateUser(bot, chatIdUser, rawText);
            } else {
                bot.sendMessage(chatIdUser, `newuser;username;email;pass`);
            }
        } else if (rawText[0] == 'addbalance') {
            if (rawText.length == 3) {
                const userFind = await User.findOne({
                    'payment.email': rawText[1]
                });
                if (userFind) {
                    handleChangeCoin(
                        bot,
                        chatIdUser,
                        userFind._id,
                        rawText[2],
                        'USDT'
                    );
                } else {
                    bot.sendMessage(
                        chatIdUser,
                        `<b>Error Change Coin failed</b> \n <b>${rawText[1]} is valid ?</b>`,
                        { parse_mode: 'HTML' }
                    );
                }
            } else {
                bot.sendMessage(chatIdUser, `addbalance;email;amount`);
            }
        } else if (rawText[0] == 'addcoin') {
            const userFind = await User.findOne({
                'payment.email': rawText[1]
            });
            if (rawText.length == 4) {
                if (userFind) {
                    handleChangeCoin(
                        bot,
                        chatIdUser,
                        userFind._id,
                        rawText[3],
                        `${rawText[2].toUpperCase()}USDT`
                    );
                    // bot.sendMessage(chatIdUser, JSON.stringify(userFind._id));
                } else {
                    bot.sendMessage(
                        chatIdUser,
                        `<b>Error Change Coin failed</b> \n <b>${rawText[1]} is valid ?</b>`,
                        { parse_mode: 'HTML' }
                    );
                }
            } else {
                bot.sendMessage(chatIdUser, `addcoin;email;symbol;amount`);
            }
        } else if (rawText[0] == 'buy') {
            let email = rawText[1];
            let symbol = rawText[2];
            let amount = rawText[3];
            let price = rawText[4];
            if (rawText.length == 5) {
                const userFind = await User.findOne({ 'payment.email': email });
                if (userFind) {
                    handleBuySellCoin(
                        bot,
                        chatIdUser,
                        email,
                        amount,
                        `${symbol.toUpperCase()}USDT`,
                        price,
                        'BuyCoin',
                        userFind.fee
                    );
                } else {
                    bot.sendMessage(
                        chatIdUser,
                        `User is not valid with email = ${email}`
                    );
                }
            } else {
                bot.sendMessage(chatIdUser, `buy;email;symbol;amount;price`);
            }
        } else if (rawText[0] == 'sell') {
            let email = rawText[1];
            let symbol = rawText[2];
            let amount = rawText[3];
            let price = rawText[4];
            if (rawText.length > 0) {
                const userFind = await User.findOne({ 'payment.email': email });
                if (userFind) {
                    handleBuySellCoin(
                        bot,
                        chatIdUser,
                        email,
                        amount,
                        `${symbol.toUpperCase()}USDT`,
                        price,
                        'SellCoin',
                        userFind.fee
                    );
                } else {
                    bot.sendMessage(
                        chatIdUser,
                        `User is not valid with email = ${email}`
                    );
                }
            } else {
                bot.sendMessage(chatIdUser, `sell;email;symbol;amount;price`);
            }
        }
    } else {
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

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `chat Id: ${msg.chat.id}`);
});
