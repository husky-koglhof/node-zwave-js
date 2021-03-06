import { FunctionType, MessagePriority, MessageType } from "../message/Constants";
import { expectedResponse, Message, messageTypes, priority} from "../message/Message";
import { cpp2js } from "../util/strings";
import { ZWaveLibraryTypes } from "./ZWaveLibraryTypes";

@messageTypes(MessageType.Request, FunctionType.GetControllerVersion)
@expectedResponse(FunctionType.GetControllerVersion)
@priority(MessagePriority.Controller)
export class GetControllerVersionRequest extends Message {

}

@messageTypes(MessageType.Response, FunctionType.GetControllerVersion)
export class GetControllerVersionResponse extends Message {

	private _controllerType: ZWaveLibraryTypes;
	public get controllerType() {
		return this._controllerType;
	}

	private _libraryVersion: string;
	public get libraryVersion() {
		return this._libraryVersion;
	}

	public deserialize(data: Buffer): number {
		const ret = super.deserialize(data);

		// The payload consists of a zero-terminated string and a uint8 for the controller type
		this._libraryVersion = cpp2js(this.payload.toString("ascii"));
		this._controllerType = this.payload[this.libraryVersion.length + 1];

		return ret;
	}

	public toJSON() {
		return super.toJSONInherited({
			controllerType: this.controllerType,
			libraryVersion: this.libraryVersion,
		});
	}
}
