// Importing libraries and misc. for testing
const assert = require('assert');
//const ganache = require('ganache-cli');
//const Web3 = require('web3');
//const provider = ganache.provider();
//const web3 = new Web3(provider);//TODO under trial
const web3Helper = require('../../helpers/web3-helper');

// Importing additional functions
const testHelper = require('../../helpers/test-helper');
const depositHelper = require('../../helpers/DepositMethods');
// import * as constants from "../../helpers/constants";
const constants = require('../../helpers/constants');
const Stages = constants.Stages;

// Importing the contracts
const DepositFactory = artifacts.require("DepositFactory");
const DepositContract = artifacts.require("Deposit");
const SgxSimulator = artifacts.require("SgxSimulator");

// Constants:
//const RESTRICTED_INITIATOR_ONLY = "VM Exception while processing transaction: revert Restricted to initiator only: restrictedInit";
const RESTRICTED_INITIATOR_ONLY =
	'VM Exception while processing transaction: revert You lack permissions for this action';
const RESTRICTED_COUNTERPART_ONLY =
	'VM Exception while processing transaction: revert Restricted to counterpart only: restrictedCounter';
const RESTRICTED_COUNTERPART_IS_INITIATOR =
	'VM Exception while processing transaction: revert Party is already the initiator';
const RESTRICTED_COUNTERPART_ALREADY_SET = '';
const RESTRICTED_COUNTERPART_NOT_YET_SET = '';
const RESTRICTED_CONTRACT_IS_LOCKED = '';
const RESTRICTED_ONLY_INVOLVED_PARTIES = '';
const INIT_VALUE = 1;
const FEE_VALUE = 1;
const A_DEPOSIT = 1;
const B_DEPOSIT = 1;

//let accounts;
// let web3;

// Values used accross tests:
let factory, deposit;
let depositAddress;
let initiator, counterpart, attacker, SgxAddress;
SgxAddress = "0xBF04C8BD7C8897C315F3040FFD5C8F935587AD1A";//From deployment
let initialValue = INIT_VALUE;
let aDeposit = A_DEPOSIT;
let bDeposit = B_DEPOSIT;

