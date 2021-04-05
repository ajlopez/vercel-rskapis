const rskapi = require('rskapi');

const users = require('../../../lib/users');
const config = require('../../../lib/testnet/config');
const contracts = require('../../../lib/testnet/contracts');

users.useEthUtil(require('ethereumjs-util'));

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const handler = (req, res) => {
    console.dir(req.headers);
    
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

module.exports = allowCors(handler)
