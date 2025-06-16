import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelList, Window, ChannelHeader, MessageList, MessageInput } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const chatApiKey = 'YOUR_CHAT_API_KEY'; // Same as video API key
const chatClient = StreamChat.getInstance(chatApiKey);

const ChatComponent = () => {
  const user = { id: 'viewer_id', name: 'Viewer' }; // Replace with dynamic user
  chatClient.connectUser(user, chatClient.devToken(user.id));
  const channel = chatClient.channel('livestream', callId);

  return (
    <Chat client={chatClient} theme="str-chat__theme-dark">
      <ChannelList />
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </Chat>
  );
};