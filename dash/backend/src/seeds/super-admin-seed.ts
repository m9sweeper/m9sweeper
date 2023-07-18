import { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

exports.seed = async function (knex: Knex): Promise<any> {
  const hasUser = !!(await knex('users').returning('id').then(results => !!results ? results[0]?.id : null));
  if (hasUser) {
    //@TODO: remove log message when cleaning up CLI messages
    console.log('User exists... skipping');
    return Promise.resolve(true);
  }
  return knex('users').insert({
    email: process.env.SUPER_ADMIN_EMAIL,
    first_name: 'Super',
    last_name: 'Admin',
    phone: '',
    source_system_id: '0',
    source_system_type: 'LOCAL_AUTH',
    source_system_user_id: '0',
    password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, await bcrypt.genSalt(10))
  }, ['id']).then(userIds => {
    return knex('user_authorities').insert({user_id: userIds[0].id, authority_id: 1});
  });
};
