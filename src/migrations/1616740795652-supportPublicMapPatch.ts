import { MigrationInterface, QueryRunner } from 'typeorm';

export class supportPublicMapPatch1616740795652 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_352df9560dd22aabdce89b5864` ON`point_sorts`',
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX`IDX_91d467a39eb38991b8394762b3` ON`point_sorts`(`user_id`, `name`, `city_code`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
