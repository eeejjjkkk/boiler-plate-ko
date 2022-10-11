const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const saltRounds = 10; //salt가 몇글자인지
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


//user정보를 저장하기 전에 password 암호화
userSchema.pre('save', function (next) {
    var user = this;
    //password가 변할때만
    if (user.isModified('password')) { 
        //Salt를 이용해서 hash password(암호화된 비밀번호) 만들기
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) { //hash = 암호화된 password
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
    //plainPassword 1234567, 암호화된 비밀번호 $2b$10$6Sypy7cLx2yrUM1YW1NRjexpiWnWUjlgj.mskvboxmcpJZanUCAKa
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
            cb(null, isMatch);
    })
}


userSchema.methods.generateToken = function(cb) {
    var user = this;

    //jsonwebtoekn을 이용해서 token 생성하기
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

    //토큰을 decode 한다
    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에, 
        //클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는 지 확인

        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema)

module.exports = { User }