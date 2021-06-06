import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SqlOrderTypes } from '../constants/sql.constant';
import { SystemConstants } from '../constants/system.constant';

/**
 * 查询请求页DTO
 */
export class PageRequestDTO {
  @IsEnum(SqlOrderTypes)
  @IsOptional()
  @Transform(v => (v === null ? SqlOrderTypes.DESC : v))
  @ApiProperty({
    enum: SqlOrderTypes,
    default: SqlOrderTypes.ASC,
    required: false,
    description: '查询返回的排序方式',
  })
  order: SqlOrderTypes = SqlOrderTypes.DESC;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  @Transform(v => (v === null ? 0 : v))
  @ApiProperty({
    minimum: 0,
    default: 0,
    description: '查询起始值',
    required: false,
  })
  start: number = 0;

  @IsInt()
  @Type(() => Number)
  @Min(SystemConstants.SQLDB_QUERY_PAGE_COUNT_MIN)
  @Max(SystemConstants.SQLDB_QUERY_PAGE_COUNT_MAX)
  @Transform(v => (v === null ? SystemConstants.SQLDB_QUERY_PAGE_COUNT_DEFAULT : v))
  @IsOptional()
  @ApiProperty({
    minimum: SystemConstants.SQLDB_QUERY_PAGE_COUNT_MIN,
    maximum: SystemConstants.SQLDB_QUERY_PAGE_COUNT_MAX,
    default: SystemConstants.SQLDB_QUERY_PAGE_COUNT_DEFAULT,
    required: false,
    description: '每次返回的信息条数',
  })
  take: number = SystemConstants.SQLDB_QUERY_PAGE_COUNT_DEFAULT;

  get skip(): number {
    return this.start;
  }

  constructor(start, take, order) {
    this.start = start;
    this.take = take;
    this.order = order;
  }
}
