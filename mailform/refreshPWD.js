const refreshPWD = (username, pwd) => `
<div style="max-width: 600px;">
<p>Dear: <strong>${username}</strong></p>

<div style="max-width:300px; padding:15px;display: block;
margin-left: auto;
margin-right: auto; border: 1px solid #111; font-size: 28px; color:#111; font-weight: 600; text-align: center">This is your password: ${pwd}</div>

<p>Kind Regards,</p>

<p>Tranasaction Support Team</p>

</div>
`;
module.exports = { refreshPWD };
