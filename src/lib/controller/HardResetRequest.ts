import { FunctionType, MessagePriority, MessageType } from "../message/Constants";
import { expectedResponse, Message, messageTypes, priority} from "../message/Message";

@messageTypes(MessageType.Request, FunctionType.HardReset)
// This will be responded to with a HardResetRequest
@priority(MessagePriority.Controller)
export class HardResetRequest extends Message {
	// the response "request" contains one payload byte
	// it was 0xc1 in our case (0b1100_0001), but we don't know what it means
}
