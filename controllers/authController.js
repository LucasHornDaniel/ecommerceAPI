const User = require('../models/user');
const jwt = require('jsonwebtoken') // gera o token
const expressJwt= require('express-jwt'); // autoriza
const {errorHandler} = require('../helpers/dbErrorHandler');
let uuidv1 = require('uuidv1');
const user = require('../models/user');
const { use } = require('../routes/authRoute');
require('dotenv').config();

console.log(uuidv1());
exports.signup = (req, res) => {
    //console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user)=> {
        if(err){
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    })
};


exports.signin = (req, res) => {
        const {email, password} = req.body
        user.findOne({email}, (err, user) =>{
            if(err || !user){
                return res.status(400).json({
                    error: "Esse email não existe, crie um conta"
                });
            }
            if(!user.authenticate(password)){
                return res.status(401).json({
                    error: 'Email e senha não coincidem'
                })
            }
            //gera o token
            const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET);
            res.cookie('t', token, {expire: new Date()+ 9999});
            const {_id, name, email, role} = user
            return res.json({token, user:{_id, name, email, role}});
        });
};

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({message: 'Usurio deslogado'});
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",    
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: 'Accesso negado'
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0){
        return res.status(403).json ({
            error: 'Voce não possui acesso Administrativo'
        });
    };
    next();
};
