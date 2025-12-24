
addEventListener('fetch', (event: any) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Handles the fetch event for the Cloudflare Worker.
 * @param request Request
 * @returns Promise<Response>
 */
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const chainId = url.searchParams.get('chainId');
  let address = url.searchParams.get('address');

  if (!chainId || !address) {
    return new Response('Missing chainId or address', { status: 400 });
  }

  // 支持原生币图标
  const chainIdToName: Record<string, string> = {
    '1': 'ethereum',
    '56': 'smartchain',
    '137': 'polygon',
    '10': 'optimism',
    '42161': 'arbitrum',
    '43114': 'avalanchec',
    '250': 'fantom',
    '25': 'cronos',
    '8453': 'base',
    '324': 'zksync',
    '59144': 'linea',
    '100': 'xdai',
    '42220': 'celo',
    '1284': 'moonbeam',
    '1313161554': 'aurora',
  };

  const isNativeToken = address === '0' || address.toLowerCase() === '0x0000000000000000000000000000000000000000';
  if (isNativeToken) {
    // 仅 TrustWallet info/logo.png
    const chainName = chainIdToName[chainId] || 'ethereum';
    const trustWalletNativeUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/info/logo.png`;
    const iconRes = await fetch(trustWalletNativeUrl);
    if (iconRes.ok) {
      return new Response(iconRes.body, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
      });
    }
    return new Response('Icon not found', { status: 404 });
  }

  // 非原生币
  const web3iconsUrl = `https://registry.npmjs.org/@web3icons/react/latest/files/icons/${chainId}/${address}.svg`;
  let iconRes = await fetch(web3iconsUrl);
  if (iconRes.ok) {
    return new Response(await iconRes.text(), {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    });
  }
  const trustWalletUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  iconRes = await fetch(trustWalletUrl);
  if (iconRes.ok) {
    return new Response(iconRes.body, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
    });
  }
  return new Response('Icon not found', { status: 404 });
}
