import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here-min', 'salt', 32);

export const encryptMessage = (content) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        content: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

export const decryptMessage = (encrypted, iv, authTag) => {
    try {
        const decipher = crypto.createDecipheriv(
            algorithm, 
            secretKey, 
            Buffer.from(iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return '[Message decryption failed]';
    }
};