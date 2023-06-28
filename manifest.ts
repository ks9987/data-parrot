import { Manifest } from "deno-slack-sdk/mod.ts";
import GreetingWorkflow from "./workflows/greeting_workflow.ts";
import ChatGPTWorkflow from "./workflows/chatgpt_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "DataParrot",
  description: "A parrot that is reliable data assistant.",
  icon: "assets/bunnyparrot.png",
  workflows: [
    GreetingWorkflow,
    ChatGPTWorkflow,
  ],
  outgoingDomains: [
    "api.openai.com",
  ],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "app_mentions:read",
    "channels:read",
  ],
});
