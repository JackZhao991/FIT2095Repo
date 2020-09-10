const mongoose = require('mongoose');
const moment = require('moment');

let bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    isbn: {
        type: String,
        validate: {
            validator: function (isbnString) {
                return isbnString.length === 13;
            },
            message: 'ISBN must be 13 digits'
        }
    }, 
    published: {
        type: Date,
        default: Date.now,
        get: function (newDate) {
            return moment(newDate).format('DD-MM-YYYY');
        }
    }, 
    summary: String
});

module.exports = mongoose.model('Book', bookSchema);