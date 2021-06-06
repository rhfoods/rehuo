import {
  CryptoHashTypes,
  CryptoOutputTypes,
} from '@rehuo/common/constants/crypto.constant';
import {
  ICryptoCipherReq,
  ICryptoHashReq,
} from '@rehuo/common/interfaces/crypto.interface';
import * as crypto from 'crypto';

/**
 * 加密服务
 */
export class CryptoService {
  /**
   * 生成随机数
   * @param {number} len 长度
   * @param {CryptoRandomTypes} type 随机数类型
   */
  static Random(len: number, type: CryptoOutputTypes): string | Buffer {
    const random = crypto.randomBytes(len);
    if (type === CryptoOutputTypes.BINARY) return random;
    if (type === CryptoOutputTypes.ASCII) return random.toString(CryptoOutputTypes.ASCII);
    if (type === CryptoOutputTypes.UTF8) return random.toString(CryptoOutputTypes.UTF8);
  }

  /**
   * 对称加密
   * @param {string} data 待加密数据
   * @param {ICryptoCipherReq} req 加密请求参数
   */
  static EncryptCipher(data: string, req: ICryptoCipherReq): string {
    const cipher = crypto.createCipheriv(req.alg, req.key, req.iv || null);
    const encrypted = Buffer.concat([cipher.update(data, 'ascii'), cipher.final()]);
    return encrypted.toString(req.outputEncoding || 'base64');
  }

  /**
   * 对称解密
   * @param {string} data 待加密数据
   * @param {ICryptoCipherReq} req 加密请求参数
   */
  static DecryptCipher(data: string, req: ICryptoCipherReq): string {
    const decipher = crypto.createDecipheriv(req.alg, req.key, req.iv || null);
    const decrypted = Buffer.concat([decipher.update(data, 'base64'), decipher.final()]);

    return decrypted.toString('ascii');
  }

  /**
   * wechat数据加密算法
   * @param {string} data base64编码
   * @param {ICryptoCipherReq} req 请求数据
   */
  static DecryptWechat(data: string, req: ICryptoCipherReq): string {
    const SK = Buffer.from(req.key, 'base64');
    const ED = Buffer.from(data, 'base64');
    const IV = Buffer.from(req.iv, 'base64');
    const decipher = crypto.createDecipheriv(req.alg || 'aes-128-cbc', SK, IV);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(ED, 'binary', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * HASH签名运算
   */
  static SignByHash(data: string, req: ICryptoHashReq): string {
    const outType: any = req.outputEncoding || 'hex';
    if (req.type === CryptoHashTypes.HASH) {
      return crypto
        .createHash(req.alg)
        .update(data, 'utf8')
        .digest(outType)
        .toUpperCase();
    } else {
      return crypto
        .createHmac(req.alg, req.key)
        .update(data, 'utf8')
        .digest(outType)
        .toUpperCase();
    }
  }
}
