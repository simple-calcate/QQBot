import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:3001');

ws.on('open', () => {
  ws.send(JSON.stringify({
    action: 'get_forward_msg',
    params: {
      id: 'deVRVg+PAx0o2YKzWdK0UMRkBf+O2D+MmAmRgdMaQzyy0mkA5EyvV6zBhESFzoDg'
    },
    echo: 'fwd1'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.echo === 'fwd1') {
    console.log(JSON.stringify(msg, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

setTimeout(() => { console.log('Timeout'); process.exit(0); }, 8000);