contract("DepositFactory", accounts => {
	beforeEach(async () => {
		initiator = accounts[0];
		counterpart = accounts[1];
		attacker = accounts[2];
		SgxAddress = accounts[3];
		//Don't use the same factory on all tests, can cause confusion
		// factory = await DepositFactory.deployed();
		factory = await DepositFactory.new();//New contract for every "it" run
		var result = await factory.createDeposit({
			from: initiator,
			gas: '3000000',
			value: initialValue + FEE_VALUE
		});
		depositAddress = result.logs[0].args._contract;
		var creator = result.logs[0].args._creator;
		assert.equal(creator, initiator);
		let depositResult;
		[depositResult] = await factory.getDepositContract(initiator);
		assert.equal(depositAddress, depositResult);
		deposit = DepositContract.at(depositAddress);
		Sgx = SgxSimulator.at(SgxAddress);
		depositHelper.initDeposit(deposit, initiator, counterpart, constants.UsingOriginalTruffle);
	});

	// describe('Basic deployment of contracts', () => {
	// 	it('deploys a factory and a deposit contract', () => {
	// 		assert.ok(factory.address);
	// 		assert.ok(deposit.address);
	// 	});
	//
	// 	it("saves contract in factory's deployed contracts", async () => {
	// 		assert.equal(
	// 			depositAddress, await factory.deployedDeposits.call(initiator, 0)
	// 		);
	// 	});
	// });

	describe('Deposit contract values after creation', () => {
		// it('marks caller to factory as the deposit manager', async () => {
		// 	const manager = await deposit.initiator.call();
		// 	assert.equal(initiator, manager);
		// });

		it('sets correct initial values upon creation', async () => {
			const isKeySet = await deposit.isKeySet.call();
			assert(!isKeySet, 'isKeySet should be false upon creation');

			const counterpart = await deposit.counterpart.call();
			assert.equal(0, counterpart, 'Counterpart should not be set yet');

			initiatorInitialDeposit = await depositHelper.viewCurrentDeposit(initiator);
			initiatorCurrentDeposit = await depositHelper.viewCurrentDeposit(initiator);
			counterpartCurrentDeposit = await depositHelper.viewCurrentDeposit(counterpart);
			// [initiatorCurrentDeposit, counterpartCurrentDeposit] = await depositHelper.viewCurrentDeposit();
			assert.equal(initiatorInitialDeposit,	initialValue,
				'Initial value should be equal to amount sent to creation minus the fee');
			assert.equal(initiatorCurrentDeposit,	initialValue,
				'viewCurrentDeposit without parameters should return the initiator current deposited also');
			assert.equal(counterpartCurrentDeposit,	0,
				'counterpart not set, current deposit should be 0');

			const initialSgxAddress = await deposit.SgxAddress.call();
			assert.equal(0, initialSgxAddress, 'SgxAddress should not be set yet');

			const factoryAddress = await deposit.factory.call();
			assert.equal(factoryAddress, factory.address,
				'Factory addresses does not match!');
		});

		it('sets correct initial values for the state', async () => {
			const initialStage = await depositHelper.getCurrentStage();
			assert.equal(initialStage, constants.NoCounterpart, 'Stage should be 1 after constructor!');
			//Note that the mappings in state are not checked directly
			initiatorCurrentDeposit = await depositHelper.viewCurrentDeposit(initiator);
			counterpartCurrentDeposit = await depositHelper.viewCurrentDeposit(counterpart);
			assert.equal(initiatorCurrentDeposit,	INIT_VALUE,
				'Initiator current deposit should be INIT_VALUE!');
			assert.equal(counterpartCurrentDeposit,	0,
				'Counterpart current deposit should be 0!');
		});
		//
		// it('creates restriction modifiers correctly', async () => {
		// 	try {
		// 		await deposit.setCounterpart(initiator).call({ from: attacker });
		// 	} catch (error) {
		// 		testHelper.testRestrictionModifier(error, RESTRICTED_INITIATOR_ONLY);
		// 	}
		// 	try {
		// 		await deposit.setCounterpart(initiator).call({ from: initiator });
		// 	} catch (error) {
		// 		testHelper.testRestrictionModifier(
		// 			error,
		// 			RESTRICTED_COUNTERPART_IS_INITIATOR
		// 		);
		// 	}
		// 	let res;
		// 	await deposit.setCounterpart(counterpart).send({
		// 		from: initiator,
		// 		gas: '1000000'
		// 	});
		// 	res = await deposit.counterpart.call();
		// 	assert.equal(res, counterpart, "Counterpart wasn't set correctly");
		// });
	});
});

