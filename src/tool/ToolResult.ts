import { ToolCall } from "./ToolCall";

export interface ToolResult<NAME extends string, PARAMETERS, RETURN_TYPE> {
  tool: NAME;
  toolCall: ToolCall<NAME, PARAMETERS>;
  args: PARAMETERS;
  result: RETURN_TYPE;
}
