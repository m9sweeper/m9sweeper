'use strict';

var knexnest = require('../knexnest.js');

var createMockKnexQuery = function (client, queryType, data) {
	var expectedClient = client === 'postgres'
		? {config: {client: 'postgres'}}
		: {Raw: {name: client}}
	;
	var arr = queryType === 'array' ? '_' : '';
	return {
		client: expectedClient,
		_statements: [
			{grouping: 'columns', value: [
				'something.id AS "' + arr + 'shortName"',
				'something.someproperty AS "' + arr + 'startingShortOkNotSoShortGettingLongOkThisQualifiesAsALongReallyReallyLongName"'
			]},
			{grouping: 'otherstuff', value: ['should not show up in column list']},
			{grouping: 'columns', value: [
				'something.someproperty AS "' + arr + 'someproperty"'
			]},
			{grouping: 'columns', value: [
				'something.id AS ' + arr + 'anotherShortName',
				'something.someproperty AS ' + arr + 'anotherStartingShortOkNotSoShortGettingLongOkThisQualifiesAsALongReallyReallyLongName'
			]},
			{grouping: 'columns', value: [
				'"something".otherProperty AS "' + arr + 'quotesEverywhere"',
				'"something".whatProperty AS ' + arr + 'quotesThereButNotHere'
			]},
			{grouping: 'columns', value: [
				'something.someproperty AS ' + arr + 'aliasAfterAS',
				'something.someproperty As ' + arr + 'aliasAfterAs',
				'something.someproperty aS ' + arr + 'aliasAfteraS',
				'something.someproperty as ' + arr + 'aliasAfteras'
			]}
		],
		then: function (callback) {
			return new Promise(function (resolve) {
				process.nextTick(function () {
					resolve(callback(data));
				});
			});
		},
		catch: function () {
		}
	};
};

describe('KnexNest', function () {
	var result, error;
	
	var fullDataSetFromPostgres = [{
		_shortName: '1A',
		col_0_hortGettingLongOkThisQualifiesAsALongReallyReallyLongName: '1B',
		_someproperty: '1C',
		_anotherShortName: '1D',
		col_1_hortGettingLongOkThisQualifiesAsALongReallyReallyLongName: '1E',
		_quotesEverywhere: '1F',
		_quotesThereButNotHere: '1G',
		_aliasAfterAS: '1H',
		_aliasAfterAs: '1I',
		_aliasAfteraS: '1J',
		_aliasAfteras: '1K'
	}];
	var fullDataSetFromNonPostgres = [{
		_shortName: '1A',
		_startingShortOkNotSoShortGettingLongOkThisQualifiesAsALongReallyReallyLongName: '1B',
		_someproperty: '1C',
		_anotherShortName: '1D',
		_anotherStartingShortOkNotSoShortGettingLongOkThisQualifiesAsALongReallyReallyLongName: '1E',
		_quotesEverywhere: '1F',
		_quotesThereButNotHere: '1G',
		_aliasAfterAS: '1H',
		_aliasAfterAs: '1I',
		_aliasAfteraS: '1J',
		_aliasAfteras: '1K'
	}];
	var expectedFullDataResult = [{
		shortName: '1A',
		startingShortOkNotSoShortGettingLongOkThisQualifiesAsALongReallyReallyLongName: '1B',
		someproperty: '1C',
		anotherShortName: '1D',
		anotherStartingShortOkNotSoShortGettingLongOkThisQualifiesAsALongReallyReallyLongName: '1E',
		quotesEverywhere: '1F',
		quotesThereButNotHere: '1G',
		aliasAfterAS: '1H',
		aliasAfterAs: '1I',
		aliasAfteraS: '1J',
		aliasAfteras: '1K'
	}];
	
	var scenarioList = [
		{
			describe: 'column name compliance for postgres connection and knex < 0.8.0',
			mockKnexQuery: createMockKnexQuery('Raw_PG', 'array', fullDataSetFromPostgres),
			listOnEmpty: undefined,
			it: 'should map the column names',
			expectResult: expectedFullDataResult,
			expectError: null
		},
		{
			describe: 'column name compliance for postgres connection and knex >= 0.8.0',
			mockKnexQuery: createMockKnexQuery('postgres', 'array', fullDataSetFromPostgres),
			listOnEmpty: undefined,
			it: 'should map the column names',
			expectResult: expectedFullDataResult,
			expectError: null
		},
		{
			describe: 'column name compliance for non-postgres connection',
			mockKnexQuery: createMockKnexQuery('Raw', 'array', fullDataSetFromNonPostgres),
			listOnEmpty: undefined,
			it: 'should map the column names',
			expectResult: expectedFullDataResult,
			expectError: null
		},
		{
			describe: 'array query with empty result and no listOnEmpty hint for postgres connection',
			mockKnexQuery: createMockKnexQuery('postgres', 'array', []),
			listOnEmpty: undefined,
			it: 'should return an empty array',
			expectResult: [],
			expectError: null
		},
		{
			describe: 'array query with empty result and listOnEmpty hint for postgres connection',
			mockKnexQuery: createMockKnexQuery('postgres', 'array', []),
			listOnEmpty: true,
			it: 'should return an empty array',
			expectResult: [],
			expectError: null
		},
		{
			describe: 'array query with empty result and no listOnEmpty hint for non-postgres connection',
			mockKnexQuery: createMockKnexQuery('Raw', 'array', []),
			listOnEmpty: undefined,
			it: 'should return null',
			expectResult: null,
			expectError: null
		},
		{
			describe: 'array query with empty result and listOnEmpty hint for non-postgres connection',
			mockKnexQuery: createMockKnexQuery('Raw', 'array', []),
			listOnEmpty: true,
			it: 'should return empty array',
			expectResult: [],
			expectError: null
		},
		{
			describe: 'object query with empty result and no listOnEmpty hint for postgres connection',
			mockKnexQuery: createMockKnexQuery('postgres', 'object', []),
			listOnEmpty: undefined,
			it: 'should return an empty array',
			expectResult: null,
			expectError: null
		},
		{
			describe: 'object query with empty result and listOnEmpty hint for postgres connection',
			mockKnexQuery: createMockKnexQuery('postgres', 'object', []),
			listOnEmpty: true,
			it: 'should throw error',
			expectResult: null,
			expectError: 'listOnEmpty param conflicts with query which specifies an object or null result'
		},
		{
			describe: 'object query with empty result and no listOnEmpty hint for non-postgres connection',
			mockKnexQuery: createMockKnexQuery('Raw', 'object', []),
			listOnEmpty: undefined,
			it: 'should return null',
			expectResult: null,
			expectError: null
		},
		{
			describe: 'object query with empty result and listOnEmpty hint for non-postgres connection',
			mockKnexQuery: createMockKnexQuery('Raw', 'object', []),
			listOnEmpty: true,
			it: 'should return an empty array',
			expectResult: [],
			expectError: null
		}
	];
	
	for (var i = 0; i < scenarioList.length; i++) {
		var scenario = scenarioList[i];
		describe(scenario.describe, function () {
			beforeEach(function (done) {
				result = error = undefined;
				
				knexnest(scenario.mockKnexQuery, scenario.listOnEmpty)
					.then(function (data) {
						result = data;
						done();
					})
					.catch(function (err) {
						error = err;
						done();
					})
				;
			});
			
			it(scenario.it, function () {
				if (scenario.expectError) {
					expect(error).toEqual(scenario.expectError);
				} else {
					expect(result).toEqual(scenario.expectResult);
				}
			});
		});
	}
});
