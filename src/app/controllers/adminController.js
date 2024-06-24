const User = require('../models/user')

class AdminController {
    // [GET] /admin/login
    login(req, res) {
        res.render('admin/login', { cssFile: 'auth.css', showHeader: false });
    }

    // [POST] /admin/login
    checkAdmin(req, res, next) {
        const { email, password } = req.body;

        User.findOne({ email })
            .then(emailUser => {
                if(emailUser) {
                    User.findOne({ email, password })
                        .then(passUser => {
                            if(passUser && passUser.role === 'admin'){
                                req.session.user = passUser;
                                res.redirect('/admin/manageAccount')
                            }
                            else res.render('admin/login', { cssFile: 'auth.css', error: 'Sai mật khẩu', data: req.body })
                        })
                        .catch(next)
                }
                else res.render('admin/login', { cssFile: 'auth.css', error: 'Không tìm thấy thông tin admin', data: req.body })
            })
            .catch(next)
    }

    // [GET] /admin/manageAccount
    showAccount(req, res) {
        User.find({ role: { $in: ['admin', 'manager'] } })
            .then(users => {
                users = users.map(user => user.toObject());
                res.render('admin/manageAccount', { cssFile: 'layout.css', showHeader: true, users})
            })
    }

    // [GET] /admin/createAccount
    create(req, res) {
        res.render('admin/createAccount', { cssFile: 'auth.css' })
    }

    // [POST] /admin/createAccount
    createAccount(req, res) {
        const { name, email, password, confirmPassword, role } = req.body;
        if(password !== confirmPassword) res.render('admin/createAccount', { cssFile: 'auth.css', 
                                                                             error: 'Vui lòng nhập đúng mật khẩu xác nhận',
                                                                             data: req.body });
        else{
            User.findOne({ email })
                .then(user => {
                    if(user) res.render('admin/createAccount', { cssFile: 'auth.css',
                                                                 error: 'Email đã tồn tại',
                                                                 data: req.body })
                    else{
                        const user = new User({ name, email, password, role });
                        user.save();
                        res.redirect('/admin/manageAccount');
                    }
                })
        }
    }

    // [DELETE] /admin/deleteAccount/:id
    deleteAccount(req, res) {
        const userId = req.params.id;
        User.deleteOne({ _id: userId})
            .then(() => res.redirect('back'))
    }
}

module.exports = new AdminController;