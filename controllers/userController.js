const User = require('../models/user');


exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user)=>{
        if(err|| !user) {
            return res.status(400).json({
                error: 'Usuário não existe'
            });
        }
        req.profile = user;
        next();

    });
}

exports.userList = (req, res) =>{
    User.find({}).exec((err, users)=> {
        req.users = users;
    });
}