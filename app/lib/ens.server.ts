import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import type { EnsData } from "./dx.server";
import { cache } from "./cache.server";
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export type EnsData = {
  address: string;
  avatar: string;
  avatar_small: string;
  avatar_url: string;
  contentHash: null;
  description: string;
  discord: string;
  ens: string;
  ens_primary: string;
  github: string;
  keywords: string;
  notice: string;
  resolverAddress: string;
  twitter: string;
  url: string;
  wallets: {
    eth: string;
  };
};

export async function getEnsData({ id }: { id: string }): Promise<EnsData | null> {
  const cacheKey = `ens:${id}`;
  const cached = cache.get(cacheKey) as EnsData | undefined;
  if (cached) return cached;

  const response = await fetch(`https://api.ensdata.net/${id}`);
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  console.log(`ens ${id}`, data);
  cache.set(cacheKey, data);
  return data;
}

export async function resolveEnsName(input: string): Promise<{ address: string; error?: string }> {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { address: "" };
  }

  // If input is already an address, return it
  if (isAddress(trimmedInput)) {
    return { address: trimmedInput };
  }

  // Try to resolve as ENS name
  try {
    const resolvedAddress = await publicClient.getEnsAddress({
      name: trimmedInput,
    });

    if (resolvedAddress) {
      return { address: resolvedAddress };
    }

    return { address: trimmedInput, error: "Invalid address or ENS name" };
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    return { address: trimmedInput, error: "Invalid address or ENS name" };
  }
}
