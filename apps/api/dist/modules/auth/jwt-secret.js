"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtSecret = jwtSecret;
function jwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret)
        return secret;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be configured in production');
    }
    return 'local-development-only-secret';
}
//# sourceMappingURL=jwt-secret.js.map