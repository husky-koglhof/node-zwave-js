/// <reference types="node" />
import { Constructable } from "../message/Message";
export interface CommandClassInfo {
    isSupported: boolean;
    isControlled: boolean;
    version: number;
}
export interface CommandClassStatic {
    readonly maxImplementedVersion: number;
}
export declare class CommandClass {
    nodeId?: number;
    command?: CommandClasses;
    payload: Buffer;
    constructor();
    constructor(nodeId: number, command?: CommandClasses, payload?: Buffer);
    /** The version of the command class used */
    version: number;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    private getPayloadByte;
    /**
     * Extract a decimal value from a byte array.
     *
     * @param offset the offset at which to start reading
     * @return the extracted decimal value
     */
    extractValue(offset: number): number;
    static getNodeId(ccData: Buffer): number;
    static getCommandClass(ccData: Buffer): CommandClasses;
    /**
     * Retrieves the correct constructor for the CommandClass in the given Buffer.
     * It is assumed that the buffer only contains the serialized CC.
     */
    static getConstructor(ccData: Buffer): Constructable<CommandClass>;
    static from(serializedCC: Buffer): CommandClass;
    toJSON(): any;
    private toJSONInternal;
    protected toJSONInherited(props: Record<string, any>): Record<string, any>;
}
export declare const METADATA_commandClass: unique symbol;
export declare const METADATA_commandClassMap: unique symbol;
export declare const METADATA_ccResponse: unique symbol;
export declare const METADATA_version: unique symbol;
/**
 * A predicate function to test if a received CC matches to the sent CC
 */
export declare type CCResponsePredicate = (sentCC: CommandClass, receivedCC: CommandClass) => boolean;
/**
 * Defines the command class associated with a Z-Wave message
 */
export declare function commandClass(cc: CommandClasses): ClassDecorator;
/**
 * Retrieves the command class defined for a Z-Wave message class
 */
export declare function getCommandClass<T extends CommandClass>(cc: T): CommandClasses;
/**
 * Retrieves the function type defined for a Z-Wave message class
 */
export declare function getCommandClassStatic<T extends Constructable<CommandClass>>(classConstructor: T): CommandClasses;
/**
 * Looks up the command class constructor for a given command class type and function type
 */
export declare function getCCConstructor(cc: CommandClasses): Constructable<CommandClass>;
/**
 * Defines the implemented version of a Z-Wave command class
 */
export declare function implementedVersion(version: number): ClassDecorator;
/**
 * Retrieves the implemented version defined for a Z-Wave command class
 */
export declare function getImplementedVersion<T extends CommandClass>(cc: T | CommandClasses): number;
/**
 * Retrieves the implemented version defined for a Z-Wave command class
 */
export declare function getImplementedVersionStatic<T extends Constructable<CommandClass>>(classConstructor: T): number;
/**
 * Defines the expected response associated with a Z-Wave message
 */
export declare function expectedCCResponse(cc: CommandClasses): ClassDecorator;
export declare function expectedCCResponse(predicate: CCResponsePredicate): ClassDecorator;
/**
 * Retrieves the expected response defined for a Z-Wave message class
 */
export declare function getExpectedCCResponse<T extends CommandClass>(ccClass: T): CommandClasses | CCResponsePredicate;
/**
 * Retrieves the function type defined for a Z-Wave message class
 */
