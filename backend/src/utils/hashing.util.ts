import * as bcrypt from 'bcrypt';

export class HashingUtil {
    private saltRounds = 10;

    async createHash(password: string) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compareHash(password: string, passwordHash: string) {
        return await bcrypt.compare(password, passwordHash);
    }
}