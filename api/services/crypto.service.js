const crypto = require('crypto');

const CryptoService = {
    hash: (payload) => {
        const algorithm = 'aes-256-cbc';
        const key = crypto.createHash('sha256').update(String(process.env.CRYPTO_KEY)).digest('base64').substr(0, 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    },
    unhash: (hash) => {
        const algorithm = 'aes-256-cbc';
        const key = crypto.createHash('sha256').update(String(process.env.CRYPTO_KEY)).digest('base64').substr(0, 32);
        const [iv, encrypted] = hash.split(':');

        const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

module.exports = CryptoService;