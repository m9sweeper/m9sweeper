KnexNest
========
[![Build Status](https://travis-ci.org/CoursePark/KnexNest.svg?branch=master)](https://travis-ci.org/CoursePark/KnexNest)
[![Coverage Status](https://coveralls.io/repos/CoursePark/KnexNest/badge.svg?branch=master&service=github)](https://coveralls.io/github/CoursePark/KnexNest?branch=master)

Takes a Knex.js select query object and hydarates a list of nested objects using the NestHydration npm module.

This can be simply accomplished without this library by doing

```javascript
return knex.select(...)
	.then(NestHydrationJS.nest)
	.then(function (data) {
		...
	})
;
```

However Postgres limits column names to 63 characters and this becomes a problem when trying to nest objects several deep using NestHydration. A column name such as `_activeUser_purchases__product_originalManufacturer_logoSmall_url` would be too long and would cause nasty behavior. This module handles this problem by mapping long names to shorter ones and then returning them with a structPropToColumnMap object passed to NestHydration.

Example Usage
-------------

```javascript
var Knex = require('knex');
var knexnest = require('knexnest');

var knex = Knex({
	client: 'postgres',
	connection: process.env.DATABASE_URL
});

var sql = knex
	.select(
		'c.id    AS _id',
		'c.title AS _title',
		't.id    AS _teacher_id',
		't.name  AS _teacher_name',
		'l.id    AS _lesson__id',
		'l.title AS _lesson__title'
	)
	.from('course AS c')
	.innerJoin('teacher AS t', 't.id', 'c.teacher_id')
	.innerJoin('course_lesson AS cl', 'cl.course_id', 'c.id')
	.innerJoin('lesson AS l', 'l.id', 'cl.lesson_id')
;
knexnest(sql).then(function (data) {
	result = data;
});
/* result should be like:
[
	{id: '1', title: 'Tabular to Objects', teacher: {id: '1', name: 'David'}, lesson: [
		{id: '1', title: 'Defintions'},
		{id: '2', title: 'Table Data'},
		{id: '3', title: 'Objects'}
	]},
	{id: '2', title: 'Column Names Define Structure', teacher: {id: '2', name: 'Chris'}, lesson: [
		{id: '4', title: 'Column Names'},
		{id: '2', title: 'Table Data'},
		{id: '3', title: 'Objects'}
	]},
	{id: '3', title: 'Object On Bottom', teacher: {id: '1', name: 'David'}, lesson: [
		{id: '5', title: 'Non Array Input'},
	]}
]
*/
```

Related Projects
----------------

- [NestHydrationJS](https://github.com/CoursePark/NestHydrationJS) : The base project
