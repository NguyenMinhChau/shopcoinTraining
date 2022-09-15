const mongoose = require('mongoose');

const { Schema } = mongoose;

const transSchema = new Schema(
	{
		code: { type: String},
		amount: { type: Number, required: true },
		sell: { type: Number, default: 0 },
		amountUsd: { type: Number, required: true },
		symbol: { type: String, required: true },
		logo: { type: String },
		lastPrice: { type: Number },
		fee: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ['Completed', 'Pending', 'Canceled', 'Confirm'],
			default: 'Pending',
		},
		buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		type: {
			type: String,
			enum: ['buyfuture', 'sellfuture', 'admin'],
			required: true,
		},
		orderNumber: { type: String },
		note: { type: String },
	},
	{ timestamps: true },
);

// transSchema.index({createdAt: 1}, {expireAfterSeconds: 60})


module.exports = mongoose.model('Trans', transSchema);
