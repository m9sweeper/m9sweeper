import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('kubernetes_images', table => {
        table.integer('image_id').nullable();
        table.foreign('image_id').references('images.id').withKeyName('kubernetes_images_images_foreign_key');
    }).then(() => {
        return knex.raw("update kubernetes_images " +
            "set image_id = (SELECT i.id FROM images as i where CONCAT(i.url, " +
            "CASE WHEN (i.name <> '' OR i.name IS NOT NULL) THEN '/' || i.name ELSE '' END, " +
            "CASE WHEN (i.tag <> '' OR i.tag IS NOT NULL) THEN ':' || i.tag ELSE '' END) " +
            "= kubernetes_images.image AND i.docker_image_id = kubernetes_images.image_hash " +
            "AND i.cluster_id = kubernetes_images.cluster_id order by kubernetes_images.id desc limit 1)"
        )
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
