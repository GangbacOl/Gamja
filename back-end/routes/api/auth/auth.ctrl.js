const crypto = require('crypto');
const passwordValidator = require('password-validator');
const nodemailer = require('nodemailer');
const smtpTransporter = require('nodemailer-smtp-transport');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const models = require('../../../models');
const config = require('../../../config/auth_config.json');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        res.status(400).json({
            message: '로그인 실패(정보 미기입)',
        });
    else {
        const encryptedPwd = crypto.createHmac('sha1', config.secret).update(password).digest('base64');
        await models.user
            .findOne({
                where: { email },
            })
            .then((queryRes) => {
                // 로그인 실패 시
                if (queryRes === null)
                    res.status(401).json({
                        message: '로그인 실패(존재하지 않는 계정)',
                    });
                // 패스워드 오류 시
                else if (queryRes.dataValues.pwd !== encryptedPwd)
                    res.status(401).json({
                        message: '로그인 실패(패스워드가 일치하지 않음)',
                    });
                // 로그인 성공 시
                else if (queryRes.dataValues.pwd === encryptedPwd) {
                    const token = jwt.sign(
                        {
                            _email: email,
                            username: queryRes.dataValues.username,
                        },
                        config.secret,
                        {
                            expiresIn: '5d',
                            issuer: 'localhost',
                            subject: 'userInfo',
                        }
                    );
                    res.status(200)
                        .cookie('user', token, {
                            maxAge: 1000 * 60 * 60 * 24 * 7,
                        })
                        .json({
                            userData: {
                                username: queryRes.dataValues.username,
                            },
                            message: '로그인 성공',
                        });
                }
            });
    }
};

exports.register = async (req, res) => {
    const { nickname, username, email, password, phoneNumber, bankAccount, region, address } = req.body;

    const schema = new passwordValidator();
    schema.is().min(8).is().max(25).has().uppercase().has().lowercase().has().digits().has().not().spaces();

    await models.email_verified_status.findOne({ where: { email } }).then((queryRes) => {
        if (!queryRes) res.status(400).json({ message: '이메일 인증을 먼저 해주세요.' });
        else {
            console.log('이메일 인증이 완료된 계정');
        }
    });

    const existence = await models.user
        .findOne({ where: { [Op.or]: [{ nickname }, { phone: phoneNumber }] } })
        .then((queryRes) => {
            return queryRes;
        });

    if (!nickname || !username || !email || !password || !phoneNumber || !bankAccount || !region || !address) {
        res.status(400).json({ message: '회원가입 실패(회원정보 누락)' });
    } else if (!schema.validate(password)) {
        res.status(400).json({
            message:
                '회원가입 실패(비밀번호는 최소 8자리에서 최대 20자리여야 하며 대문자, 소문자, 숫자를 포함하고 공백은 사용할 수 없음)',
        });
    } else if (existence) {
        res.status(400).json({
            message: '회원가입 실패(존재하는 이메일 또는 전화번호)',
        });
    } else {
        const encryptedPassword = crypto
            .createHmac('sha1', config.secret)
            .update(password)
            .digest('base64')
            .substr(0, 25);
        await models.user
            .create({
                nickname,
                username,
                email,
                pwd: encryptedPassword,
                phone: phoneNumber,
                bank_account: bankAccount,
                region,
                address,
            })
            .then(async () => {
                // 이메일 인증 테이블에서 해당 컬럼 삭제.
                await models.email_verified_status.destroy({ where: { email } }).catch((err) => console.log(err));
                res.status(200).json({ message: '회원가입 성공' });
            })
            .catch((err) => res.status(400).json({ message: '회원가입 실패', errorMsg: err }));
    }
};

exports.sendMail = async (req, res) => {
    const { email } = req.body;
    models.user.findOne({ where: { email } }).then((queryRes) => {
        if (queryRes) res.status(400).json({ message: '해당 이메일은 회원가입이 되어있는 이메일입니다.' });
    });
    const keyForVerify = crypto.randomBytes(256).toString('hex').substr(100, 10);

    const clickLink = 'http://' + req.get('host') + '/auth/confirmEmail' + '?key=' + keyForVerify;

    models.email_verified_status.create({ email, key_for_verify: keyForVerify }).catch((err) => console.log(err));

    const smtpTransport = nodemailer.createTransport(
        smtpTransporter({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: config.gmailAccount.email,
                pass: config.gmailAccount.password,
            },
        })
    );

    const mailOpt = {
        from: 'gamja',
        to: email,
        subject: '이메일 인증',
        html: ` <div style="margin: 40px auto; display: flex; flex-direction: column; align-items: center">
        <div style="display: flex; flex-direction: column; width: 650px">
            <header
                style="
                    display: flex;
                    align-items: center;
                    height: 70px;
                    background-color: rgb(102, 196, 116);
                    padding-left: 10px;
                "
            >
                <p style="color: white; font-weight: 400; font-size: 1.7em">Gamja에서 보내는 인증메시지 입니다.</p>
            </header>
            <article
                style="
                    border-left: 1px solid rgb(206, 206, 206);
                    border-right: 1px solid rgb(206, 206, 206);
                    border-bottom: 1px solid rgb(206, 206, 206);
                    text-align: center;
                "
            >
                <h2 style="">안녕하세요, 회원님.</h2>
                <p style="margin-bottom: 25px">회원가입을 완료하시려면 아래 <b>인증하기</b> 버튼을 눌러주세요.</p>
                <p>인증번호는 24시간동안만 유효합니다.</p>
                <a
                    href="${clickLink}"
                    style="all: unset; padding: 8px 18px; border: 1px solid black; font-size: 1.3em; color: black"
                    on
                    >인증하기</a
                >
                <p style="margin-top: 25px; text-decoration: underline">
                    <i>본인이 요청하지 않았다면, 이 메일을 무시해주세요.</i>
                </p>
            </article>
        </div>
    </div>`,
    };
    smtpTransport.sendMail(mailOpt, (err) => {
        if (err) {
            console.log(err);
            res.send('이메일을 전송하지 못했습니다.');
        } else {
            console.log('이메일을 전송했습니다.');
            res.send('이메일을 전송하였습니다. \n메일을 확인해주세요.' + clickLink);
        }
    });
};

exports.confirmEmail = async (req, res) => {
    const { key } = req.query;

    models.email_verified_status.findOne({ where: { key_for_verify: key } }).then((queryRes) => {
        const currentTime = new Date().getTime();
        const createdTime = queryRes.dataValues.createdAt.getTime();
        const leftTime = 24 - (currentTime - createdTime) / (1000 * 60 * 60);
        console.log(leftTime);
        if (!queryRes) res.send('해당 이메일은 인증처리가 되지 않았습니다, 다시 시도해주세요.');
        else if (leftTime < 0) {
            models.email_verified_status.destroy({ where: { key_for_verify: key } });
            res.send('인증시간이 만료되었습니다, 회원가입을 다시 진행해주세요.');
        }
    });

    models.email_verified_status
        .update({ verified: true }, { where: { key_for_verify: key } })
        .then((queryRes) => res.status(200).send('해당 이메일을 인증처리 하였습니다, 회원가입을 완료해주세요.'))
        .catch((err) => {
            res.send('해당 이메일은 인증처리가 되지 않았습니다, 다시 시도해주세요.');
            console.log(err);
        });
};
