/**
 * 密码运算输入类型定义
 */
export enum CryptoInputTypes {
  BASE64 = 'base64', //base64编码
  BINARY = 'binary', //二进制
}

/**
 * 密码运算输出类型定义
 */
export enum CryptoOutputTypes {
  UTF8 = 'utf8', //utf8编码
  BINARY = 'binary', //二进制
  ASCII = 'ascii', //ascii编码
}

/**
 * 对称算法类型定义
 */
export enum CryptoCipherAlgs {
  AES_ECB_128 = 'aes-128-ecb',
  AES_CBC_128 = 'aes-128-cbc',
}

/**
 * HASH算法运算类型
 */
export enum CryptoHashTypes {
  HASH = 'hh', //hash运算
  HMAC = 'hm', //HMAC运算
}

/**
 * HASH算法类型定义
 */
export enum CryptoHashAlgs {
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  MD5 = 'md5',
}
