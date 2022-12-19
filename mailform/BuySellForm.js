const { precisionRound, formatUSD } = require('../function');
const transMail = () => 'Thanks for new buycoin order';

const transSuccess = (username, trans) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>You have Bought coin successfully. Here are the details:</p>

<h3>Name Coin: ${trans.symbol.replace('USDT', '')}</h3>

<h3>Amount: ${trans.amount}</h3>

<h3>Price: ${trans.price}</h3>

<h3>Total Price: ${formatUSD(
    precisionRound(
        precisionRound(
            parseFloat(trans.fee) *
                parseFloat(trans.amount) *
                parseFloat(trans.price)
        ) + trans.amountUsd
    )
)}</h3>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

const sellMail = () => 'Thanks for new sellcoin order';

const sellSuccess = (username, sell) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>You have sold coins successfully. Here are the details:</p>

<h3>Name Coin: ${sell.symbol.replace('USDT', '')}</h3>

<h3>Amount: ${sell.amount}</h3>

<h3>Price: ${sell.price}</h3>

<h3>Total Price: ${formatUSD(
    precisionRound(
        precisionRound(
            parseFloat(sell.fee) *
                parseFloat(sell.amount) *
                parseFloat(sell.price)
        ) + sell.amountUsd
    )
)}</h3>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

module.exports = { transMail, transSuccess, sellMail, sellSuccess };
