const assert = require('assert');

// import * as constants from "constants";
const constants = require('./constants');
// const { UsingOriginalTruffle, UsingRegularMocha } = require('./constants');

let deposit;
let initiator
let counterpart;
let factory;
let web3Helper;
let typeOfRun;

module.exports = {
	initDeposit(_deposit, _initiator, _counterpart, _isUsingTruffle) {
		typeOfRun = _isUsingTruffle;
		deposit = _deposit;
		initiator = _initiator;
		counterpart = _counterpart;
	},
	async viewCurrentDeposit() {
		if (typeOfRun == constants.UsingOriginalTruffle) {
			initiatorDeposit = await deposit.viewCurrentDeposit.call(initiator);
			counterpartDeposit = await deposit.viewCurrentDeposit.call(counterpart);
			// [initiatorDeposit, counterpartDeposit] = await deposit.viewCurrentDeposit.call();
		} else {
			assert(false, 'not yet implemented')
		}
		return [initiatorDeposit, counterpartDeposit];
	},
	async viewCurrentDeposit(party) {
		if (typeOfRun == constants.UsingOriginalTruffle) {
			partyDeposit = await deposit.viewCurrentDeposit.call(party);
		} else {
			assert(false, 'not yet implemented')
		}
		// partyDeposit = await deposit.viewCurrentDeposit.call(party);
		return partyDeposit;
	},
	async getCurrentStage() {
		if (typeOfRun == constants.UsingOriginalTruffle) {
			currentState = await deposit.state.call();
			currentStage = currentState[1].toNumber();//stage, fron BigNumber
		} else {
			assert(false, 'not yet implemented')
		}
		return currentStage;
	}
}