describe('Deposit contract values after creation', () => {
	// it('marks caller to factory as the deposit manager', async () => {
	// 	const manager = await deposit.initiator.call();
	// 	assert.equal(initiator, manager);
	// });
	//
	// it('sets correct initial values upon creation', async () => {
	// 	const isKeySet = await deposit.isKeySet.call();
	// 	assert(!isKeySet, 'isKeySet should be false upon creation');
	//
	// 	const counterpart = await deposit.counterpart.call();
	// 	assert.equal(0, counterpart, 'Counterpart should not be set yet');
	//
	// 	const initiatorInitialDeposit = await deposit.methods
	// 		.viewCurrentDeposit(initiator)
	// 		.call();
	// 	assert.equal(
	// 		initiatorInitialDeposit,
	// 		initialValue,
	// 		'Initial value should be equal to amount sent to creation minus the fee'
	// 	);
	//
	// 	[
	// 		initiatorCurrentDeposit,
	// 		counterpartCurrentDeposit
	// 	] = await deposit.viewCurrentDeposit.call();
	// 	assert.equal(
	// 		initiatorCurrentDeposit,
	// 		initialValue,
	// 		'viewCurrentDeposit without parameters should return the initiator current deposited also'
	// 	);
	// 	assert.equal(
	// 		counterpartCurrentDeposit,
	// 		0,
	// 		'counterpart not set, current deposit should be 0'
	// 	);
	//
	// 	const initialSgxAddress = await deposit.SgxAddress.call();
	// 	assert.equal(0, initialSgxAddress, 'SgxAddress should not be set yet');
	//
	// 	const factoryAddress = await deposit.factory.call();
	// 	assert.equal(
	// 		factoryAddress,
	// 		factory.options.address,
	// 		'Factory addresses does not match!'
	// 	);
	// });
	//
	// it('sets correct initial values for the state', async () => {
	// 	const initialInitialState = await deposit.state.call();
	// 	const initialStage = initialInitialState['stage'];
	// 	assert.equal(initialStage, 1, 'Stage should be 1 after constructor!');
	// 	//Note that the mappings in state are not checked directly
	// 	const initialCurrentDeposits = await deposit.methods
	// 		.viewCurrentDeposit()
	// 		.call();
	// 	assert.equal(
	// 		initialCurrentDeposits[0],
	// 		INIT_VALUE,
	// 		'Initiator current deposit should be INIT_VALUE!'
	// 	);
	// 	assert.equal(
	// 		initialCurrentDeposits[1],
	// 		0,
	// 		'Counterpart current deposit should be 0!'
	// 	);
	// });
	//
	// it('creates restriction modifiers correctly', async () => {
	// 	try {
	// 		await deposit.setCounterpart(initiator).call({ from: attacker });
	// 	} catch (error) {
	// 		testHelper.testRestrictionModifier(error, RESTRICTED_INITIATOR_ONLY);
	// 	}
	// 	try {
	// 		await deposit.setCounterpart(initiator).call({ from: initiator });
	// 	} catch (error) {
	// 		testHelper.testRestrictionModifier(
	// 			error,
	// 			RESTRICTED_COUNTERPART_IS_INITIATOR
	// 		);
	// 	}
	// 	let res;
	// 	await deposit.setCounterpart(counterpart).send({
	// 		from: initiator,
	// 		gas: '1000000'
	// 	});
	// 	res = await deposit.counterpart.call();
	// 	assert.equal(res, counterpart, "Counterpart wasn't set correctly");
	// });
});

// describe('Test keys- old, no longer needed to sign, kept for example', () => {
// 	it('check that key works', async () => {
// 		let initiator_online = '0x2EEC49EAb23f2082a2876D249FCAEF306E490bEa';
// 		let counterpart_online = '0x5AF1585D3B6B49FC265B5eEc6Bc1A55A5Ce93E2e';
// 		let sgx_online = '0x2EEC49EAb23f2082a2876D249FCAEF306E490bEa';
// 		await deposit.setCounterpart(counterpart).send({
// 			from: initiator,
// 			gas: '1000000'
// 		});
// 		await deposit.setPublicKey(SgxAddress).send({
// 			from: initiator,
// 			gas: '1000000'
// 		});
// 		let isKeySet;
// 		let res;
// 		isKeySet = await deposit.lockPublicSharedKey(SgxAddress).send({
// 			from: counterpart,
// 			gas: '1000000'
// 		});
// 		assert(isKeySet, 'Key was not set correctly');
// 		let signature;
// 		let Totals = [aDeposit, bDeposit];
// 		fixed_msg_sha = await web3.utils.soliditySha3(
// 			{ type: 'uint', value: Totals[0] },
// 			{ type: 'uint', value: Totals[1] }
// 		);
// 		signature = await web3.eth.sign(fixed_msg_sha, SgxAddress);
// 		signature = signature.substr(2); //remove 0x
// 		let r = '0x' + signature.slice(0, 64);
// 		let s = '0x' + signature.slice(64, 128);
// 		let v = '0x' + signature.slice(128, 130);
// 		assert(
// 			web3Helper.isHexStrict(r) &&
// 				web3Helper.isHexStrict(s) &&
// 				web3Helper.isHexStrict(v),
// 			'either v, r, or s is not strictly hex'
// 		);
// 		const v_decimal = web3Helper.toV_Decimal(v);
// 		try {
// 			res = await testHelper.setFinalState(
// 				Totals,
// 				fixed_msg_sha,
// 				v_decimal,
// 				r,
// 				s,
// 				counterpart
// 			);
// 		} catch (error) {
// 			assert(false, error);
// 		}
// 	});
// });

