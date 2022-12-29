// import Libs
const { default: axios } = require('axios');
const {
    getBinance,
    logger,
    loggerBuyCoin,
    loggerSellCoin,
    formatUSD
} = require('../function');

// import Models
const BillModels = require('../models/Bills');
const BinanceModel = require('../models/Binance');

const binance = getBinance();

const autoCreateBillHandleBuySellBinance = async () => {
    const orderPending = await BillModels.find({
        status: 'Pending'
    })
        .sort({ createdAt: 'desc' })
        .limit(10);

    if (orderPending) {
        if (orderPending.length == 0) {
            logger.info('No data');
        } else {
            orderPending.forEach(async (order) => {
                const checkOrder = await BinanceModel.findOne({
                    idOrder: order._id
                });
                if (!checkOrder) {
                    const newOrderBinance = new BinanceModel({
                        idOrder: order._id
                    });
                    newOrderBinance
                        .save()
                        .then(async (bill) => {
                            return await bill.populate(
                                'idOrder',
                                '-_id -__v -buyer._id'
                            );
                        })
                        .then((overView) => {
                            // logger.info(overView);
                            if (overView.idOrder.type == 'SellCoin') {
                                loggerSellCoin.info(overView);
                            } else if (overView.idOrder.type == 'BuyCoin') {
                                loggerBuyCoin.info(overView);
                            } else {
                                logger.info(
                                    'Type of bill is not true : ' +
                                        JSON.stringify(overView)
                                );
                            }
                        })
                        .catch((err) => {
                            logger.error(err);
                        });
                } else {
                    logger.warn(`Order is already`);
                }
            });
        }
    } else {
        logger.warn('No order sell data');
    }
};

const completedBuy = async (id) => {
    let p = new Promise(async (resolve, reject) => {
        const cBuy = axios
            .put(`http://localhost:4000/admin/handleBuyCoinBot/${id}`, {
                status: 'Completed'
            })
            .then((result) => {
                if (result.data) {
                    resolve(cBuy.data);
                } else {
                    reject({
                        code: 1,
                        message: 'Something error on completedBuy'
                    });
                }
            })
            .catch((err) => {
                reject({
                    code: 1,
                    message: err.message
                });
            });
    });
    return p;
};

const buyFromMarket = async (symbol, amount, bill) => {
    try {
        binance
            .futuresMarketBuy(symbol, amount)
            .then((result1) => {
                let result = JSON.parse(JSON.stringify(result1));
                console.log(result);
                loggerBuyCoin.info(result);
                let idOrderFromBinance = result.orderId;
                binance
                    .futuresOrderStatus(symbol, { orderId: idOrderFromBinance })
                    .then(async (resultView1) => {
                        let resultView = JSON.parse(
                            JSON.stringify(resultView1)
                        );
                        console.log('Status of Binance after buy');
                        console.log(resultView);
                        let oldPrice = parseFloat(bill.idOrder.price);
                        bill.idOrderBinance = resultView.orderId;
                        bill.priceBinance = resultView.avgPrice;
                        bill.save();
                        // console.log('old price : ' + oldPrice);
                        let binancePrice = parseFloat(resultView.avgPrice);
                        // console.log('binance price : ' + binancePrice);
                        if (binancePrice > oldPrice) {
                            const billFind = await BillModels.findById(
                                bill.idOrder._id
                            );
                            if (billFind) {
                                billFind.price = binancePrice;
                                billFind.note = `Because the price of coin with symbol = ${symbol} is changed to ${binancePrice}.`;
                                billFind
                                    .save()
                                    .then(async (b) => {
                                        // console.log({
                                        //     code: 0,
                                        //     message:
                                        //         'Change Price and buy coin in binance successfully',
                                        //     data: b
                                        // });
                                        const completedBuyResult =
                                            await completedBuy(b._id);
                                        if (completedBuyResult) {
                                            console.log(completedBuy);
                                        }
                                    })
                                    .catch((err) => {
                                        console.log({
                                            code: 1,
                                            message: `Something error when save the bill after buying coin from binance at case binance price > order price. ${err.message}`
                                        });
                                    });
                            } else {
                                console.log({
                                    code: 1,
                                    message: `Can not find order buy with id = ${bill.idOrder._id}`
                                });
                            }
                        } else {
                            const billFind = await BillModels.findById(
                                bill.idOrder._id
                            );
                            if (billFind) {
                                billFind.price = oldPrice;
                                billFind.note = ``;
                                billFind
                                    .save()
                                    .then(async (b) => {
                                        // console.log({
                                        //     code: 0,
                                        //     message:
                                        //         'Change Price and buy coin in binance successfully at case binance price <= order price',
                                        //     data: b
                                        // });
                                        const completedBuyResult =
                                            await completedBuy(b._id);
                                        if (completedBuyResult) {
                                            console.log(completedBuy);
                                        }
                                    })
                                    .catch((err) => {
                                        console.log({
                                            code: 1,
                                            message: `Something error when save the bill after buying coin from binance at case binance price <= order price. ${err.message}`
                                        });
                                    });
                            } else {
                                console.log({
                                    code: 1,
                                    message: `Can not find order buy with id = ${bill.idOrder._id}`
                                });
                            }
                        }
                    })
                    .catch((err) => {
                        console.log({
                            code: 1,
                            message: err.message
                        });
                    });
            })
            .catch((err) => {
                console.log({
                    code: 1,
                    message: err.message
                });
            });
        // console.log (symbol);
    } catch (err) {
        console.log({
            code: 1,
            message: err.message
        });
    }
};

