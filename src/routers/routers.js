const routers = {
    // ADMIN ROUTERS
    home: '/',
    login: '/login',
    register: '/register',
    forgotPwd: '/forgot-password',
    dashboard: '/dashboard',
    payment: '/payment',
    rate: '/rate',
    settingCoin: '/setting-coin',
    newcoin: 'add-new-coin',
    editCoin: 'edit-coin',
    deposits: '/deposits',
    depositsDetail: 'deposit-detail',
    withdraw: '/withdraw',
    withdrawDetail: 'withdraw-detail',
    buy: '/buy',
    buyDetail: 'buy-detail',
    sell: '/sell',
    sellDetail: 'sell-detail',
    user: '/user',

    // USER ROUTERS
    homeUser: '/',
    buyCoinUser: '/',
    myCoinUser: '/my-coin',
    sellCoinUser: '/my-coin',
    buyHistoryUser: '/buy-history',
    sellHistoryUser: '/sell-history',
    depositUser: '/deposit',
    createDepositUser: '/create-deposit',
    singleDepositUser: '/single-deposit',
    withdrawUser: '/withdraw',
    createWithdrawUser: '/create-withdraw',
    singleWithdrawUser: '/single-withdraw',
    profileUser: '/profile',
    profilePaymentUser: '/profile-payment',
    uploadDocumentUser: '/upload-document',
    changePwdUser: '/change-password',
    resetPwdUser: '/reset-password',
    contactUser: '/contact',
    liveChatUser: '/live-chat',
    pageNotFound: '*',
};

export default routers;