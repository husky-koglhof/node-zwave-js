// @ts-check
require("reflect-metadata");

const { Driver } = require("../build/lib/driver/Driver");
const { AddNodeToNetworkRequest, AddNodeType } = require("../build/lib/controller/AddNodeToNetworkRequest");
const { HardResetRequest } = require("../build/lib/controller/HardResetRequest");
const { RequestNodeInfoResponse, RequestNodeInfoRequest } = require("../build/lib/node/RequestNodeInfoMessages");
// const { wait } = require("../build/lib/util/promises");

async function wait(ms) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

// import { log } from "../build/lib/util/logger";
const logger_1 = require("../build/lib/util/logger");

logger_1.log("driver", `starting driver...`, "debug");
/// log("controller", `${this.logPrefix}beginning interview... last completed step: ${InterviewStage[this.interviewStage]}`, "debug");

const d = new Driver("/dev/cu.usbmodem1A1310")
	.once("driver ready", async () => {

		console.log("Starting");
		// await wait(10000);
		await wait(1000);
		// console.log(d.controller.nodes);
		var nodes = d.controller.nodes;

		// const resp = await d.sendMessage(new RequestNodeInfoRequest(2));
		// await d.controller.beginInclusion();
		console.log(d.controller.nodes);

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

	})
	;
d.start();
console.log("Ready, set, go...");
