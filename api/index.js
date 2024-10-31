// server.js
const express = require('express');
const path = require('path');

const wasm_library = require('./lib/wasm_wrappers');

const decodedString = (base64String) => {
  const res = Buffer.from(base64String, 'base64').toString('utf-8');
  return res;
}

const stringToUint8Array = (string) => {
  const binaryString = atob(string)
  const len = binaryString.length
  const uint8Array = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    uint8Array[i] = binaryString.charCodeAt(i)
  }
  return uint8Array
}

const stringToBytes = (string) => {
  const encoder = new TextEncoder()
  return encoder.encode(string)
}

const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../page.html'));
});

app.post('/api/verify', (req, res) => {
  const { address, challengeBase64, signature } = req.body;

  const parsedsignature = decodeURIComponent(signature);
  const signedMessageUint8Array = stringToUint8Array(parsedsignature.split(' ').join('+'))
  const originalMessage = decodedString(challengeBase64)
  const messageBytes = stringToBytes(originalMessage)

  try {
    const result = wasm_library.verify_challenge(
      address,
      wasm_library.Network.Mainnet,
      signedMessageUint8Array,
      messageBytes
    );
    res.json({success: result});
  } catch (error) {
    console.error(error);
    res.json({success: false});
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
