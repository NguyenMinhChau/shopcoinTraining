const accountCreated = (email, username) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>Congratulations! Your COIN account has been created successfully.</p>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>
`;

const appForgotPass = (username, code) => `
<div>
<p>Dear: <strong>${username}</strong></p>

<p>You have requested to reset your password, to continue Please copy this code and paste at confirm step.</p>

<div style="max-width:300px; padding:15px;display: block;
margin-left: auto;
margin-right: auto; border: 1px solid #111; font-size: 28px; color:#111; font-weight: 600; text-align: center">${code}</div>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>`;

const PassChanged = (username) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<p>Congratulations! Your new password has been changed successfully.</p>

<p>If you have any questions about trading with <strong>SHOPCOINUSA</strong>, do not hesitate to contact our Support team via <a href="#">Live Chat</a> or <a href="mailto:paymentshopcoinusa@gmail.com">email.</a></p>

<p>Kind Regards,</p>

<p>Shopcoin Support Team</p>

</div>`;

module.exports = {
    accountCreated,
    appForgotPass,
    PassChanged
};
