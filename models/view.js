var async = require('async'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
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
    level: {
        type: String
    },
    children: [{
        childId: {
            type: Number,
            required: true
        },
        level: {
            type: String
        },
        children: [{
            childId: {
                type: Number,
                required: true
            },
            level: {
                type: String
            },
            children: [{
                childId: {
                    type: Number,
                    required: true
                },level: {
                    type: String
                }
            }]
        }]
    }]
});

view.statics.move = function(viewId, moving, inFrontOf, cb) {
    var self = this;
    
    // convert string paths to array paths ('11.1.63' becomes [11,1,63])
    [moving, inFrontOf].forEach(function(path) {
        path = path.split('.').map(function(n) {
            if (n !== 'null' && n !== '') return parseInt(n);
            return null;
        });
    });
    
    // verify 'moving' and 'inFrontOf' paths are the same depth (categories, groups, or kpis)
    if (moving.length !== inFrontOf.length) return cb(new Error('Invalid arguments: moving and behind must be same depth'));

    // verify that 'moving' and 'inFrontOf' paths are equal up until the last position
    // categories can only move within a view, groups within a category, and kpis within a group
    var initialMoving = _.initial(moving),
        initialInFrontOf = _.initial(inFrontOf),
        theSame = initialMoving.every(function(item, i) {
            return initialInFrontOf[i] === item;
        });
    if (initialMoving.length && !theSame) return cb(new Error('Invalid arguments: items can only be moved within the same depth'));
    
    // update the view
    async.waterfall([
        // find the view
        function findView(fn) {
            self.findOne({_id: viewId}, fn);
        },
        
        // sort it
        function sortCategory(view, fn) {
            move(view.children, initialMoving, _.last(moving), _.last(inFrontOf), function(err) {
                if (err) return fn(err);
                fn(null, view);
            });
        },
        
        // persist the new sort
        function updateView(view, fn) {
            self.update(viewId, view, fn);
        }
        
        // handle the response
    ], function(err, view) {
        if (err) return cb(err);
        cb(null, view)
    });
};

function move(collection, path, moving, inFrontOf, cb) {
    if (!path.length) {
        var currentIndex = _.findIndex(collection, function(item) {
                return item.childId === moving;
            }),
            newIndex = inFrontOf === null ? collection.length : _.findIndex(collection, function(item) {
                return item.childId === inFrontOf;
            });
        
        if (newIndex > 0) newIndex--;
        _move.call(collection, currentIndex, newIndex);
        return cb();
    }
    
    var childId = path.shift(),
        childContainer = _.find(collection, function(item) {
            return item.childId === childId;
        });
    if (!childContainer) {
        return cb(new Error('Unable to find child container with id ' + childId));
    }
    if (!childContainer.children) {
        return cb(new Error('Unable to locate child collection on child container'));
    }
    return move(childContainer.children, path, moving, inFrontOf, cb);
}

function _move(old_index, new_index) {
    while (old_index < 0) {
        old_index += this.length;
    }
    while (new_index < 0) {
        new_index += this.length;
    }
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
}

module.exports = mongoose.model('view', view);