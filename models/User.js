const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const saltRounds = 10; //salt�� ���������
var jwt = require('jsonwebtoken'); //token

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})


//user������ �����ϱ� ���� password ��ȣȭ
userSchema.pre('save', function (next) {
    var user = this;
    //password�� ���Ҷ���
    if (user.isModified('password')) { 
        //Salt�� �̿��ؼ� hash password(��ȣȭ�� ��й�ȣ) �����
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) { //hash = ��ȣȭ�� password
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }

})


userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword 1234567, ��ȣȭ�� ��й�ȣ $2b$10$6Sypy7cLx2yrUM1YW1NRjexpiWnWUjlgj.mskvboxmcpJZanUCAKa
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
            cb(null, isMatch);
    })
}


userSchema.methods.generateToken = function(cb) {
    var user = this;

    //jsonwebtoekn�� �̿��ؼ� token �����ϱ�
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        if (err) return cb(err)
        cb(null, user)
    })
}


userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    //��ū�� decode �Ѵ�
    jwt.verify(token, 'secretToken', function(err, decoded) {
        //���� ���̵� �̿��ؼ� ������ ã�� ������, 
        //Ŭ���̾�Ʈ���� ������ token�� DB�� ������ token�� ��ġ�ϴ� �� Ȯ��

        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema)

module.exports = { User }