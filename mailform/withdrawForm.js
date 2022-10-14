const confirmWithdraw = (username, code) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>To complete your withdraw, Please copy this code and paste at confirm step.</p>

<div style="max-width:300px; padding:15px;display: block;
margin-left: auto;
margin-right: auto; border: 1px solid #111; font-size: 28px; color:#111; font-weight: 600; text-align: center">${code}</div>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

const withdrawMail = (username, amount) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>We have successfully received your withdrawal request from SHOPCOIN.</p>

<h3>Amount: ${amount} USD</h3>

<p>Please note that it may take 2-5 days for funds to appear in your bank account, depending on your bank.</p>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

const withdrawSuccess = (username, amount) => `
<div>
<p>Dear: <strong>${username}</strong></p>

<p>We have successfully processed your withdrawal request from SHOPCOIN to your nominated bank account.</p>

<h3>Amount: ${amount} USD</h3>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

module.exports = { confirmWithdraw, withdrawMail, withdrawSuccess };
