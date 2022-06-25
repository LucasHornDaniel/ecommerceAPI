const Product = require('../models/product');
const _ = require('lodash');
const fs = require('fs');
const formidable = require('formidable');
const { errorHandler } = require('../helpers/dbErrorHandler');



exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(err, fields, files) =>{
        if(err){
            return res.status(400).json({
                error: 'A imagem não pode ser carregada'
            });
        };

        const {name, discription, price, category, quantity, shipping} = fields;
        if(!name || !discription || !price|| !category|| !quantity|| !shipping){
            return res.status(400).json({
                error: "Todos os campos para cadastro de produtos são necessários",
              });
        }

        let product = new Product(fields);

        if (files.photo) {
            //console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
              return res.status(400).json({
                error: "A imagem deve ter menos de 1 MB de tamanho",
              });
            }
            product.photo.data = fs.readFileSync(files.photo.filepath); // change path to filepath
            product.photo.contentType = files.photo.mimetype; // change typt to mimetype
          }

        product.save((err, result) => {
            if(err){
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(result);
        });
    });
};