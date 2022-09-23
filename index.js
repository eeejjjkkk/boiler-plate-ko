// JavaScript source code

const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser'); // body parser ��������
const{ User } = require("./models/User");  // User ���� ������ 

const config = require('./config/key');

// body parser �ɼ� ����
// application/x-www-form-urlencoded �� ���� �����͸� �м��ؼ� ������ 
app.use(bodyParser.urlencoded({extended: true}));

// application/json ������ ������ �� �ֵ��� �� 
app.use(bodyParser.json()); 

// ���� db ���� �κ�, ȸ�� ��Ʈ��ũ���� �ȵǼ� ��� �ּ� ó��
const mongoose = require("mongoose")
mongoose.connect(config.mongoURI, {
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World! haha 111 ')
})


// ȸ�������� ���� ����� ����� 
app.post('/register', (req, res) => {
	// ȸ������ �� �� �ʿ��� �������� client���� ��������
	// �װ͵��� �����ͺ��̽��� �־��ش�. 

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