"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const strings_1 = require("alcalzone-shared/strings");
const CommandClass_1 = require("../commandclass/CommandClass");
const ICommandClassContainer_1 = require("../commandclass/ICommandClassContainer");
const NoOperationCC_1 = require("../commandclass/NoOperationCC");
const VersionCC_1 = require("../commandclass/VersionCC");
const ApplicationUpdateRequest_1 = require("../controller/ApplicationUpdateRequest");
const GetNodeProtocolInfoMessages_1 = require("../controller/GetNodeProtocolInfoMessages");
const GetSerialApiCapabilitiesMessages_1 = require("../controller/GetSerialApiCapabilitiesMessages");
const SendDataMessages_1 = require("../controller/SendDataMessages");
const Constants_1 = require("../message/Constants");
const logger_1 = require("../util/logger");
const strings_2 = require("../util/strings");
const DeviceClass_1 = require("./DeviceClass");
const INodeQuery_1 = require("./INodeQuery");
const RequestNodeInfoMessages_1 = require("./RequestNodeInfoMessages");
/** Finds the ID of the target or source node in a message, if it contains that information */
function getNodeId(msg) {
    if (INodeQuery_1.isNodeQuery(msg))
        return msg.nodeId;
    if (ICommandClassContainer_1.isCommandClassContainer(msg))
        return msg.command.nodeId;
}
exports.getNodeId = getNodeId;
class ZWaveNode {
    constructor(id, driver, deviceClass, supportedCCs = [], controlledCCs = []) {
        this.id = id;
        this.driver = driver;
        //#region --- properties ---
        this.logPrefix = `[Node ${strings_1.padStart(this.id.toString(), 3, "0")}] `;
        this._commandClasses = new Map();
        /** This tells us which interview stage was last completed */
        this.interviewStage = InterviewStage.None;
        // TODO restore from cache
        this._deviceClass = deviceClass;
        for (const cc of supportedCCs)
            this.addCC(cc, { isSupported: true });
        for (const cc of controlledCCs)
            this.addCC(cc, { isControlled: true });
    }
    get deviceClass() {
        return this._deviceClass;
    }
    get isListening() {
        return this._isListening;
    }
    get isFrequentListening() {
        return this._isFrequentListening;
    }
    get isRouting() {
        return this._isRouting;
    }
    get maxBaudRate() {
        return this._maxBaudRate;
    }
    get isSecure() {
        return this._isSecure;
    }
    get version() {
        return this._version;
    }
    get isBeaming() {
        return this._isBeaming;
    }
    get commandClasses() {
        return this._commandClasses;
    }
    //#endregion
    isControllerNode() {
        return this.id === this.driver.controller.ownNodeId;
    }
    addCC(cc, info) {
        let ccInfo = this._commandClasses.has(cc)
            ? this._commandClasses.get(cc)
            : {
                isSupported: false,
                isControlled: false,
                version: 0,
            };
        ccInfo = Object.assign(ccInfo, info);
        this._commandClasses.set(cc, ccInfo);
    }
    /** Tests if this node supports the given CommandClass */
    supportsCC(cc) {
        return this._commandClasses.has(cc) && this._commandClasses.get(cc).isSupported;
    }
    /** Tests if this node controls the given CommandClass */
    controlsCC(cc) {
        return this._commandClasses.has(cc) && this._commandClasses.get(cc).isControlled;
    }
    /** Checks the supported version of a given CommandClass */
    getCCVersion(cc) {
        return this._commandClasses.has(cc) ? this._commandClasses.get(cc).version : 0;
    }
    //#region --- interview ---
    interview() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.log("controller", `${this.logPrefix}beginning interview... last completed step: ${InterviewStage[this.interviewStage]}`, "debug");
            // before each step check if it is necessary
            if (this.interviewStage === InterviewStage.None) {
                // do a full interview starting with the protocol info
                logger_1.log("controller", `${this.logPrefix}new Node, doing a full interview...`, "debug");
                yield this.queryProtocolInfo();
            }
            // TODO: delay pinging of nodes that are not listening or sleeping
            if (this.interviewStage === InterviewStage.ProtocolInfo) {
                // after getting the protocol info, ping the nodes
                yield this.ping();
            }
            // TODO: WakeUp
            // TODO: ManufacturerSpecific1
            if (this.interviewStage === InterviewStage.Ping /* TODO: change .Ping to .ManufacturerSpecific1 */) {
                yield this.getNodeInfo();
            }
            yield this.getNodeInfo();
            if (this.interviewStage === InterviewStage.NodeInfo /* TODO: change .NodeInfo to .Versions */) {
                yield this.queryCCVersions();
            }
            // for testing purposes we skip to the end
            this.interviewStage = InterviewStage.Complete;
            logger_1.log("controller", `${this.logPrefix}interview completed`, "debug");
        });
    }
    /** Step #1 of the node interview */
    queryProtocolInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.log("controller", `${this.logPrefix}querying protocol info`, "debug");
            const resp = yield this.driver.sendMessage(new GetNodeProtocolInfoMessages_1.GetNodeProtocolInfoRequest(this.id));
            this._deviceClass = resp.deviceClass;
            this._isListening = resp.isListening;
            this._isFrequentListening = resp.isFrequentListening;
            this._isRouting = resp.isRouting;
            this._maxBaudRate = resp.maxBaudRate;
            this._isSecure = resp.isSecure;
            this._version = resp.version;
            this._isBeaming = resp.isBeaming;
            logger_1.log("controller", `${this.logPrefix}received response for protocol info:`, "debug");
            logger_1.log("controller", `${this.logPrefix}  basic device class:    ${DeviceClass_1.BasicDeviceClasses[this.deviceClass.basic]} (${strings_2.num2hex(this.deviceClass.basic)})`, "debug");
            logger_1.log("controller", `${this.logPrefix}  generic device class:  ${this.deviceClass.generic.name} (${strings_2.num2hex(this.deviceClass.generic.key)})`, "debug");
            logger_1.log("controller", `${this.logPrefix}  specific device class: ${this.deviceClass.specific.name} (${strings_2.num2hex(this.deviceClass.specific.key)})`, "debug");
            logger_1.log("controller", `${this.logPrefix}  is a listening device: ${this.isListening}`, "debug");
            logger_1.log("controller", `${this.logPrefix}  is frequent listening: ${this.isFrequentListening}`, "debug");
            logger_1.log("controller", `${this.logPrefix}  is a routing device:   ${this.isRouting}`, "debug");
            logger_1.log("controller", `${this.logPrefix}  is a secure device:    ${this.isSecure}`, "debug");
            logger_1.log("controller", `${this.logPrefix}  is a beaming device:   ${this.isBeaming}`, "debug");
            logger_1.log("controller", `${this.logPrefix}  is a listening device: ${this.isListening}`, "debug");
            logger_1.log("controller", `${this.logPrefix}  maximum baud rate:     ${this.maxBaudRate} kbps`, "debug");
            logger_1.log("controller", `${this.logPrefix}  version:               ${this.version}`, "debug");
            this.interviewStage = InterviewStage.ProtocolInfo;
        });
    }
    /** Step #2 of the node interview */
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isControllerNode()) {
                logger_1.log("controller", `${this.logPrefix}not pinging the controller...`, "debug");
            }
            else {
                logger_1.log("controller", `${this.logPrefix}pinging the node...`, "debug");
                try {
                    const request = new SendDataMessages_1.SendDataRequest(new NoOperationCC_1.NoOperationCC(this.id));
                    // set the priority manually, as SendData can be Application level too
                    const response = yield this.driver.sendMessage(request, Constants_1.MessagePriority.NodeQuery);
                    logger_1.log("controller", `${this.logPrefix}  ping succeeded`, "debug");
                    // TODO: time out the ping
                }
                catch (e) {
                    logger_1.log("controller", `${this.logPrefix}  ping failed: ${e.message}`, "debug");
                }
            }
            this.interviewStage = InterviewStage.Ping;
        });
    }
    /** Step #5 of the node interview */
    getNodeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isControllerNode()) {
                logger_1.log("controller", `${this.logPrefix}not querying node info from the controller...`, "debug");
            }
            else {
                logger_1.log("controller", `${this.logPrefix}querying node info`, "debug");
                const resp = yield this.driver.sendMessage(new RequestNodeInfoMessages_1.RequestNodeInfoRequest(this.id));
                if (resp instanceof RequestNodeInfoMessages_1.RequestNodeInfoResponse && !resp.wasSent
                    || resp instanceof ApplicationUpdateRequest_1.ApplicationUpdateRequest && resp.updateType === ApplicationUpdateRequest_1.ApplicationUpdateTypes.NodeInfo_RequestFailed) {
                    logger_1.log("controller", `${this.logPrefix}  querying the node info failed`, "debug");
                }
                else if (resp instanceof ApplicationUpdateRequest_1.ApplicationUpdateRequest) {
                    // TODO: log the received values
                    logger_1.log("controller", `${this.logPrefix}  received the node info`, "debug");
                    for (const cc of resp.nodeInformation.supportedCCs)
                        this.addCC(cc, { isSupported: true });
                    for (const cc of resp.nodeInformation.controlledCCs)
                        this.addCC(cc, { isControlled: true });
                }
            }
            this.interviewStage = InterviewStage.NodeInfo;
            const apiCaps = yield this.driver.sendMessage(new GetSerialApiCapabilitiesMessages_1.GetSerialApiCapabilitiesRequest(), "none");
            logger_1.log("controller", `  serial API version:  ${apiCaps.serialApiVersion}`, "debug");
            logger_1.log("controller", `  manufacturer ID:     ${strings_2.num2hex(apiCaps.manufacturerId)}`, "debug");
            logger_1.log("controller", `  product type:        ${strings_2.num2hex(apiCaps.productType)}`, "debug");
            logger_1.log("controller", `  product ID:          ${strings_2.num2hex(apiCaps.productId)}`, "debug");
        });
    }
    /** Step #9 of the node interview */
    queryCCVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.log("controller", `${this.logPrefix}querying CC versions`, "debug");
            for (const [cc, info] of this._commandClasses.entries()) {
                // only query the ones we support a version > 1 for
                const maxImplemented = CommandClass_1.getImplementedVersion(cc);
                if (maxImplemented < 1) {
                    logger_1.log("controller", `${this.logPrefix}  skipping query for ${CommandClass_1.CommandClasses[cc]} (${strings_2.num2hex(cc)}) because max implemented version is ${maxImplemented}`, "debug");
                    continue;
                }
                const versionCC = new VersionCC_1.VersionCC(this.id, VersionCC_1.VersionCommand.CommandClassGet, cc);
                const request = new SendDataMessages_1.SendDataRequest(versionCC);
                try {
                    logger_1.log("controller", `${this.logPrefix}  querying the CC version for ${CommandClass_1.CommandClasses[cc]} (${strings_2.num2hex(cc)})`, "debug");
                    // query the CC version
                    const resp = yield this.driver.sendMessage(request, Constants_1.MessagePriority.NodeQuery);
                    if (ICommandClassContainer_1.isCommandClassContainer(resp)) {
                        const versionResponse = resp.command;
                        // Remember which CC version this node supports
                        const reqCC = versionResponse.requestedCC;
                        const supportedVersion = versionResponse.ccVersion;
                        this.addCC(reqCC, { version: supportedVersion });
                        logger_1.log("controller", `${this.logPrefix}  supports CC ${CommandClass_1.CommandClasses[reqCC]} (${strings_2.num2hex(reqCC)}) in version ${supportedVersion}`, "debug");
                    }
                }
                catch (e) {
                    logger_1.log("controller", `${this.logPrefix}  querying the CC version failed: ${e.message}`, "debug");
                }
            }
            this.interviewStage = InterviewStage.Versions;
        });
    }
    //#endregion
    // TODO: Add a handler around for each CC to interpret the received data
    // TODO: Inform Event handler
    /** Handles an ApplicationCommandRequest sent from a node */
    handleCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command.command) {
                case CommandClass_1.CommandClasses["Central Scene"]: {
                    // The node reported its supported versions
                    const csCC = command;
                    logger_1.log("controller", `${this.logPrefix}received CentralScene command ${JSON.stringify(csCC)}`, "debug");
                    break;
                }
                case CommandClass_1.CommandClasses["Battery"]: {
                    const csCC = command;
                    const value = csCC.currentValue;
                    logger_1.log("controller", `${this.logPrefix}received Battery command ${JSON.stringify(csCC)} --- ${value}`, "debug");
                    break;
                }
                case CommandClass_1.CommandClasses["Thermostat Setpoint"]: {
                    const csCC = command;
                    const value = csCC.currentValue;
                    logger_1.log("controller", `${this.logPrefix}received ThermostatSetpoint command ${JSON.stringify(csCC)} --- ${value}`, "debug");
                    break;
                }
                case CommandClass_1.CommandClasses["Multilevel Sensor"]: {
                    const csCC = command;
                    const value = csCC.currentValue;
                    logger_1.log("controller", `${this.logPrefix}received Multilevel Sensor command ${JSON.stringify(csCC)} --- ${value}`, "debug");
                    logger_1.log("self", `${this.logPrefix}received Multilevel Sensor command ${JSON.stringify(csCC)} --- ${value}`, "debug");
                    break;
                }
                default: {
                    logger_1.log("controller", `${this.logPrefix}TODO: no handler for application command ${strings_2.stringify(command)}`, "debug");
                }
            }
        });
    }
}
exports.ZWaveNode = ZWaveNode;
// TODO: This order is not optimal, check how OpenHAB does it
var InterviewStage;
(function (InterviewStage) {
    InterviewStage[InterviewStage["None"] = 0] = "None";
    InterviewStage[InterviewStage["ProtocolInfo"] = 1] = "ProtocolInfo";
    InterviewStage[InterviewStage["Ping"] = 2] = "Ping";
    InterviewStage[InterviewStage["WakeUp"] = 3] = "WakeUp";
    InterviewStage[InterviewStage["ManufacturerSpecific1"] = 4] = "ManufacturerSpecific1";
    InterviewStage[InterviewStage["NodeInfo"] = 5] = "NodeInfo";
    InterviewStage[InterviewStage["NodePlusInfo"] = 6] = "NodePlusInfo";
    InterviewStage[InterviewStage["SecurityReport"] = 7] = "SecurityReport";
    InterviewStage[InterviewStage["ManufacturerSpecific2"] = 8] = "ManufacturerSpecific2";
    InterviewStage[InterviewStage["Versions"] = 9] = "Versions";
    InterviewStage[InterviewStage["Instances"] = 10] = "Instances";
    InterviewStage[InterviewStage["Static"] = 11] = "Static";
    // ===== the stuff above should never change =====
    // ===== the stuff below changes frequently, so it has to be redone on every start =====
    InterviewStage[InterviewStage["CacheLoad"] = 12] = "CacheLoad";
    InterviewStage[InterviewStage["Associations"] = 13] = "Associations";
    InterviewStage[InterviewStage["Neighbors"] = 14] = "Neighbors";
    InterviewStage[InterviewStage["Session"] = 15] = "Session";
    InterviewStage[InterviewStage["Dynamic"] = 16] = "Dynamic";
    InterviewStage[InterviewStage["Configuration"] = 17] = "Configuration";
    InterviewStage[InterviewStage["Complete"] = 18] = "Complete";
})(InterviewStage = exports.InterviewStage || (exports.InterviewStage = {}));