describe('Test keys- old, no longer needed to sign', () => {
	// it('check that key works', async () => {
	// 	let initiator_online = '0x2EEC49EAb23f2082a2876D249FCAEF306E490bEa';
	// 	let counterpart_online = '0x5AF1585D3B6B49FC265B5eEc6Bc1A55A5Ce93E2e';
	// 	let sgx_online = '0x2EEC49EAb23f2082a2876D249FCAEF306E490bEa';
	// 	await deposit.setCounterpart(counterpart).send({
	// 		from: initiator,
	// 		gas: '1000000'
	// 	});
	// 	await deposit.setPublicKey(SgxAddress).send({
	// 		from: initiator,
	// 		gas: '1000000'
	// 	});
	// 	let isKeySet;
	// 	let res;
	// 	isKeySet = await deposit.lockPublicSharedKey(SgxAddress).send({
	// 		from: counterpart,
	// 		gas: '1000000'
	// 	});
	// 	assert(isKeySet, 'Key was not set correctly');
	// 	let Totals = [aDeposit, bDeposit];
	// 	//fixed_msg_sha is old remanent for older and simpler times
	// 	//same for v, r, s which are supposedly produced from the signature
	// 	fixed_msg_sha = await web3.utils.soliditySha3(
	// 		{ type: 'uint', value: Totals[0] },
	// 		{ type: 'uint', value: Totals[1] }
	// 	);
	// 	v_decimal = 27, r = 0, s = 0;
	// 	try {
	// 		res = await testHelper.setFinalState(
	// 			Totals,
	// 			fixed_msg_sha,
	// 			v_decimal,
	// 			r,
	// 			s,
	// 			counterpart
	// 		);
	// 	} catch (error) {
	// 		assert(false, error);
	// 	}
	// });
});

