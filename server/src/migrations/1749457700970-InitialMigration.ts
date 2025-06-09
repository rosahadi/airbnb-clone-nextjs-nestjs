import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1749457700970 implements MigrationInterface {
  name = 'InitialMigration1749457700970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "favorite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "propertyId" uuid, CONSTRAINT "PK_495675cec4fb09666704e4f610f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "comment" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "propertyId" uuid, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status_enum" AS ENUM('pending_payment', 'confirmed', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subTotal" integer NOT NULL, "cleaning" integer NOT NULL, "service" integer NOT NULL, "tax" integer NOT NULL, "orderTotal" integer NOT NULL, "totalNights" integer NOT NULL, "checkIn" TIMESTAMP NOT NULL, "checkOut" TIMESTAMP NOT NULL, "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending_payment', "paymentStatus" boolean NOT NULL DEFAULT false, "stripeSessionId" character varying, "stripePaymentIntentId" character varying, "paymentCompletedAt" TIMESTAMP, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "propertyId" uuid NOT NULL, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "tagline" character varying NOT NULL, "category" character varying NOT NULL, "image" character varying NOT NULL, "country" character varying NOT NULL, "description" character varying NOT NULL, "price" integer NOT NULL, "guests" integer NOT NULL, "bedrooms" integer NOT NULL, "beds" integer NOT NULL, "baths" integer NOT NULL, "amenities" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "roles" text array NOT NULL DEFAULT '{user}', "profileImage" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationExpires" TIMESTAMP, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_ccdc459572d1ae97dea4281fb3b" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_d5fcfc0cc81813136b646d2a5a1" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_336b3f4a235460dc93645fbf222" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_aaacfb3ddf4c074dc358a9a94a0" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_d90007b39cfcf412e15823bebc1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_d90007b39cfcf412e15823bebc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_aaacfb3ddf4c074dc358a9a94a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_336b3f4a235460dc93645fbf222"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_d5fcfc0cc81813136b646d2a5a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "FK_ccdc459572d1ae97dea4281fb3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "property"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
    await queryRunner.query(`DROP TABLE "review"`);
    await queryRunner.query(`DROP TABLE "favorite"`);
  }
}