const buy_from_market_v1 = async (symbol, amount) => {
    let p = new Promise((resolve, reject) => {
        binance
            .futuresMarketBuy(symbol, amount)
            .then(async (billBuyFromBinance) => {
                let billAfterFormat = JSON.parse(
                    JSON.stringify(billBuyFromBinance)
                );
                resolve({
                    code: 0,
                    message: `Buy Coin ${symbol} from Binance successfully !!`,
                    data: billAfterFormat
                });
            })
            .catch((err) => {
                reject({
                    code: 1,
                    message: err.message
                });
            });
    });
    return p;
};

const get_detail_order_by_orderId = async (orderId) => {
    let p = new Promise((resolve, reject) => {
        binance
            .futuresOrderStatus(symbol, { orderId: orderId })
            .then(async (billStatus) => {
                let billStatusAfterFormat = JSON.parse(
                    JSON.stringify(billStatus)
                );
                resolve({
                    code: 0,
                    message: `Get status of orderID = ${orderId} from Binance successfully !!`,
                    data: billStatusAfterFormat
                });
            })
            .catch((err) => {
                reject({
                    code: 1,
                    message: err.message
                });
            });
    });
    return p;
};

const auto_handle_buy_coin = async (symbol, amount, bill_populated) => {
    let p = new Promise((resolve, reject) => {
        buy_from_market_v1(symbol, amount)
            .then(async (data) => {
                console.log(data);

                let billBuyFromBinance = data.data;
                let orderId = billBuyFromBinance.orderId;

                get_detail_order_by_orderId(orderId)
                    .then(async (bill_detail) => {
                        console.log(bill_detail);
                        let bill_detail_after_get = bill_detail.data;

                        let binancePrice = parseFloat(
                            bill_detail_after_get.avgPrice
                        ); // price after buy
                        let oldPrice = parseFloat(bill_populated.idOrder.price); // price of original order

                        bill_populated.idOrderBinance =
                            bill_detail_after_get.orderId;
                        bill_populated.priceBinance = binancePrice;

                        bill_populated
                            .save()
                            .then(async (bill) => {
                                const billFind = await BillModels.findById(
                                    bill_populated.idOrder._id
                                );
                                if (billFind) {
                                    if (binancePrice > oldPrice) {
                                        billFind.price = binancePrice;
                                        billFind.note = `Because the price of coin with symbol = ${symbol} is changed to ${binancePrice}.`;
                                        billFind
                                            .save()
                                            .then((b) => {
                                                completedBuy(b._id)
                                                    .then((z) => {
                                                        resolve({
                                                            code: 0,
                                                            data: z
                                                        });
                                                    })
                                                    .catch((err) => {
                                                        reject({
                                                            code: 1,
                                                            message: err.message
                                                        });
                                                    });
                                            })
                                            .catch((err) => {
                                                reject({
                                                    code: 1,
                                                    message: `Something error when save the bill after buying coin from binance at case binance price > order price. ${err.message}`
                                                });
                                            });
                                    } else {
                                        billFind.note = ``;
                                        billFind
                                            .save()
                                            .then((b) => {
                                                completedBuy(b._id)
                                                    .then((z) => {
                                                        resolve({
                                                            code: 0,
                                                            data: z
                                                        });
                                                    })
                                                    .catch((err) => {
                                                        reject({
                                                            code: 1,
                                                            message: err.message
                                                        });
                                                    });
                                            })
                                            .catch((err) => {
                                                reject({
                                                    code: 1,
                                                    message: `Something error when save the bill after buying coin from binance at case binance price > order price. ${err.message}`
                                                });
                                            });
                                    }
                                } else {
                                    reject({
                                        code: 1,
                                        message: `Can not find order buy with id = ${bill.idOrder._id} for handle completed buy coin in auto handle buy coin from binance`
                                    });
                                }
                            })
                            .catch((err) => {
                                reject({
                                    code: 1,
                                    message: err.message
                                });
                            });
                    })
                    .catch((err) => {
                        reject({
                            code: 1,
                            message: err.message
                        });
                    });
            })
            .catch((err) => {
                reject({
                    code: 1,
                    message: err.message
                });
            });
    });
    return p;
};

