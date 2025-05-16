import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

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
