const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    //useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false //mongoose 버전이 6이상인 경우는 필요없음
}).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World! 안녕하세요~'))

app.get('/api/hello', (req, res) => res.send("안녕하세요 Hello"))

//register 라우터
app.post('/api/users/register', (req, res) => {
    //회원 가입할 때 필요한 정보들을 client에서 가져오면 
    //그 데이터를 데이터베이스에 넣어준다.
    const user = new User(req.body)

    //mongoDB에서 오는 method
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err }) //실패시 에러메세지
        return res.status(200).json({ //성공시
            success: true 
        })
    })
})


//login 라우터
app.post('/api/users/login', (req, res) => {

    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({ 
                    loginSuccess: false, 
                    message: "비밀번호가 틀렸습니다."
                })
            }
            
            //비밀번호까지 맞다면 토큰을 생성한다.
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
 
                // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등
                res.cookie("x_auth", user.token) //쿠키에 x_auth 이름으로 토큰저장
                .status(200)
                .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})




//auth 라우터
app.get('/api/users/auth', auth, (req, res) => {

    //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
      })
})



//logout 라우터
app.get('/api/users/logout', auth, (req, res) => {
    //auth 미들웨어에서 가져와서 데이터를 찾는다
    User.findOneAndUpdate({ _id: req.user._id },
        //토큰을 지워준다
        { token: "" }
        , (err, user) => {
          if (err) return res.json({ success: false, err });
          return res.status(200).send({
            success: true
          })
    })
})


const port = 5000
app.listen(port, () => {console.log(`Example app listening on port ${port}`)})