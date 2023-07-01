import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const ConversationFunction = DefineFunction({
  callback_id: "conversation_function",
  title: "Get conversation",
  description: "Get all messages in thread",
  source_file: "functions/conversation_function.ts",
  input_parameters: {
    properties: {
      channel_id: { type: Schema.slack.types.channel_id },
      message_ts: { type: Schema.types.string },
    },
    required: ["channel_id", "message_ts"],
  },
  output_parameters: {
    properties: {
      conversation: {
        type: Schema.types.string,
        description: "All messages in thread",
      },
    },
    required: ["conversation"],
  },
});

const req = async (token: string, channel: string, ts: string) => {
  const query = new URLSearchParams({
    "channel": channel,
    "ts": ts,
  });
  const res = await fetch(
    `https://slack.com/api/conversations.replies?${query}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const body = await res.json();
  console.log("slack api response", body);
  return body;
};

export default SlackFunction(
  ConversationFunction,
  async ({ inputs, token }) => {
    const body = await req(token, inputs.channel_id, inputs.message_ts);
    if (!body.ok) {
      return {
        error: `Failed to call Slack API. body:${body}`,
      };
    }
    let messages = body.messages;
    const firstMessage = messages[0];
    if (firstMessage.thread_ts !== undefined) {
      const threadBody = await req(
        token,
        inputs.channel_id,
        firstMessage.thread_ts,
      );
      if (!threadBody.ok) {
        return {
          error: `Failed to call Slack API. body:${threadBody}`,
        };
      }
      messages = threadBody.messages;
    }
    const conversation: { role: string; content: string }[] = messages.filter((
      message: any,
    ) => message.type === "message").map(
      (message: any) => {
        // omit user id expressions
        const content = message.text.replaceAll(/\<\@.+?\>/g, " ");
        let role;
        if (
          message.bot_profile !== undefined &&
          message.bot_profile.name.includes("DataParrot")
        ) {
          role = "assistant";
        } else {
          role = "user";
        }
        return { role, content };
      },
    );
    return { outputs: { conversation: JSON.stringify(conversation) } };
  },
);
