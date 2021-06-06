import * as bcrypt from 'bcrypt';
import { format } from 'util';
import { ChinaCitys } from '../constants/city.constant';
import { MapShowScales } from '../constants/map.constant';

/**
 * 工具服务类
 */
export class UtilsService {
  /**
   * 去除数组中相同的字符串或者数字
   */
  static ARFA(data: number[] | string[]): number[] | string[] {
    const temp = {},
      res = [];
    for (let i = 0; i < data.length; i++) {
      if (!temp[data[i]]) {
        res.push(data[i]);
        temp[data[i]] = data[i];
      }
    }
    return res;
  }

  /**
   * 检查两个数组中有没有相同
   */
  static hasSame(from: any[], to: any[]): any[] {
    const sames = [];
    if (to.length === 0) {
      return sames;
    }

    for (let i = 0; i < from.length; i++) {
      for (let j = 0; j < to.length; j++) {
        if (from[i] === to[j]) {
          sames.push(from[i]);
        }
      }
    }

    return sames;
  }

  /**
   * 格式化字符串
   */
  static format(fmt: string, ...args) {
    return format(fmt, ...args);
  }

  /**
   * 随机产生index
   */
  static randomIndex(maxIndex: number, count: number) {
    const ids = [];
    const idx = {};

    for (let i = 0; i < count; i++) {
      let ix;
      while (1) {
        ix = Math.floor(Math.random() * maxIndex);
        if (idx[ix]) {
          continue;
        }
        break;
      }
      ids.push(ix);
      idx[ix] = '1';
    }

    return ids;
  }

  /**
   * 根据属性转换为对象
   */
  static valuesToObject(fields: string[], values: any[]): Record<string, any> {
    const obj = {};
    fields.forEach((field, index) => {
      obj[field] = values[index];
    });

    return obj;
  }

  /**
   * 把对象的属性和值转换为数组
   * 不支持对象中嵌套对象或者数组
   */
  static objectToArray(object: Record<string, any>): string[] {
    const arr: string[] = [];

    Object.keys(object).forEach(key => {
      arr.push(key);
      arr.push(object[key]);
    });

    return arr;
  }

  /**
   * 把对象的属性和值转换为数组
   * 不支持对象中嵌套对象或者数组
   */
  static arrayToObject(values: string[]): object {
    const obj = {};
    const counts = Math.floor(values.length / 2);
    for (let i = 0; i < counts; i++) {
      obj[values[i * 2]] = values[i * 2 + 1];
    }
    return counts > 0 ? obj : null;
  }

  /**
   * 把缓存中字符串数字转换为数字
   * @param object
   */
  static toNumber(object: Record<string, any>): Record<string, number> {
    const obj = {};
    Object.keys(object).forEach(key => {
      obj[key] = Number(object[key]);
    });
    return obj;
  }

  /**
   * 获取对象中的部分属性
   */
  static extractSome(origin: any, fields: string[]): object {
    const obj = {};
    fields.forEach(field => {
      obj[field] = origin[field];
    });
    return obj;
  }

  /**
   * 次日凌晨时间
   */
  static midnight(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  /**
   * 检查空对象
   */
  static emptyObject(obj: Record<string, any>): boolean {
    return obj === null || obj === undefined || Object.keys(obj).length === 0;
  }

  /**
   * 格式化日期
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1).toString()).slice(-2);
    const day = ('0' + date.getDate().toString()).slice(-2);

    return year + '-' + month + '-' + day;
  }

  /**
   * 格式化时间
   */
  static formatTime(date: Date): string {
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);
    const second = ('0' + date.getSeconds()).slice(-2);

    return hour + ':' + minute + ':' + second;
  }

  /**
   * 生成散列值
   * @param {string} input 散列输入数据
   * @param {number} rounds 轮数
   */
  static generateHash(input: string, rounds?: number): string {
    const salt = bcrypt.genSaltSync(rounds || 10);
    return bcrypt.hashSync(input, salt);
  }

  /**
   * 散列验证
   * @param {string} input 进行散列验证的输入数据
   * @param {string} hash 进行比较的散列数据
   */
  static async validateHash(input: string, hash: string): Promise<boolean> {
    return bcrypt.compareSync(input, hash || '');
  }

  /**
   * 格式化SQL查询字符串
   */
  static orderString(field: string, orders: any[]): string {
    return `field(${field},${orders.join()})`;
  }

  /**
   * 异步延迟
   * @param {number} time 延迟的时间,单位毫秒
   */
  static sleep(time = 0) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  /**
   * 根据城市名解析出对应的城市编码
   */
  static cityCode(cityName: string): string {
    let cName = cityName;
    if (cityName.slice(-1) === '市' || cityName.slice(-1) === '县') {
      cName = cityName.slice(0, cityName.length - 1);
    }

    const cKeys = Object.keys(ChinaCitys);
    for (let i = 0; i < cKeys.length; i++) {
      const name = ChinaCitys[cKeys[i]].name;
      if (name.slice(0, cName.length) === cName) {
        return cKeys[i].slice(1);
      }
    }

    return '';
  }

  /**
   * 返回每个城市对应的缩放比例
   */
  static getCityScale(code: string): number {
    if (code.slice(0, 2) === '50') {
      return MapShowScales.CITY_POINT_DIV_CHONGQING;
    } else {
      return MapShowScales.CITY_POINT_DIV_NORMAL;
    }
  }
}
