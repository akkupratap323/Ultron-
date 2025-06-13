import { StreamChat } from "stream-chat";

const streamServerClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!,  // Add ! for non-null assertion
);

export default streamServerClient;
