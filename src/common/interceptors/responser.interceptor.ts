import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ClassType<T> {
  new (): T;
}

@Injectable()
export class ResponserInterceptor<T> implements NestInterceptor<Partial<T>, T> {
  private objectName;

  /**
   * @param {ClassType<T>} classType 转换的目标DTO对象类型
   * @param {string} [propertyName] 转换的目标DTO对象在response对象中的属性名称
   */
  constructor(private readonly classType: ClassType<T>, readonly propertyName?: string) {
    this.objectName = propertyName;
  }

  /**
   * response回复拦截器，按照classType类型对response的属性对象进行DAO转换为DTO操作
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map(data => {
        if (this.objectName) {
          if (Array.isArray(data[this.objectName])) {
            data[this.objectName].forEach((element, index) => {
              data[this.objectName][index] = plainToClass(this.classType, element);
            });
          } else {
            data[this.objectName] = plainToClass(this.classType, data[this.objectName]);
          }
        } else {
          data = plainToClass(this.classType, data);
        }
        return data;
      }),
    );
  }
}
