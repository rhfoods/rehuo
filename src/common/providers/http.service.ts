import * as _request from 'superagent';

/**
 * HTTP方法类
 */
export class HttpService {
  /**
   * 执行HTTP GET命令
   * @param {string} url 访问的URL地址
   * @memberof HTTP
   * @returns 正常情况下返回HTTP请求获取到的数据，异常情况下抛出异常
   */
  static get(url: string, options?: Record<string, any>) {
    return new Promise((resolve, reject) => {
      options
        ? _request
            .get(url)
            .query(options)
            .end((error, response) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  statusCode: response.status,
                  body: response.body,
                  text: response.text,
                });
              }
            })
        : _request.get(url).end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                statusCode: response.status,
                body: response.body,
                text: response.text,
              });
            }
          });
    });
  }

  /**
   * 执行HTTP POST命令
   * @param {string} url 请求的URL地址
   * @param {object} body 请求的数据
   * @param {object} options 请求的可选参数
   * @returns 正常情况下返回返回的数据，异常情况抛出异常
   */
  static post(url: string, body: Record<string, any>, options?: Record<string, any>) {
    return new Promise((resolve, reject) => {
      options
        ? _request
            .post(url)
            .send(body)
            .set(options)
            .end((error, response) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  statusCode: response.status,
                  body: response.body,
                  text: response.text,
                });
              }
            })
        : _request
            .post(url)
            .send(body)
            .end((error, response) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  statusCode: response.status,
                  body: response.body,
                  text: response.text,
                });
              }
            });
    });
  }
}
