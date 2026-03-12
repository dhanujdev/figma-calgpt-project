const base = process.env.MCP_BASE_URL;

if (!base) {
  console.log('smoke-mcp: skipped (set MCP_BASE_URL to run live smoke tests)');
  process.exit(0);
}

const post = async (payload) => {
  const response = await fetch(base, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok || body.error) {
    throw new Error(`RPC failed: ${JSON.stringify(body)}`);
  }
  return body;
};

await post({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
const tools = await post({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
if (!Array.isArray(tools.result?.tools) || tools.result.tools.length < 6) {
  throw new Error('tools/list did not return expected tools');
}

const resources = await post({ jsonrpc: '2.0', id: 3, method: 'resources/list' });
const uri = resources.result?.resources?.[0]?.uri;
if (!uri || !String(uri).includes('v4')) {
  throw new Error('resources/list missing v4 widget URI');
}

await post({ jsonrpc: '2.0', id: 4, method: 'resources/read', params: { uri } });
await post({
  jsonrpc: '2.0',
  id: 5,
  method: 'tools/call',
  params: { name: 'sync_state', arguments: {} },
});

console.log('smoke-mcp: OK');
