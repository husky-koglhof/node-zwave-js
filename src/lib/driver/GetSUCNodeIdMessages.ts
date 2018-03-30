import { expectedResponse, FunctionType, Message, MessageType, messageTypes } from "../message/Message";

@messageTypes(MessageType.Request, FunctionType.GetSUCNodeId)
@expectedResponse(FunctionType.GetSUCNodeId)
export class GetSUCNodeIdRequest extends Message {

}

@messageTypes(MessageType.Response, FunctionType.GetSUCNodeId)
export class GetSUCNodeIdResponse extends Message {

	private _sucNodeId: number;
	/** The node id of the SUC or 0 if none is present */
	public get sucNodeId(): number {
		return this._sucNodeId;
	}

	public deserialize(data: Buffer): number {
		const ret = super.deserialize(data);

		// Just a single byte
		this._sucNodeId = this.payload[0];

		return ret;
	}

	public toJSON() {
		return super.toJSONInherited({
			sucNodeId: this.sucNodeId,
		});
	}
}