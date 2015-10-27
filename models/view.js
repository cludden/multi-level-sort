var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var view = new Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    categories: [{
        id: {
            type: Number,
            required: true
        },
        behind: {
            type: Number
        },
        groups: [{
            id: {
                type: Number,
                required: true
            },
            behind: {
                type: Number
            },
            kpis: [{
                id: {
                    type: Number,
                    required: true
                },
                behind: {
                    type: Number
                }
            }]
        }]
    }]
});

module.exports = mongoose.model('view', view);