import { isArray } from 'class-validator';
import { ValueTransformer } from 'typeorm';

/**
 * 布尔值转换transformer
 */
export class NullTransformer implements ValueTransformer {
  to(value: any): any {
    if (isArray(value) && value.length === 0) {
      return null;
    }
    return value;
  }

  from(value: any): any[] {
    if (!value) {
      return [];
    }
    return value;
  }
}
