import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

export function useStorageUrl(hash: string | undefined | null): {
  url: string | null;
  loading: boolean;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hash) {
      setUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setUrl(null);

    (async () => {
      try {
        const config = await loadConfig();
        const agent = new HttpAgent({ host: config.backend_host });
        const storageClient = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );
        const resolved = await storageClient.getDirectURL(hash);
        if (!cancelled) {
          setUrl(resolved);
        }
      } catch (err) {
        console.error(
          "useStorageUrl: failed to resolve URL for hash",
          hash,
          err,
        );
        if (!cancelled) setUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hash]);

  return { url, loading };
}
