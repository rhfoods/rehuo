import { TMapKey } from '@rehuo/common/constants/lbs.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';
import { HttpService } from '@rehuo/common/providers/http.service';
import { PointUtilsService } from '@rehuo/map/modules/point/services/point.utils.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { Equal, MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeMapShow1612671042529 implements MigrationInterface {
  private async getPOI(latitude: number, longitude: number): Promise<string> {
    const lbsKey =
      process.env.APP_ENV === SystemEnvironments.PROD ? TMapKey.PROD : TMapKey.DEV;
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${lbsKey}&get_poi=1`;
    let result;

    try {
      result = await HttpService.get(url);
    } catch (err) {
      throw new Error(err);
    }
    return result.body.result.ad_info.adcode;
  }

  /**
   * 异步延迟
   * @param {number} time 延迟的时间,单位毫秒
   */
  sleep(time = 0) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  /**
   * 更新点位所属区域编码
   */
  private async updatePointCode(queryRunner: QueryRunner): Promise<any> {
    const pointRepo = queryRunner.connection.getRepository(MapPointEntity);
    const points = await pointRepo.find({
      where: { code: Equal('') },
      select: ['pointId', 'latitude', 'longitude'],
    });

    let counts = 0;
    for (let i = 0; i < points.length; i++) {
      const code = await this.getPOI(points[i].latitude, points[i].longitude);
      await pointRepo.update({ pointId: points[i].pointId }, { code });
      counts++;
      if (counts === 5) {
        await this.sleep(1000);
        counts = 0;
      }
    }
  }

  private async updatePointCounts(queryRunner: QueryRunner): Promise<any> {
    const connection = queryRunner.connection;
    try {
      await connection.transaction('READ COMMITTED', async txEntityManager => {
        let psaveCounts = await txEntityManager.count(PointSaveEntity);
        let skip = 0;
        do {
          let take = 10;
          if (psaveCounts > take) {
            psaveCounts -= take;
          } else {
            take = psaveCounts;
            psaveCounts = 0;
          }
          const psaveAlias = 'psave',
            pointAlias = 'point';
          const queryFields = [
            `${psaveAlias}.psaveId`,
            `${psaveAlias}.pointId`,
            `${psaveAlias}.userId`,
            `${pointAlias}.code`,
          ];
          const psaves: any = await txEntityManager
            .createQueryBuilder(PointSaveEntity, psaveAlias)
            .innerJoinAndMapOne(
              `${psaveAlias}.point`,
              MapPointEntity,
              pointAlias,
              `${pointAlias}.pointId = ${psaveAlias}.pointId`,
            )
            .select(queryFields)
            .skip(skip)
            .take(take)
            .getMany();

          for (let i = 0; i < psaves.length; i++) {
            await PointUtilsService.incrementPCP(
              txEntityManager,
              psaves[i].userId,
              psaves[i].point.code,
            );
          }

          skip += take;
        } while (psaveCounts > 0);
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `city_points` (`cp_id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `user_id` int UNSIGNED NOT NULL COMMENT '创建者ID', `code` varchar(6) NOT NULL COMMENT '城市编码', `counts` int UNSIGNED NOT NULL COMMENT '对应的点位数' DEFAULT '0', UNIQUE INDEX `IDX_00c0e0d5f4a9cfdf35ace4aec9` (`user_id`, `code`), INDEX `IDX_a5432b6840b58e144891a141e1` (`user_id`, `counts`), PRIMARY KEY (`cp_id`)) ENGINE=InnoDB",
    );

    await queryRunner.query(
      "CREATE TABLE `country_points` (`cp_id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `user_id` int UNSIGNED NOT NULL COMMENT '创建者ID', `code` varchar(6) NOT NULL COMMENT '区县编码', `counts` int UNSIGNED NOT NULL COMMENT '对应的点位数' DEFAULT '0', UNIQUE INDEX `IDX_748c53a6d594123a30ba726214` (`user_id`, `code`), PRIMARY KEY (`cp_id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `province_points` (`pp_id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `user_id` int UNSIGNED NOT NULL COMMENT '创建者ID', `code` varchar(2) NOT NULL COMMENT '省直辖市编码', `counts` int UNSIGNED NOT NULL COMMENT '对应的点位数' DEFAULT '0', UNIQUE INDEX `IDX_68625b07089ff2d7bfb797eda6` (`user_id`, `code`), PRIMARY KEY (`pp_id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "ALTER TABLE `point_notes` ADD `is_audit` tinyint UNSIGNED NOT NULL COMMENT '文章是否被审查' DEFAULT 0",
    );

    await queryRunner.query(
      "ALTER TABLE `point_sorts` ADD `city_code` varchar(6) NOT NULL COMMENT '城市编码' DEFAULT ''",
    );
    await queryRunner.query(
      "ALTER TABLE `point_sorts` ADD `logo` varchar(32) NOT NULL COMMENT '默认LOGO' DEFAULT ''",
    );
    await queryRunner.query(
      "ALTER TABLE `point_notes` CHANGE `medias` `medias` text NULL COMMENT '文章图片或者视频' DEFAULT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `point_notes` CHANGE `scenes` `scenes` text NULL COMMENT '适用场景' DEFAULT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `point_saves` CHANGE `logo` `logo` varchar(32) NOT NULL COMMENT '点位展示LOGO'",
    );
    await queryRunner.query(
      "ALTER TABLE `map_points` ADD `code` varchar(6) NOT NULL COMMENT '点位所属地区编码' DEFAULT ''",
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_23e9ff221272064a39bddfb48f` ON `map_points` (`point_id`, `code`)',
    );

    await this.updatePointCode(queryRunner);
    await this.updatePointCounts(queryRunner);
    await queryRunner.query('DROP TABLE IF EXISTS `province_point_entity`');
    await queryRunner.query('DROP TABLE IF EXISTS `city_point_entity`');
    await queryRunner.query('DROP TABLE IF EXISTS `country_point_entity`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_23e9ff221272064a39bddfb48f` ON `map_points`',
    );
    await queryRunner.query('ALTER TABLE `map_points` DROP COLUMN `code`');
    await queryRunner.query(
      "ALTER TABLE `point_saves` CHANGE `logo` `logo` varchar(32) NOT NULL COMMENT '点位头像'",
    );
    await queryRunner.query(
      "ALTER TABLE `point_notes` CHANGE `scenes` `scenes` text NULL COMMENT '适用场景'",
    );
    await queryRunner.query(
      "ALTER TABLE `point_notes` CHANGE `medias` `medias` text NULL COMMENT '文章图片或者视频'",
    );
    await queryRunner.query('ALTER TABLE `point_sorts` DROP COLUMN `logo`');
    await queryRunner.query('ALTER TABLE `point_sorts` DROP COLUMN `city_code`');
    await queryRunner.query('ALTER TABLE `point_notes` DROP COLUMN `is_audit`');
    await queryRunner.query(
      'DROP INDEX `IDX_68625b07089ff2d7bfb797eda6` ON `province_points`',
    );
    await queryRunner.query('DROP TABLE `province_points`');
    await queryRunner.query(
      'DROP INDEX `IDX_748c53a6d594123a30ba726214` ON `country_points`',
    );
    await queryRunner.query('DROP TABLE `country_points`');
    await queryRunner.query(
      'DROP INDEX `IDX_00c0e0d5f4a9cfdf35ace4aec9` ON `city_points`',
    );
    await queryRunner.query('DROP TABLE `city_points`');
  }
}
