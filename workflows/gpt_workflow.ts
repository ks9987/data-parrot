import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ConversationFunction } from "../functions/conversation_function.ts";
import { GptFunction } from "../functions/gpt_function.ts";

const workflow = DefineWorkflow({
  callback_id: "gpt-workflow",
  title: "Reply to Question Workflow",
  input_parameters: {
    properties: {
      // All the possible inputs from the "app_mention_trigger" event trigger
      channel_id: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
      message_ts: { type: Schema.types.string },
    },
    required: ["channel_id", "user_id", "message_ts"],
  },
});

// Get all thread messages
const ConversationFunctionStep = workflow.addStep(
  ConversationFunction,
  {
    channel_id: workflow.inputs.channel_id,
    message_ts: workflow.inputs.message_ts,
  },
);

// Call OpenAI API to get answer
const GptFunctionStep = workflow.addStep(
  GptFunction,
  {
    user_id: workflow.inputs.user_id,
    conversation: ConversationFunctionStep.outputs.conversation,
  },
);

// Reply to thread
workflow.addStep(Schema.slack.functions.ReplyInThread, {
  message_context: {
    channel_id: workflow.inputs.channel_id,
    message_ts: workflow.inputs.message_ts,
  },
  message: GptFunctionStep.outputs.answer,
});

export default workflow;
