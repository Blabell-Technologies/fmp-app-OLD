const print = require('../../lib/logger.class.lib');
const mongoose = require('mongoose');

module.exports.connection = () => {
    mongoose.set('useFindAndModify', false);
    mongoose.connect(process.env['MONGO.URL'], {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }, (error) => {
        if (error) return print.error(error);
        print.info('Database connected successfully');
    })
}