const sellFromMarket = async (symbol, amount) => {
    try {
        // binance
        //     .futuresMarketSell(symbol, amount)
        //     .then((result) => {
        //         console.log(result);
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });
        let result = {
            Hello: 'Hello'
        };
        return {
            code: 0,
            message: 'Sell Coin to Binanace successfully',
            data: result
        };
    } catch (err) {
        return {
            code: 1,
            message: err.message
        };
    }
};

const handleBinance = async () => {
    try {
        const orders = await BinanceModel.find({ status: 'Pending' });
        if (orders) {
            if (orders.length > 0) {
                orders.forEach(async (order) => {
                    const all_view_bill = await order.populate('idOrder');
                    // console.log(all_view_bill);
                    if (all_view_bill.idOrder.type == 'SellCoin') {
                        console.log('Sell Coin Bill Binance');
                        console.log(all_view_bill);
                    } else if (all_view_bill.idOrder.type == 'BuyCoin') {
                        // console.log('Buy Coin Bill Binance');
                        // console.log(all_view_bill);
                        let amount = all_view_bill.idOrder.amount;
                        let symbol = all_view_bill.idOrder.symbol;
                        buyFromMarket(symbol, amount, all_view_bill);
                        all_view_bill.status = 'Completed';
                        all_view_bill
                            .save()
                            .then((billView) => {
                                loggerBuyCoin.info(billView);
                            })
                            .catch((err) => {
                                loggerBuyCoin.info(err.message);
                            });
                    } else {
                        console.log('Not true format');
                    }
                });
            } else {
                logger.warn('No order');
            }
        } else {
            logger.warn('No order to test');
        }
    } catch (error) {
        logger.warn(error);
    }
};

const handle_binance_buy_sell_coin = async () => {
    try {
        const orders = await BinanceModel.find({ status: 'Pending' });
        if (orders) {
            if (orders.length > 0) {
                orders.forEach(async (order) => {
                    const all_view_bill = await order.populate('idOrder');

                    if (all_view_bill.idOrder.type == 'SellCoin') {
                        console.log('Sell Coin Bill Binance');
                        console.log(all_view_bill);
                    } else if (all_view_bill.idOrder.type == 'BuyCoin') {
                        let amount = all_view_bill.idOrder.amount;
                        let symbol = all_view_bill.idOrder.symbol;

                        auto_handle_buy_coin(symbol, amount, all_view_bill)
                            .then((result) => {
                                if (result.code == 0) {
                                    console.log(result);

                                    all_view_bill.status = 'Completed';
                                    all_view_bill
                                        .save()
                                        .then((billView) => {
                                            console.log(billView);
                                            loggerBuyCoin.info(billView);
                                        })
                                        .catch((err) => {
                                            throw err;
                                        });
                                }
                            })
                            .catch((err) => {
                                throw err;
                            });
                    } else {
                        console.log('Not true format');
                    }
                });
            } else {
                logger.warn('No order');
            }
        } else {
            logger.warn('No order to test');
        }
    } catch (error) {
        logger.warn(error);
    }
};

// BUY

binance.futuresBalance().then((value) => {
    console.log(value);
});

// binance
//     .futuresMarketBuy('OCEANUSDT', 500)
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// binance
//     .futuresOrderStatus('OCEANUSDT', { orderId: '4169340583' })
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// SELL
// binance
//     .futuresMarketSell('OCEANUSDT', 500)
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// binance
//     .futuresOrderStatus('OCEANUSDT', { orderId: '4169344091' })
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

module.exports = async (app) => {
    setInterval(() => {
        autoCreateBillHandleBuySellBinance();
        // handleBinance();
        // handle_binance_buy_sell_coin();
    }, 3000);
};
