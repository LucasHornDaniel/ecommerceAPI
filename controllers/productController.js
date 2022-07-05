const Product = require('../models/product');
const _ = require('lodash');
const fs = require('fs');
const formidable = require('formidable');
const { errorHandler } = require('../helpers/dbErrorHandler');



exports.productById = (req, res, next, id) => {
    Product.findById(id)
    .populate('category')
    .exec((err, product) => {
    if(err|| !product) {
        return res.status(400).json({
            error: 'Produto não encontrado!'
        });
    }
        req.product = product
        next();
});
}; 


exports.read = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product);
}

exports.remove = (req, res) => {
    let product = req.product
    product.remove((err, deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });

        }
        res.json({
            deletedProduct,
            message: "Produto deletado com sucesso"
        })
    })
}



exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(err, fields, files) =>{
        if(err){
            return res.status(400).json({
                error: 'A imagem não pode ser carregada'
            });
        };
        console.log(fields)
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
            if (err) {
                console.log('PRODUCT CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.update = async (req, res)  =>  {
    const doc = await Product.findOne({
        _id: req.params.productId
        
    });

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse (req, async (err, fields, files) => {
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
        doc.name = name;
        doc.discription = discription;
        doc.category = category;
        doc.quantity = quantity;
        doc.shipping = shipping;
        await doc.save();
        return res.status(200).json({
            
            data: doc,
            
        });   
     }   
    )
};

exports.list = (req, res) =>{
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6
    //http://localhost:8080/api/products?sortBy&order=desc&limit=4
    Product.find()
        .select("-photo")
        .populate('category')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, product) => {
            if(err){
                return res.status(400).json({
                    error: "Produto não encontrado"
                })
            }
            res.json(product);
        })
};

exports.listSearch = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: 'i' };
        // assigne category value to query.category
        if (req.query.category && req.query.category != 'All') {
            query.category = req.query.category;
        }
        // find the product based on query object with 2 properties
        // search and category
        Product.find(query, (err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(products);
        }).select('-photo');
    }
};


exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.find({ _id: { $ne: req.product }, category: req.product.category })
        .limit(limit)
        .populate('category', '_id name')
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products não encontrado!'
                });
            }
            
            res.json(products);
        });
};

exports.listCategories = (req, res) => {
    Product.distinct('category', {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: 'Categoria não encontrada!'
            });
        }
        res.json(categories);
    });
};


exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Produto não encontrado"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};


exports.photo = (req, res, next) => {
    if(req.product.photo.data){
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}