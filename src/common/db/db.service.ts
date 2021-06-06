import { BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import {
  BaseEntity,
  DeepPartial,
  FindConditions,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UtilsService } from '../providers/utils.service';

export class DBService<T extends BaseEntity> {
  protected logger;
  constructor(protected readonly repo: Repository<T>, serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  /**
   * 创建对象
   */
  async create(dto: DeepPartial<T>): Promise<T> {
    const result = await this.repo.create(dto);
    return this.repo.save<any>(result);
  }

  /**
   * 更新对象
   * @param {*} findData 更新的查询条件
   * @param {*} dto 更新数据
   */
  async update(findData: FindConditions<T>, dto: DeepPartial<T>): Promise<boolean> {
    if (UtilsService.emptyObject(dto)) {
      return false;
    }
    try {
      const result: UpdateResult = await this.repo.update(findData, dto);
      if (result.affected > 0) {
        return true;
      }
      return false;
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, DBService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.RESOURCE_DUP);
      }
      throw err;
    }
  }

  /**
   * 查找对象
   */
  async findOne(findData: FindConditions<T>, fields?: (keyof T)[]): Promise<T> {
    const result = await this.repo.findOne(findData, { select: fields });
    if (!result) {
      throw new ForbiddenException(ERRORS.RESOURCE_NOTFINDED);
    }
    return result;
  }

  /**
   * 查找对象，包括被softDeleted
   */
  async findOneWithDeleted(
    findData: FindConditions<T>,
    fields?: (keyof T)[],
  ): Promise<T> {
    const result = await this.repo.findOne(findData, {
      select: fields,
      withDeleted: true,
    });
    if (!result) {
      throw new ForbiddenException(ERRORS.RESOURCE_NOTFINDED);
    }
    return result;
  }

  /**
   * 查找对象，但不抛出异常
   */
  async findOneNotException(
    findData: FindConditions<T>,
    fields?: (keyof T)[],
  ): Promise<T> {
    return this.repo.findOne(findData, { select: fields });
  }

  /**
   * 查找对象，但不抛出异常
   */
  async findOneNotExceptionWithDeleted(
    findData: FindConditions<T>,
    fields?: (keyof T)[],
  ): Promise<T> {
    return this.repo.findOne(findData, { select: fields, withDeleted: true });
  }

  /**
   * 查找所有匹配的对象
   */
  async findAll(findData: FindConditions<T>, fields?: (keyof T)[]): Promise<T[]> {
    return this.repo.find({ where: findData, select: fields });
  }

  /**
   * 查找所有匹配的对象
   */
  async findByIds(ids: number[], fields?: (keyof T)[]): Promise<T[]> {
    return this.repo.findByIds(ids, { select: fields });
  }

  /**
   * 查找所有匹配的对象，包括被删除的
   */
  async findByIdsWithDeleted(ids: number[], fields?: (keyof T)[]): Promise<T[]> {
    return this.repo.findByIds(ids, { select: fields, withDeleted: true });
  }

  /**
   * 删除对象
   */
  async remove(findData: FindConditions<T>): Promise<T> {
    const toRemove = await this.repo.findOne(findData);
    if (!toRemove) {
      throw new BadRequestException(ERRORS.RESOURCE_NOTFINDED);
    }
    return this.repo.remove(toRemove);
  }

  /**
   * 更新表项的值
   */
  async increment(
    findData: FindConditions<T>,
    field: string,
    value: number | string,
  ): Promise<UpdateResult> {
    return this.repo.increment(findData, field, value);
  }
}
