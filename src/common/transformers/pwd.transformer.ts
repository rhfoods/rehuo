import { ValueTransformer } from 'typeorm';
import { UtilsService } from '../providers/utils.service';

/**
 * 登录口令transformer
 */
export class PwdTransformer implements ValueTransformer {
  to(value: string): string {
    return value ? UtilsService.generateHash(value) : null;
  }

  from(value: string): string {
    return value;
  }
}
