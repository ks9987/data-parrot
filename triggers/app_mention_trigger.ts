import { Trigger } from "deno-slack-sdk/types.ts";
import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import workflow from "../workflows/gpt_workflow.ts";

const trigger: Trigger<typeof workflow.definition> = {
  type: TriggerTypes.Event,
  name: "Trigger workflow with app mentioned",
  workflow: `#/workflows/${workflow.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    channel_ids: [`${Deno.env.get("CHANNEL_ID")}`],
  },
  inputs: {
    channel_id: { value: TriggerContextData.Event.AppMentioned.channel_id },
    user_id: { value: TriggerContextData.Event.AppMentioned.user_id },
    message_ts: { value: TriggerContextData.Event.AppMentioned.message_ts },
  },
};
export default trigger;
