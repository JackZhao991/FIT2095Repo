const mongoose = require('mongoose');
const moment = require('moment');

let authorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String,
    },
    dob: {
        type: Date,
        get: function (newDob) {
            return moment(newDob).format('DD-MM-YYYY');
        }
    },
    address: {
        state: {
            type: String,
            minlength: 2,
            maxlength: 3
        },
        suburb: String,
        street: String,
        unit: String
    },
    numBooks: {
        type: Number,
        validate: {
            validator: function (num) {
                return Number.isInteger(num) && num >= 1 && num <= 150;
            },
            message: 'Number must be an integer between 1 and 150 inclusive'
        }
    }
});

module.exports = mongoose.model('Author', authorSchema);