import { ValueTransformer } from 'typeorm';

/**
 * 布尔值转换transformer
 */
export class BooleanTransformer implements ValueTransformer {
  to(value: any): any {
    return value;
  }

  from(value: number): boolean {
    if (value) {
      return true;
    } else {
      return false;
    }
  }
}
