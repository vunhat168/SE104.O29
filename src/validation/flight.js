const Joi = require('joi');

const flightValid = (minFlyTime, minStopTime, maxStopTime) => {
    return Joi.object({
        flightId: Joi.string()
            .required(),
            
        price: Joi.number().positive()
            .required()
            .messages({
                'number.base': 'Giá vé là 1 số',
                'number.positive': 'Giá vé là 1 số dương'
            }),

        startAirport: Joi.string()
            .required(),

        endAirport: Joi.string()
            .required(),

        date: Joi.string()
            .required(),

        time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required(),  

        flyTime: Joi.number().positive().greater(minFlyTime)
            .required()
            .messages({
                'number.base': 'Thời gian bay là 1 số',
                'number.positive': 'Thời gian bay là 1 số dương',
                'number.greater': `Thời gian bay phải lớn hơn ${minFlyTime}`
            }),

        firstSeat: Joi.number().positive()
            .required()
            .messages({
                'number.base': 'Số lượng ghế hạng 1 là 1 số',
                'number.positive': 'Số lươgn ghế hạng 1 là 1 số dương'
            }),

        secondSeat: Joi.number().positive()
        .required()
        .messages({
            'number.base': 'Số lượng ghế hạng 2 là 1 số',
            'number.positive': 'Số lươgn ghế hạng 2 là 1 số dương'
        }),
        
        midAirports: Joi.array().items(Joi.object({
            name: Joi.string().allow(''),
            stopTime: Joi.number().when('name', {
                is: Joi.exist(), // Kiểm tra nếu trường 'name' tồn tại (không phải null, undefined hoặc rỗng)
                then: Joi.number().positive().greater(minStopTime).less(maxStopTime).required().messages({
                    'number.base': 'Nhập thời gian dừng là 1 số',
                    'number.positive': 'Thời gian dừng phải là 1 số dương',
                    'number.greater': `Thời gian dừng phải lớn hơn ${minStopTime}`,
                    'number.less': `Thời gian dừng phải nhỏ hơn ${maxStopTime}`
                }), // Khi 'name' tồn tại, 'stopTime' cũng bắt buộc phải có và phải là số dương
                otherwise: Joi.forbidden() // Khi 'name' không tồn tại, không cần kiểm tra 'stopTime' 
            }),
            note: Joi.string().allow('')
        })).optional()
    });
}

module.exports = flightValid;