export declare function getExpectedCCResponseStatic<T extends Constructable<CommandClass>>(classConstructor: T): CommandClasses | CCResponsePredicate;
export declare enum CommandClasses {
    "Alarm Sensor" = 156,
    "Alarm Silence" = 157,
    "All Switch" = 39,
    "Anti-theft" = 93,
    "Application Capability" = 87,
    "Application Status" = 34,
    "Association" = 133,
    "Association Command Configuration" = 155,
    "Association Group Information (AGI)" = 89,
    "Barrier Operator" = 102,
    "Basic" = 32,
    "Basic Tariff Information" = 54,
    "Basic Window Covering" = 80,
    "Battery" = 128,
    "Binary Sensor" = 48,
    "Binary Switch" = 37,
    "Binary Toggle Switch" = 40,
    "Climate Control Schedule" = 70,
    "Central Scene" = 91,
    "Clock" = 129,
    "Color Switch" = 51,
    "Configuration" = 112,
    "Controller Replication" = 33,
    "CRC-16 Encapsulation" = 86,
    "Demand Control Plan Configuration" = 58,
    "Demand Control Plan Monitor" = 59,
    "Device Reset Locally" = 90,
    "Door Lock" = 98,
    "Door Lock Logging" = 76,
    "Energy Production" = 144,
    "Entry Control" = 111,
    "Firmware Update Meta Data" = 122,
    "Geographic Location" = 140,
    "Grouping Name" = 123,
    "Hail" = 130,
    "HRV Status" = 55,
    "HRV Control" = 57,
    "Humidity Control Mode" = 109,
    "Humidity Control Operating State" = 110,
    "Humidity Control Setpoint" = 100,
    "Inclusion Controller" = 116,
    "Indicator" = 135,
    "IP Association" = 92,
    "IP Configuration" = 154,
    "Irrigation" = 107,
    "Language" = 137,
    "Lock" = 118,
    "Mailbox" = 105,
    "Manufacturer Proprietary" = 145,
    "Manufacturer Specific" = 114,
    "Support/Control Mark" = 239,
    "Meter" = 50,
    "Meter Table Configuration" = 60,
    "Meter Table Monitor" = 61,
    "Meter Table Push Configuration" = 62,
    "Move To Position Window Covering" = 81,
    "Multi Channel" = 96,
    "Multi Channel Association" = 142,
    "Multi Command" = 143,
    "Multilevel Sensor" = 49,
    "Multilevel Switch" = 38,
    "Multilevel Toggle Switch" = 41,
    "Network Management Basic Node" = 77,
    "Network Management Inclusion" = 52,
    "Network Management Installation and Maintenance" = 103,
    "Network Management Primary" = 84,
    "Network Management Proxy" = 82,
    "No Operation" = 0,
    "Node Naming and Location" = 119,
    "Node Provisioning" = 120,
    "Notification" = 113,
    "Powerlevel" = 115,
    "Prepayment" = 63,
    "Prepayment Encapsulation" = 65,
    "Proprietary" = 136,
    "Protection" = 117,
    "Pulse Meter" = 53,
    "Rate Table Configuration" = 72,
    "Rate Table Monitor" = 73,
    "Remote Association Activation" = 124,
    "Remote Association Configuration" = 125,
    "Scene Activation" = 43,
    "Scene Actuator Configuration" = 44,
    "Scene Controller Configuration" = 45,
    "Schedule" = 83,
    "Schedule Entry Lock" = 78,
    "Screen Attributes" = 147,
    "Screen Meta Data" = 146,
    "Security" = 152,
    "Security 2" = 159,
    "Security Mark" = 61696,
    "Sensor Configuration" = 158,
    "Simple AV Control" = 148,
    "Sound Switch" = 121,
    "Supervision" = 108,
    "Tariff Table Configuration" = 74,
    "Tariff Table Monitor" = 75,
    "Thermostat Fan Mode" = 68,
    "Thermostat Fan State" = 69,
    "Thermostat Mode" = 64,
    "Thermostat Operating State" = 66,
    "Thermostat Setback" = 71,
    "Thermostat Setpoint" = 67,
    "Time" = 138,
    "Time Parameters" = 139,
    "Transport Service" = 85,
    "User Code" = 99,
    "Version" = 134,
    "Wake Up" = 132,
    "Window Covering" = 106,
    "Z/IP" = 35,
    "Z/IP 6LoWPAN" = 79,
    "Z/IP Gateway" = 95,
    "Z/IP Naming and Location" = 104,
    "Z/IP ND" = 88,
    "Z/IP Portal" = 97,
    "Z-Wave Plus Info" = 94
}
