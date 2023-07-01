import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GptFunction = DefineFunction({
  callback_id: "gpt_function",
  title: "Ask GPT",
  description: "Ask questions to GPT",
  source_file: "functions/gpt_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.slack.types.user_id },
      conversation: { type: Schema.types.string },
    },
    required: ["user_id", "conversation"],
  },
  output_parameters: {
    properties: {
      answer: {
        type: Schema.types.string,
        description: "Answer from AI",
      },
    },
    required: ["answer"],
  },
});

export default SlackFunction(
  GptFunction,
  async ({ inputs, env }) => {
    const conversation = JSON.parse(inputs.conversation);

    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: conversation,
        }),
      },
    );
    if (res.status != 200) {
      const body = await res.text();
      return {
        error: `Failed to call OpenAI API. status:${res.status} body:${body}`,
      };
    }
    const body = await res.json();
    console.log("openai api response", conversation.slice(-1)[0], body);
    if (body.choices && body.choices.length >= 0) {
      const answer = body.choices[0].message.content as string;
      return { outputs: { answer } };
    }
    return {
      error: `No choices provided. body:${JSON.stringify(body)}`,
    };
  },
);
