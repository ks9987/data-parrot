import { Trigger } from "deno-slack-api/types.ts";
import ChatGPTWorkflow from "../workflows/chatgpt_workflow.ts";

const appmentionTrigger: Trigger<typeof ChatGPTWorkflow.definition> = {
  type: "event",
  name: "Trigger workflow with app mentioned",
  workflow: `#/workflows/${ChatGPTWorkflow.definition.callback_id}`,
  event: {
    event_type: "slack#/events/app_mentioned",
    channel_ids: [
      `${Deno.env.get("CHANNEL_ID")}`,
    ],
  },
  inputs: {
    channel_id: { value: "{{data.channel_id}}" },
    user_id: { value: "{{data.user_id}}" },
    question: { value: "{{data.text}}" },
  },
};

export default appmentionTrigger;
