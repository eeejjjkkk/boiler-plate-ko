// JavaScript source code

const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser'); // body parser 가져오기
const{ User } = require("./models/User");  // User 모델을 가져옴 

const config = require('./config/key');

// body parser 옵션 설정
// application/x-www-form-urlencoded 로 생긴 데이터를 분석해서 가져옴 
app.use(bodyParser.urlencoded({extended: true}));

// application/json 형식을 가져올 수 있도록 함 
app.use(bodyParser.json()); 

// 몽고 db 연결 부분, 회사 네트워크에서 안되서 잠시 주석 처리
const mongoose = require("mongoose")
mongoose.connect(config.mongoURI, {
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World! haha 111 ')
})


// 회원가입을 위한 라우터 만들기 
app.post('/register', (req, res) => {
	// 회원가입 할 때 필요한 정보들을 client에서 가져오면
	// 그것들을 데이터베이스에 넣어준다. 

	const user = new User(req.body)
	user.save((err, userInfo) => {
		if(err) return res.json({ sucess : false, err})
		return res.status(200).json ({
			sucess: true
		})
	})
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})