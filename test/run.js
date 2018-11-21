
// @ts-check
require("reflect-metadata");

const { Driver } = require("../build/lib/driver/Driver");
const { AddNodeToNetworkRequest, AddNodeType } = require("../build/lib/controller/AddNodeToNetworkRequest");
const { HardResetRequest } = require("../build/lib/controller/HardResetRequest");
const { RequestNodeInfoResponse, RequestNodeInfoRequest } = require("../build/lib/node/RequestNodeInfoMessages");
const { ThermostatSetpoint } = require("../build/lib/commandclass/ThermostatSetpointCC");
const { ThermostatSetpointCC } = require("../build/lib/commandclass/ThermostatSetpointCC");
const { MessagePriority } = require("../build/lib/message/Constants");
const { Message } = require("../build/lib/message/Message");

// const { wait } = require("../build/lib/util/promises");
const CommandClass_1 = require("../build/lib/commandclass/CommandClass");

async function wait(ms) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

// import { log } from "../build/lib/util/logger";
const logger_1 = require("../build/lib/util/logger");

logger_1.log("driver", `starting driver...`, "debug");
/// log("controller", `${this.logPrefix}beginning interview... last completed step: ${InterviewStage[this.interviewStage]}`, "debug");

const d = new Driver("/dev/cu.usbmodem1A1310");
d.once("driver ready", async () => {
		console.log("Starting");
		// await wait(10000);
		// await wait(20000);

		// let resp = await d.sendMessage(new RequestNodeInfoRequest(3));
		// await d.controller.beginInclusion();
		// console.log("------------------------------------------------------------------------------");
		// console.log("###########################" + JSON.stringify(resp));
		// console.log("------------------------------------------------------------------------------");

		// console.log(d.controller.nodes);

		// await wait(30000);'
		const resp = await d.sendMessage(new ThermostatSetpoint(11, 0x01, 22), MessagePriority.WakeUp);
		console.log("------------------------------------------------------------------------------");
		//console.log("###########################" + JSON.stringify(resp));
		console.log("------------------------------------------------------------------------------");

		/*
		for (const node of d.controller.nodes.values()) {
			// TODO: retry on failure or something...
			node.interview().catch(e => logger_1.log("controller", "node interview failed: " + e, "error"));
		}
		*/
		// console.log(JSON.stringify(resp, null, 4));

		// await wait(30000);
		// await d.controller.stopInclusion();
		// await d.sendMessage(new HardResetRequest());
		// const resp = await d.sendMessage(new AddNodeToNetworkRequest(AddNodeType.Any, true, true));
		// console.log(JSON.stringify(resp, null, 4));

		await wait(600000);
		d.destroy();
		console.log("Ending");
		process.exit(0);
		// const resp = await d.sendMessage(new SetSerialApiTimeoutsRequest());

});
d.on("value changed", async (node, msg) => {
	const nodeID = node.id;
	let type = 0;
	if (node._deviceClass) {
		type = node._deviceClass.generic.name;
	}
	const comClass = msg.command.command;
	const valueId = msg.command.currentValue;

	console.log('value changed: ' + nodeID + ', comClass: ' + comClass + ', value: '  + valueId + ", type: " + type);
	
	// const node = d.controller.nodes.values()[3];
	// for (const node of d.controller.nodes.values()) {
		// TODO: retry on failure or something...
		// console.log("############################################################################");
		// node.interview().catch(e => logger_1.log("self", "node interview failed: " + e, "error"));
		// console.log("############################################################################");
	// }
	
});

d.start();