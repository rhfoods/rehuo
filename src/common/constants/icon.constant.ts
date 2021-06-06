import { IIcon } from '../interfaces/icon.interface';

export const ICONS: IIcon[] = [
  { name: 'moren.png', desc: '默认' },
  { name: 'xingfen.png', desc: '非常棒' },
  { name: 'kaixin.png', desc: '还不错' },
  { name: 'yiban.png', desc: '一般般' },
  { name: 'tule.png', desc: '比较差' },
  { name: 'shengtian.png', desc: '非常差' },
  { name: 'huoguo.png', desc: '火锅串串' },
  { name: 'lajiao.png', desc: '麻辣川菜' },
  { name: 'zhongcan.png', desc: '休闲西餐' },
  { name: 'jiaozi.png', desc: '饺子馄饨' },
  { name: 'shaokao.png', desc: '热辣烧烤' },
  { name: 'hanbao.png', desc: '汉堡披萨' },
  { name: 'dangao.png', desc: '蛋糕点心' },
  { name: 'naicha.png', desc: '奶茶果汁' },
  { name: 'jiu.png', desc: '畅饮小酒' },
  { name: 'bingqilin.png', desc: '优质冰品' },
  { name: 'shousi.png', desc: '日料寿司' },
  { name: 'zhou.png', desc: '包子粥店' },
  { name: 'mian.png', desc: '米粉面食' },
  { name: 'kafei.png', desc: '咖啡热饮' },
  { name: 'aoligei.png', desc: '奥利给' },
];

/**
 * ICON存储路径定义
 */
export enum ICONPATHS {
  CLOCKED = 'clocked', //打卡图标路径
  UNCLOCKED = 'unclocked', //未打卡图标路径
}
