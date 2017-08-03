/*
 * LiskHQ/lisky
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import fse from 'fs-extra';
import config from '../../config.json';
import liskInstance from '../utils/liskInstance';
import { CONFIG_VARIABLES } from '../utils/constants';

const writeConfigToFile = (newConfig) => {
	const configString = JSON.stringify(newConfig, null, '\t');
	fse.writeFileSync('config.json', `${configString}\n`, 'utf8');
};

const checkBoolean = value => ['true', 'false'].includes(value);

const setNestedConfigProperty = newValue => (obj, pathComponent, i, path) => {
	if (i === path.length - 1) {
		// eslint-disable-next-line no-param-reassign
		obj[pathComponent] = newValue;
		return config;
	}
	return obj[pathComponent];
};

const setBoolean = (variable, path) => (value) => {
	if (!checkBoolean(value)) {
		return `Cannot set ${variable} to ${value}.`;
	}

	const newValue = (value === 'true');
	path.reduce(setNestedConfigProperty(newValue), config);

	if (variable === 'testnet') {
		liskInstance.setTestnet(newValue);
	}

	writeConfigToFile(config);
	return `Successfully set ${variable} to ${value}.`;
};

const handlers = {
	json: setBoolean('json output', ['json']),
	testnet: setBoolean('testnet', ['liskJS', 'testnet']),
};

const set = vorpal => ({ variable, value }) => {
	const returnValue = CONFIG_VARIABLES.includes(variable)
		? handlers[variable](value)
		: 'Unsupported variable name.';

	return Promise.resolve(vorpal.log(returnValue));
};

export default function setCommand(vorpal) {
	vorpal
		.command('set <variable> <value>')
		.description('Set configuration <variable> to <value>.')
		.autocomplete(CONFIG_VARIABLES)
		.action(set(vorpal));
}
