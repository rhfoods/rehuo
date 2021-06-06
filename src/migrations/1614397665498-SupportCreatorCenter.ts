import { NoteStatService } from '@rehuo/map/modules/point/modules/note/services/note.stat.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { Equal, MigrationInterface, MoreThan, Not, QueryRunner } from 'typeorm';

export class SupportCreatorCenter1614397665498 implements MigrationInterface {
  /**
   * 升级点位表
   */
  private async updateMapPoints(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `map_points` ADD `name` varchar(128) CHARACTER SET utf8mb4 NOT NULL COMMENT '点位名称' DEFAULT ''",
    );
    await queryRunner.query(
      'DROP INDEX `IDX_528c756900b416c8ed971b2b37` ON `map_points`',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_9ae6d4e82e9c908f9fe0c4f0ee` ON `map_points` (`latitude`,`longitude`,`name`,`address`)',
    );

    const pointRepo = queryRunner.connection.getRepository(MapPointEntity);
    const psaveRepo = queryRunner.connection.getRepository(PointSaveEntity);
    const points = await pointRepo.find({
      select: ['pointId'],
    });
    for (let i = 0; i < points.length; i++) {
      const psave = await psaveRepo.findOne({
        where: { pointId: points[i].pointId },
        withDeleted: true,
        select: ['name'],
      });
      if (psave) {
        await pointRepo.update({ pointId: points[i].pointId }, { name: psave.name });
      }
    }
  }

  /**
   * 升级点位分类表
   */
  private async updatePointSorts(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_6f0b1076076beb5437fe9bed93` ON`point_sorts`',
    );
    await queryRunner.query(
      'ALTER TABLE `point_sorts` CHANGE`sortId` `sort_id` int NOT NULL AUTO_INCREMENT',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_a0cb7725f9f04fc9a3f63d9a7f` ON`point_sorts`(`sort_id`, `user_id`)',
    );
  }

  /**
   * 升级用户表
   */
  private async updateUsers(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      "ALTER TABLE `users` ADD `wx_unionid` varchar(32) NOT NULL DEFAULT '' COMMENT '微信unionID'",
    );
    await queryRunner.query(
      "ALTER TABLE `users` ADD `wx_copenid` varchar(32) NOT NULL DEFAULT '' COMMENT '微信创作者openID'",
    );
    await queryRunner.query(
      "ALTER TABLE `users` ADD `wx_popenid` varchar(32) NOT NULL DEFAULT '' COMMENT '公众号openID'",
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_6d3f0d57b92b90aaf908fb129b` ON `users` (`wx_unionid`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_66c11fe70415a9028a7b593f41` ON `users` (`wx_copenid`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_ad08d328bcfa9748ab52ed1267` ON `users` (`wx_popenid`)',
    );
  }

  /**
   * 增加新表
   */
  private async addNewTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `point_recommends` (`pr_id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `longitude` decimal(10, 5) NOT NULL COMMENT '点位经度', `latitude` decimal(10, 5) NOT NULL COMMENT '点位纬度', `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '点位地址', `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '点位名称', `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT '推荐理由', `medias` text COMMENT '推荐图片', `is_audit` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '文章是否被审查', `user_id` int unsigned NOT NULL DEFAULT '0' COMMENT '推荐者ID', PRIMARY KEY(`pr_id`)) ENGINE = InnoDB",
    );

    await queryRunner.query(
      "CREATE TABLE `user_recommends` (`rp_id` int NOT NULL AUTO_INCREMENT,`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),`note_id` int unsigned NOT NULL DEFAULT '0' COMMENT '推荐的文章ID',`psave_id` int unsigned NOT NULL DEFAULT '0' COMMENT '推荐的点位收藏ID',PRIMARY KEY(`rp_id`)) ENGINE = InnoDB",
    );

    await queryRunner.query(
      "CREATE TABLE`public_citys`( `pc_id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `code` varchar(6) NOT NULL COMMENT '城市编码', PRIMARY KEY(`pc_id`), UNIQUE KEY`IDX_5f4a0012d862125985c4b5bfad`(`code`)) ENGINE = InnoDB",
    );

    await queryRunner.query(
      "CREATE TABLE`user_publics`(`tp_id` int NOT NULL AUTO_INCREMENT,`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),`provider_id` int unsigned NOT NULL COMMENT '迁移发起者ID',`code` varchar(6) NOT NULL COMMENT '城市编码',PRIMARY KEY(`tp_id`)) ENGINE = InnoDB",
    );
  }

  /**
   * 更新文章表数据
   */
  private async updateUserNoteLikes(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.connection
      .getRepository(UserEntity)
      .find({ select: ['userId'] });

    for (let i = 0; i < users.length; i++) {
      let likes = 0;
      const psaves = await queryRunner.connection
        .getRepository(PointSaveEntity)
        .find({ where: { userId: users[i].userId, noteId: Not(0) }, select: ['noteId'] });
      for (let j = 0; j < psaves.length; j++) {
        const nstat = await queryRunner.connection
          .getRepository(NoteStatEntity)
          .findOne({ where: { noteId: psaves[j].noteId }, select: ['likes'] });
        likes += nstat.likes;
      }
      if (likes > 0) {
        await queryRunner.connection
          .getRepository(UserStatEntity)
          .update({ userId: users[i].userId }, { noteLikes: likes });
      }
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addNewTables(queryRunner);
    await this.updatePointSorts(queryRunner);
    await this.updateMapPoints(queryRunner);
    await this.updateUsers(queryRunner);
    await this.updateUserNoteLikes(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * 回退用户表
     */
    await queryRunner.query('DROP INDEX `IDX_6d3f0d57b92b90aaf908fb129b` ON `users`');
    await queryRunner.query('DROP INDEX `IDX_66c11fe70415a9028a7b593f41` ON `users`');
    await queryRunner.query('DROP INDEX `IDX_ad08d328bcfa9748ab52ed1267` ON `users`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `wx_unionid`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `wx_copenid`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `wx_popenid`');

    /**
     * 回退点位表
     */
    await queryRunner.query(
      'DROP INDEX `IDX_9ae6d4e82e9c908f9fe0c4f0ee` ON `map_points`',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_528c756900b416c8ed971b2b37` ON `map_points` (`latitude`,`longitude`,`address`)',
    );
    await queryRunner.query('ALTER TABLE `map_points` DROP COLUMN `name`');

    /**
     * 回退点位分类表
     */
    await queryRunner.query(
      'DROP INDEX `IDX_a0cb7725f9f04fc9a3f63d9a7f` ON`point_sorts`',
    );
    await queryRunner.query(
      'ALTER TABLE `point_sorts` CHANGE`sort_id` `sortId` int NOT NULL AUTO_INCREMENT',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_6f0b1076076beb5437fe9bed93` ON`point_sorts`(`sortId`, `user_id`)',
    );

    /**
     * 删除新建表
     */
    await queryRunner.query('DROP TABLE `point_recommends`');
    await queryRunner.query('DROP TABLE `user_recommends`');
    await queryRunner.query('DROP TABLE`public_citys`');
    await queryRunner.query('DROP TABLE`user_publics`');
  }
}
