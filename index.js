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
    //useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false //mongoose ������ 6�̻��� ���� �ʿ����
}).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World! �ȳ��ϼ���~'))

app.get('/api/hello', (req, res) => res.send("�ȳ��ϼ��� Hello"))

//register �����
app.post('/api/users/register', (req, res) => {
    //ȸ�� ������ �� �ʿ��� �������� client���� �������� 
    //�� �����͸� �����ͺ��̽��� �־��ش�.
    const user = new User(req.body)

    //mongoDB���� ���� method
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err }) //���н� �����޼���
        return res.status(200).json({ //������
            success: true 
        })
    })
})


//login �����
app.post('/api/users/login', (req, res) => {

    //��û�� �̸����� �����ͺ��̽����� �ִ��� ã�´�.
    User.findOne({ email: req.body.email }, (err, user) => {

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "������ �̸��Ͽ� �ش��ϴ� ������ �����ϴ�."
            })
        }

        //��û�� �̸����� �����ͺ��̽��� �ִٸ� ��й�ȣ�� �´� ��й�ȣ ���� Ȯ���Ѵ�.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({ 
                    loginSuccess: false, 
                    message: "��й�ȣ�� Ʋ�Ƚ��ϴ�."
                })
            }
            
            //��й�ȣ���� �´ٸ� ��ū�� �����Ѵ�.
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
 
                // ��ū�� �����Ѵ�. ���? ��Ű, ���ý��丮�� ��
                res.cookie("x_auth", user.token) //��Ű�� x_auth �̸����� ��ū����
                .status(200)
                .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})




//auth �����
app.get('/api/users/auth', auth, (req, res) => {

    //������� �̵��� ����� �Դٴ� ���� Authentication�� True��� ��
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



//logout �����
app.get('/api/users/logout', auth, (req, res) => {
    //auth �̵����� �����ͼ� �����͸� ã�´�
    User.findOneAndUpdate({ _id: req.user._id },
        //��ū�� �����ش�
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