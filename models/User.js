const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const user = new Schema(
    {
        Wallet: {
            balance: { type: Number, default: 0.0 },
            deposit: { type: Number, default: 0.0 },
            withdraw: { type: Number, default: 0.0 },
            pending: { type: Number, default: 0.0 }
        },
        payment: {
            bank: {
                bankName: { type: String, default: '' },
                name: { type: String, default: '' },
                account: { type: String, default: '' }
            },
            private: { type: Boolean, default: false },
            rule: { type: String, default: 'user' },
            email: { type: String, default: '', unique: true },
            password: { type: String, default: '' },
            username: { type: String, default: '' },
            code: { type: String, default: '' }
        },
        rank: { type: String, default: 'Standard' },
        changeBalance: { type: Number, default: 0.0 },
        uploadCCCDFont: { type: String, default: '' },
        uploadCCCDBeside: { type: String, default: '' },
        uploadLicenseFont: { type: String, default: '' },
        uploadLicenseBeside: { type: String, default: '' },
        blockUser: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const Users = model('Users', user);

module.exports = Users;
