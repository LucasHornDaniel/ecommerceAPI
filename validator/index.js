exports.userSignupValidator = (req, res, next) => {
    req.check('name', 'Nome é obrigatório').notEmpty();
    req.check('email', 'Email deve conter de 3 a 32 caracteres')
        .matches(/.+\@.+\..+/)
        .withMessage('Email deve conter@')
        .isLength({
            min: 4,
            max: 32
        });
    req.check('password', 'Senha é necessária').notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('A senha deve possuir mais que 6 caracteres')
        .matches(/\d/)
        .withMessage('A senha deve conter um número');
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};