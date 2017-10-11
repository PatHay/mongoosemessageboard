module.exports = function Route(app, server) {
    var mongoose = require('mongoose');
    
    mongoose.connect('mongodb://localhost/message_board');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
    var MessageSchema = new mongoose.Schema({
        name: {type: String, required: true, minlength: 4},
        text: String,
        _comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
       });
    MessageSchema.path('name').required(true, 'Name cannot be blank');
    MessageSchema.path('text').required(true, 'Message cannot be blank');
    var CommentSchema = new mongoose.Schema({
        name: {type: String, required: true, minlength: 4},
        text: String,
        _message: {type: Schema.Types.ObjectId, ref: "Message"},
    });
    CommentSchema.path('name').required(true, 'Name cannot be blank');
    CommentSchema.path('text').required(true, 'Comment cannot be blank');
    mongoose.model('Message', MessageSchema);
    mongoose.model('Comment', CommentSchema);
    var Message = mongoose.model('Message');
    var Comment = mongoose.model('Comment');

    // app.get("/", function(req, res){
    //     Message.find({}, false, true).populate('_comments').exec(function(err, messages){
    //           res.render('index.ejs', {messages: messages});
    //     });
    // });

    app.get('/', function (req, res) {
        if (Message == undefined) {
            res.render('index');
        }
        else {
            Message.find({}).populate('comments').exec(function (err, messages) {
                if (err) {
                    console.log(err);
                }
                console.log(messages[0]._comments[0]);
                res.render('index', {messages: messages});
            })
        }
    });

    // app.get('/posts/:id', function (req, res){
    //     Post.findOne({_id: req.params.id})
    //     .populate('comments')
    //     .exec(function(err, post) {
    //          res.render('post', {post: post});
    //            });
    //    });

    app.post('/message', function (req, res) {
        // console.log("POST DATA", req.body);
        var message = new Message({name: req.body.name, text: req.body.message});
        message.save(function (err) {
            if (err) {
                console.log('something went wrong in add message');
                res.render('index', {errors: message.errors});
            } else {
                console.log('successfully added a message!');
                res.redirect('/');
            }
        });
    });

    app.post('/message/:id', function (req, res) {
        Message.findOne({ _id: req.params.id }, function (err, message) {
            var comment = new Comment({name: req.body.name, text: req.body.comment});
            comment._message = message._id;
            Message.update({ _id: message._id }, { $push: { "_comments": comment } }, function (err) {

            });
            comment.save(function (err) {
                if (err) {
                    console.log("Error in comment save");
                    res.render('index', {errors: comment.errors});
                } else {
                    console.log("Comment added")
                    res.redirect('/');
                }
            })
        })
    });
    //     Panda.update({_id: req.params.id}, {name: req.body.name, age: req.body.age}, function(err){
    //         if(err){
    //             console.log("something went wrong in edit panda");
    //         }
    //         else{
    //             console.log('successfully edited a panda!');
    //             res.redirect('/');
    //         }
    //     });
    // });

    // app.get('/pandas/destroy/:id', function (req, res){
    //     Panda.remove({_id: req.params.id}, function(err){
    //         if(err){
    //             console.log("Did not delete record!");
    //         }
    //         else{
    //             console.log("Successfully deleted Panda");
    //             res.redirect('/');
    //         }
    //     })
    // });
};