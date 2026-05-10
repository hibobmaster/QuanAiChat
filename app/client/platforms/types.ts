import { ChatOptions } from "../api";

export type RequestPayload = {
  messages: ChatOptions["messages"];
  stream?: boolean;
  model: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  tools?: any;
  thinking?: {
    type: "enabled" | "disabled";
  };
  reasoning_effort?: "high" | "max";
};
