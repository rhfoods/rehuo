import {
  CryptoCipherAlgs,
  CryptoHashAlgs,
  CryptoHashTypes,
} from '../constants/crypto.constant';

/**
 * 加密请求参数定义
 */
export class ICryptoCipherReq {
  alg: CryptoCipherAlgs; //算法
  key: string; //加密密钥
  iv?: string; //加密IV值
  outputEncoding?: string; //输出的编码类型
}

/**
 * hash请求参数定义
 */
export class ICryptoHashReq {
  alg: CryptoHashAlgs; //算法
  type: CryptoHashTypes; //运算类型
  key?: string; //加密密钥
  outputEncoding?: string; //输出的编码类型
}
