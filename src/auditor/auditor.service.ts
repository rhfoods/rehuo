import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { AuditorEntity } from '@rehuo/models/auditor.entity';
import { FindConditions, Repository } from 'typeorm';
import { AuditorCreateDTO } from './dtos/auditor.create.dto';

const aeFields = ['auditorId', 'account', 'name', 'password'];

@Injectable()
export class AuditorService extends DBService<AuditorEntity> {
  constructor(
    @InjectRepository(AuditorEntity)
    private auditorRepo: Repository<AuditorEntity>,
  ) {
    super(auditorRepo, AuditorService.name);
  }

  /**
   * 创建审核者信息
   */
  async createOne(cDto: AuditorCreateDTO): Promise<AuditorEntity> {
    try {
      const sort = await this.findOneNotException({ account: cDto.account }, [
        'auditorId',
      ]);
      if (sort) {
        throw new ForbiddenException(ERRORS.RESOURCE_DUP);
      }
      return this.create(cDto);
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  /**
   * 获取审核者信息
   */
  async getOne(
    findData: FindConditions<AuditorEntity>,
    fields: any[] = aeFields,
  ): Promise<AuditorEntity> {
    return this.findOne(findData, fields);
  }
}
