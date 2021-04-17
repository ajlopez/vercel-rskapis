const rskapi = require('rskapi');

const users = require('../../../lib/users');
const config = require('../../../lib/testnet/config');
const contracts = require('../../../lib/testnet/contracts');

users.useEthUtil(require('ethereumjs-util'));

const faucetOwner = {
    address: config.faucetOwner,
    privateKey: process.env.testnet_faucetowner_pk
};

const registryOwner = {
    address: config.registryOwner,
    privateKey: process.env.testnet_registryowner_pk
};

//console.dir(faucetOwner);
//console.dir(registryOwner);

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
    if (!req.body || !req.body.username || !req.body.password) {
       res.json({});
       return;
    }
    
    const account = users.fromNameToAccount(req.body.username, req.body.password, 'rsk_testnet');
    
    const client = rskapi.client(config.host);
    
    client.call(config.alice, contracts.registry, 'nameToAddress(string)', [ req.body.username ])
        .then(address => {
            if (parseInt(address)) {
                res.json({ error:  "User already exists" });
                return;
            }

            client.invoke(registryOwner, contracts.registry, 'register(string,address)', [ req.body.username, account.address ])
                .then(txh => {
                    client.invoke(faucetOwner, contracts.faucet, 'transferToAddress(address)', [ account.address ])
                        .then(txh2 => {
                            account.registryTransaction = txh;
                            account.fundingTransaction = txh2;
                            
                            res.json(account);
                        })
                        .catch(err => res.json({ error: err }));
                })
                .catch(err => res.json({ error: err }));
       })
        .catch(err => res.json({ error: err }));
};

module.exports = allowCors(handler);

