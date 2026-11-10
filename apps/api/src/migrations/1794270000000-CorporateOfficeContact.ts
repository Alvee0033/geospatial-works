import { MigrationInterface, QueryRunner } from 'typeorm';

/** Stores the verified public office details while retaining unrelated contact settings. */
export class CorporateOfficeContact1794270000000 implements MigrationInterface {
  name = 'CorporateOfficeContact1794270000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const content = {
      officeName: 'Corporate Office',
      companyName: 'Geospatial Works',
      address: 'Plot 14, Road 02',
      area: 'Aram Housing, 40ft, Bosila, Mohammadpur',
      city: 'Dhaka',
      postalCode: '1207',
      country: 'Bangladesh',
      phone: '+880 1713 90 77 79',
      phoneSecondary: '',
      emergencyHotline: '',
      email: 'md.geospatialworks@gmail.com',
      emailInquiries: 'md.geospatialworks@gmail.com',
      emailCareers: 'md.geospatialworks@gmail.com',
      website: 'https://www.geospatialworks.com.bd',
      whatsAppNumber: '8801713907779',
      latitude: '',
      longitude: '',
      mapEmbedUrl: 'https://www.google.com/maps?q=Plot%2014%2C%20Road%2002%2C%20Aram%20Housing%2C%2040ft%2C%20Bosila%2C%20Mohammadpur%2C%20Dhaka-1207&output=embed',
    };

    await queryRunner.query(
      `INSERT INTO "page_sections" ("pageKey", "sectionKey", "title", "subtitle", "content", "isActive", "createdAt", "updatedAt")
       VALUES ('contact', 'contact_info', 'Geospatial Works', 'Corporate Office', $1::jsonb, true, now(), now())
       ON CONFLICT ("pageKey", "sectionKey") DO UPDATE SET
         "title" = EXCLUDED."title",
         "subtitle" = EXCLUDED."subtitle",
         "content" = COALESCE("page_sections"."content", '{}'::jsonb) || EXCLUDED."content",
         "isActive" = true,
         "updatedAt" = now()`,
      [JSON.stringify(content)],
    );
  }

  async down(): Promise<void> {
    // Keep contact settings on rollback because they are also editable from the admin panel.
  }
}
