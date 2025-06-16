const { StreamVideoClient } = require('@stream-io/node-sdk');
const apiKey = 'cynaurb9zvhy';
const secret = 'fuc4kyue9c9cwth2rs4nhrqx6ftryv9sn4q8mf4bhyu6squ2w9xzttd4x7qmjnzb'; 

const client = new StreamVideoClient(apiKey, secret);
const broadcasterUser = { id: 'dj_user_id', role: 'broadcaster' };
const token = client.createToken(broadcasterUser.id, {
  role: 'broadcaster',
  call_cids: [`livestream:${callId}`],
});
console.log(token);