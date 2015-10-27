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
        var view = results.view;
        view.create({
            name: 'Favorites',
            user: 1,
            categories: [{
                id: 11,
                behind: null,
                groups: [{
                    id: 1,
                    behind: null,
                    kpis: [{
                        id: 68,
                        behind: null
                    },{
                        id: 69,
                        behind: 68
                    }]
                }]
            },{
                id: 1,
                behind: 11,
                groups: [{
                    id: 1,
                    behind: null,
                    kpis: [{
                        id: 2,
                        behind: null
                    }]
                }]
            },{
                id: 8,
                behind: 1,
                groups: [{
                    id: 4,
                    behind: null,
                    kpis: [{
                        id: 54,
                        behind: null
                    }]
                },{
                    id: 2,
                    behind: 4,
                    kpis: [{
                        id: 54,
                        behind: null
                    }]
                }]
            }]
        }, fn);
    }],

    moveCategory: ['createView', function(fn, results) {
        var view = results.view,
            viewId = results.createView.id;
        view.update({
            id: viewId,
            'categories.id': 1
        },{
            '$set': {
                'categories.$.behind': null
            }
        }, fn);
    }]
}, function(err, results) {
    if (err) {
        return console.log('error', err);
    }
    return console.log(results.count);
});

