const depositMail = () => 'Thanks for deposit';

const depositSuccess = (username, amount) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>We would like to confirm that we have received your deposit request, details of which can be found below:</p>

<h3>Deposit Amount: ${amount} USD</h3>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

module.exports = { depositMail, depositSuccess };
