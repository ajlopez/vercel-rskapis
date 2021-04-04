const users = require('../../../lib/users');

users.useEthUtil(require('ethereumjs-util'));

module.exports = (req, res) => {
    if (!req.body || !req.body.username || !req.body.password)
       res.json({});
    else
        res.json(
            users.fromNameToAccount(req.body.username, req.body.password, 'rsk_testnet')
        );
}
