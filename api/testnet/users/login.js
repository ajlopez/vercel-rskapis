const rskapi = require('rskapi');

const users = require('../../../lib/users');
const config = require('../../../lib/testnet/config');
const contracts = require('../../../lib/testnet/contracts');

users.useEthUtil(require('ethereumjs-util'));

module.exports = (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
       res.json({});
       return;
    }
    
    const account = users.fromNameToAccount(req.body.username, req.body.password, 'rsk_testnet');
    
    const client = rskapi.client(config.host);
    
    client.call(config.alice, contracts.registry, 'nameToAddress(string)', [ req.body.username ])
        .then(address => {
            if (!parseInt(address)) {
                res.json({ error:  "User does not exist" });
                return;
            }
            
            if (address.length >= 40)
                address = '0x' + address.substring(address.length - 40);
                
             if (address.toLowerCase() !== account.address.toLowerCase()) {
                res.json({ error:  "Invalid password" });
                return;
             }
             
             res.json(account);
       })
        .catch(err => res.json({ error: err }));
}
