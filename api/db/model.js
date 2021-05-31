const { Schema, model } = require('mongoose');
const random = require('mongoose-simple-random');
const paginate = require('mongoose-paginate-v2');

const InfoSchema = new Schema({
	permalink: { type: String, required: true },
	lang: { type: String, required: true },
	title: { type: String, required: true },
	cover: { type: String, required: true },
	author: { type: String, required: true },
	pompadour: { type: String, required: true },
	type: { type: String, required: true },
	sections: [
		Schema({ title: { type: String, required: true }, content: { type: String, required: true } }, { _id: false })
	]
}, {
	collection: process.env['MONGO.TABLE'],
	timestamps: true
});

InfoSchema.plugin(random);
InfoSchema.plugin(paginate);

module.exports.Info = model('Info', InfoSchema);