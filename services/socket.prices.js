const { default: axios } = require('axios');
const Coins = require('../models/Coins');

const { getBinance } = require('../function');

const binance = getBinance();

const getCoinSocketFuturePriceNotValid = async (symbol) => {
    let p = new Promise((resolve, reject) => {
        axios
            .get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
            .then((result) => {
                if (result.data) {
                    const data = {
                        symbol: result.data.symbol,
                        price: result.data.lastPrice
                    };
                    resolve(data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    });
    return p;
};

module.exports = async (io) => {
    const coinsFound = await Coins.find({});
    const coinsDatabase = coinsFound.reduce((acc, coin) => {
        acc.push(coin.symbol);
        return acc;
    }, []);
    // console.log(coins);
    const listExcept = ['CAKEUSDT', 'MINAUSDT', 'TFUELUSDT'];
    setInterval(() => {
        listExcept.forEach(async (coin) => {
            const data = await getCoinSocketFuturePriceNotValid(coin);
            io.emit(`send-data-${coin}`, data);
        });
    }, 5000);
    binance.futuresMarkPriceStream((result) => {
        const coins = result.reduce((acc, coin) => {
            acc.push({
                symbol: coin.symbol,
                price: coin.markPrice
            });
            return acc;
        }, []);
        const coinResult = coins
            .filter((coin) => {
                if (coinsDatabase.includes(coin.symbol)) {
                    return coin;
                }
            })
            .reduce((prev, after) => {
                prev.push(after);
                return prev;
            }, []);
        coinResult.forEach((data) => {
            io.emit(`send-data-${data.symbol}`, data);
        });
    });
};
