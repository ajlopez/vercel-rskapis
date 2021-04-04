
let uthutil;

function fromNameToAccount(name, password, prefix) {
    const text = prefix  + ':' + name + ':' + password;
    const privateKey = ethutil.keccak256(text);
    
    if (!ethutil.isValidPrivate(privateKey))
        privateKey[0] = privateKey[0] & 0x7f;
    
    const publicKey = ethutil.privateToPublic(privateKey);
    const address = ethutil.privateToAddress(privateKey);
    
    return {
        name: name,
        privateKey: '0x' + privateKey.toString('hex'),
        publicKey: '0x' + publicKey.toString('hex'),
        address: '0x' + address.toString('hex')
    };
}

module.exports = {
    fromNameToAccount,
    useEthUtil: function (ethut) { ethutil = ethut; }
}
