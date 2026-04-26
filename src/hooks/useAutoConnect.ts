import { useEffect, useState } from "react";
import { useConnect, useConnectors } from "wagmi";

/**
 * Auto-connect to MiniPay on page load.
 * Exact pattern from MiniPay docs.
 * Source: https://docs.minipay.xyz/getting-started/wallet-connection.html
 */
export function useAutoConnect() {
  const connectors                     = useConnectors();
  const { connect, error, isPending }  = useConnect();
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    if (hasAttempted || connectors.length === 0) return;

    const attemptConnect = async () => {
      try {
        await connect({ connector: connectors[0] });
      } catch (err) {
        console.error("[PayFlow] Auto-connect failed:", err);
      }
      setHasAttempted(true);
    };

    attemptConnect();
  }, [connectors, connect, hasAttempted]);

  return { error, isPending };
}
