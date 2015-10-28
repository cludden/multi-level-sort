var async = require('async'),
    mongoose = require('mongoose');

async.auto({
    mongoose: function(fn) {
        mongoose.connect('mongodb://root:password@localhost:27017/view-sort-test');
        mongoose.connection.on('open', function() {
            return fn(null, mongoose);
        });
    },

    view: ['mongoose', function(fn) {
        var view = require('./models/view');
        fn(null, view);
    }],

    clear: ['view', function(fn, results) {
        results.view.remove({}, fn);
    }],

    createView: ['view', function(fn, results) {
        var view = results.view,
            data = require('./fixtures/view');
        view.create(data, fn);
    }],

    updated: ['createView', function(fn, results) {
        var view = results.view,
            viewId = results.createView.id;
        
        view.move(viewId, '8.4', '8.', fn);
    }]
}, function(err, results) {
    if (err) {
        return console.log('error', err);
    }
    return console.log(results.updated);
});

