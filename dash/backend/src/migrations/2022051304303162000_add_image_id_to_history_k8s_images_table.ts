import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('history_kubernetes_images', table => {
      table.integer('image_id').nullable();
      table.foreign('image_id').references('images.id').withKeyName('history_kubernetes_images_image_id_foreign');
  }).then(() => {
      return knex.raw("update history_kubernetes_images " +
          "set image_id = (SELECT i.id FROM images as i where CONCAT(i.url, " +
          "CASE WHEN (i.name <> '' OR i.name IS NOT NULL) THEN '/' || i.name ELSE '' END, " +
          "CASE WHEN (i.tag <> '' OR i.tag IS NOT NULL) THEN ':' || i.tag ELSE '' END) " +
          "= history_kubernetes_images.image AND i.docker_image_id = history_kubernetes_images.image_hash " +
          "AND i.cluster_id = history_kubernetes_images.cluster_id order by history_kubernetes_images.id desc limit 1)"
          )
  });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
