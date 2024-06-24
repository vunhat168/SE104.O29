const Joi = require('joi');

const regulationValid = Joi.object({
    minFlyTime: Joi.number().positive()
        .required()
        .messages({
            'number.base': 'Thời gian bay là 1 số',
            'number.positive': 'Thời gian bay là 1 số dương'
        }),
        
    maxMidAirport: Joi.number().positive()
        .required()
        .messages({
            'number.base': 'Số sân bay trung gian tối đa là 1 số',
            'number.positive': 'Số sân bay trung gian tối đa là 1 số không âm'
        }),

    minStopTime: Joi.number().positive()
        .required()
        .messages({
            'number.base': 'Thời gian dừng tối thiểu là 1 số',
            'number.positive': 'Thời gian dừng tối thiểu là 1 số không âm'
        }),
    maxStopTime: Joi.number().positive()
        .required()
        .greater(Joi.ref('minStopTime'))
        .messages({
            'number.base': 'Thời gian dừng tối đa là 1 số',
            'number.positive': 'Thời gian dừng tối đa là 1 số không âm',
            'any.greater': 'Thời gian dừng tối đa phải lớn hơn thời gian dừng tối thiểu'
        }),

    minBookingTime: Joi.number().positive()
        .required()
        .messages({
            'number.base': 'Thời gian chậm nhất khi đặt vé là 1 số',
            'number.positive': 'Thời gian chậm nhất khi đặt vé là 1 số không âm'
        }),

     minDeleteMyFlightTime: Joi.number().positive().allow(0)
        .required()
        .messages({
            'number.base': 'Thời gian chậm nhất khi hủy đặt vé là 1 số',
            'number.positive': 'Thời gian chậm nhất khi hủy đặt vé là 1 số không âm'
        })
})


module.exports = regulationValid;