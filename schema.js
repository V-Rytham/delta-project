const Joi = require("joi");

module.exports = Joi.object ({
    review: Joi.object ({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});