import { ValueTransformer } from 'typeorm';

/**
 * int和string类型transformer
 */
export class IntTransformer implements ValueTransformer {
  to(value: number | string): any {
    return typeof value === 'string' ? parseInt(value, 10) : value;
  }

  from(value: number): string {
    return value.toString();
  }
}

/**
 * float和string类型transformer
 */
export class FloatTransformer implements ValueTransformer {
  to(value: any): any {
    return value;
  }

  from(value: string): number {
    return parseFloat(value);
  }
}