describe('Basic behavior of Deposit contract', () => {
	// it('enables the initiator to cancel the contract', async () => {
	// 	try {
	// 		const initialInitialState = await deposit.state.call();
	// 		await deposit.cancelDepositContract.call({ from: initiator });
	// 	} catch (error) {
	// 		assert(false, "Can't cancel the deposit contract");
	// 	}
	// });
	//
	// it('Performs the necessary actions in each stage', async () => {
	// 	//First we set the counterpart and verify we moved to the correct stage
	// 	await deposit.setCounterpart(counterpart).send({
	// 		from: initiator,
	// 		gas: '1000000'
	// 	});
	// 	let currentState = await deposit.state.call();
	// 	const counterpartTemp = await deposit.counterpart.call();
	// 	assert.equal(
	// 		currentState['stage'],
	// 		2,
	// 		'The state should be CounterpartSet but it is not'
	// 	);
	// 	assert.equal(
	// 		counterpartTemp,
	// 		counterpart,
	// 		'Counterpart was not set properly'
	// 	);
	//
	// 	//Then we add money(both sides)
	// 	await deposit.addDeposit().send({
	// 		from: initiator,
	// 		gas: '1000000',
	// 		value: '3'
	// 	});
	// 	await deposit.addDeposit().send({
	// 		from: counterpart,
	// 		gas: '1000000',
	// 		value: '2'
	// 	});
	// 	let currentDeposits = await deposit.viewCurrentDeposit.call();
	// 	assert.equal(
	// 		currentDeposits[0],
	// 		initialValue + 3,
	// 		'Initiator current deposit is incorrect'
	// 	);
	// 	assert.equal(
	// 		currentDeposits[1],
	// 		2,
	// 		'Initiator current deposit is incorrect'
	// 	);
	//
	// 	//Then we set SgxAddress
	// 	await deposit.setPublicKey(SgxAddress).send({
	// 		from: initiator,
	// 		gas: '1000000'
	// 	});
	// 	currentState = await deposit.state.call();
	// 	const sgxAddressInserted = await deposit.SgxAddress.call();
	// 	assert.equal(
	// 		currentState['stage'],
	// 		3,
	// 		'The state should be SettingKey but it is not'
	// 	);
	// 	assert.equal(
	// 		sgxAddressInserted.toLowerCase(),
	// 		SgxAddress.toLowerCase(),
	// 		'The SgxAdrress is not correct'
	// 	);
	//
	// 	//Then we lock the SGX address, using the counterpart account
	// 	await deposit.lockPublicSharedKey(SgxAddress).send({
	// 		from: counterpart,
	// 		gas: '1000000'
	// 	});
	// 	currentState = await deposit.state.call();
	// 	const isKeySetRes = await deposit.isKeySet.call();
	// 	assert.equal(
	// 		currentState['stage'],
	// 		4,
	// 		'The state should be PaymentChannelOpen but it is not'
	// 	);
	// 	assert.equal(isKeySetRes, true, 'Key is not set even though it should be');
	//
	// 	//Then we add more money, to simulate the sides adding cash
	// 	await deposit.addDeposit().send({
	// 		from: initiator,
	// 		gas: '1000000',
	// 		value: '10'
	// 	});
	// 	await deposit.addDeposit().send({
	// 		from: counterpart,
	// 		gas: '1000000',
	// 		value: '12'
	// 	});
	// 	currentDeposits = await deposit.viewCurrentDeposit.call();
	// 	assert.equal(
	// 		currentDeposits[0],
	// 		initialValue + 13,
	// 		'Initiator current deposit is incorrect'
	// 	);
	// 	assert.equal(
	// 		currentDeposits[1],
	// 		14,
	// 		'Counterpart current deposit is incorrect'
	// 	);
	//
	// 	//Then we lock the contract
	// 	let signature;
	// 	let Totals = [currentDeposits[0], currentDeposits[1]];
	// 	fixed_msg_sha = await web3.utils.soliditySha3(
	// 		{ type: 'uint', value: Totals[0] },
	// 		{ type: 'uint', value: Totals[1] }
	// 	);
	// 	signature = await web3.eth.sign(fixed_msg_sha, SgxAddress);
	// 	signature = signature.substr(2); //remove 0x
	// 	let r = '0x' + signature.slice(0, 64);
	// 	let s = '0x' + signature.slice(64, 128);
	// 	let v = '0x' + signature.slice(128, 130);
	// 	assert(
	// 		web3Helper.isHexStrict(r) &&
	// 			web3Helper.isHexStrict(s) &&
	// 			web3Helper.isHexStrict(v),
	// 		'either v, r, or s is not strictly hex'
	// 	);
	// 	const v_decimal = web3Helper.toV_Decimal(v);
	// 	await testHelper.setFinalState(Totals, fixed_msg_sha, v_decimal, r, s, counterpart);
	// 	// currentState = await deposit.state.call();
	// 	// assert.equal(
	// 	// 	currentState['stage'],
	// 	// 	5,
	// 	// 	'The state should be PaymentChannelLocked but it is not'
	// 	// );
	// 	//
	// 	// //Then both parties ask to draw their balance
	// 	// await deposit.drawMyBalance().send({
	// 	// 	from: counterpart,
	// 	// 	gas: '1000000'
	// 	// });
	// 	// await deposit.drawMyBalance().send({
	// 	// 	from: initiator,
	// 	// 	gas: '1000000'
	// 	// });
	// 	// /** TODO: Need a different way to verify balance **/
	// 	// console.log('~~~~ initiator balance: ' + await web3.eth.getBalance(initiator));
	// 	// console.log('~~~~ counterpart balance: ' + await web3.eth.getBalance(counterpart));
	//
	// 	//Setting a longer timeout since this is a long test
	// }).timeout(3500);
});

// describe('Verifying gas is only spent on things we know', () => {
// 	it('charges the initiator for using DepositFactory', async () => {
//     currentInitiatorBalance = await web3.eth.getBalance(initiator);
//     currentGasPrice = await web3.eth.getGasPrice();
//     console.log('~~1expected: ' + defaultInitiatorBalance + "-");
//     console.log('~~2expected: ' + gasDepositCreating * currentGasPrice);
//     console.log('~~~actual: ' + currentInitiatorBalance);
//     assert.equal(currentInitiatorBalance, defaultInitiatorBalance - gasDepositCreating * currentGasPrice,
//       "Some gas is lost in generating Deposit contract");
//
// 	});
// });
