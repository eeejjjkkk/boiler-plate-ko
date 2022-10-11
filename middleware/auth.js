const { User } = require("../models/User");

let auth = (req, res, next) => {
    //���� ó���� �ϴ� ��
    //Ŭ���̾�Ʈ ��Ű���� ��ū�� �����´�.
    let token = req.cookies.x_auth;

    //��ū�� ��ȣȭ �� �� ������ ã�´�.
    User.findByToken(token, (err, user) => {
        if (err) throw err;

        //������ ������ ���� No
        if (!user) return res.json({ isAuth: false, error: true })
        //������ ������ ���� Okay
        req.token = token;
        req.user = user;
        next();

    })
}

module.exports = { auth };