// import { PubSub } from "@google-cloud/pubsub";
//
// const pubsub = new PubSub();
//
// export async function pullGmailNotifications() {
//   const subscription = pubsub.subscription("gmail-updates-sub");
//
//   const [messages] = await subscription.pull({
//     maxMessages: 10,
//   });
//
//   for (const message of messages) {
//     const data = JSON.parse(
//       Buffer.from(message.data, "base64").toString()
//     );
//
//     console.log("📬 Gmail notification:", data);
//
//     message.ack();
//   }
// }

