import { LRUCache } from "lru-cache";
import { cache } from "./cache.server";
import { getEnsData } from "./ens.server";

const baseUrl = "https://dx2-public-api-aadnt.ondigitalocean.app/public/v1";

export async function getAgents({ address }: { address: string }) {
  const response = await fetch(`${baseUrl}/players/${address}/agents?limit=1000&offset=0`);
  const { data } = await response.json();
  return data || [];
}

export async function getLeaderboard() {
  const cacheKey = "leaderboard?limit=25";
  const cached = cache.get(cacheKey) as Leaderboard | undefined;
  if (cached) {
    return cached;
  }

  const response = await fetch(`${baseUrl}/leaderboard/players?limit=25`);
  const leaders = (await response.json()) as Leaderboard;
  const result = Promise.all(
    leaders.map(async (leader) => ({
      ...leader,
      ens: await getEnsData({ id: leader.id }).catch(() => null),
      agents: await getAgents({ address: leader.id })
        .then((agents: Agent[]) => agents.length)
        .catch(() => 0),
    }))
  );
  cache.set(cacheKey, result);
  return result;
}

export async function getActions({ agentIds }: { agentIds: string[] }) {
  const url = new URL(`${baseUrl}/agents/logs/actions`);
  url.searchParams.set("agent_ids", agentIds.join(","));
  url.searchParams.set("limit", "1000");
  url.searchParams.set("offset", "0");

  const response = await fetch(url);
  const { data } = await response.json();
  return data;
}

export async function getPrompts({ agentIds }: { agentIds: string[] }) {
  const url = new URL(`${baseUrl}/agents/prompts`);
  url.searchParams.set("ids", agentIds.join(","));

  const response = await fetch(url);
  const { prompts } = await response.json();
  return prompts;
}

// typings

export type Prompt = {
  [agentId: string]: string;
};

export type Agent = {
  id: string;
  name: string;
  type: string;
  condition: string;
  company_id: string;
  player_id: string;
  location_id: string;
  energy: number;
  persona: {
    animal: string;
    gender: string;
    hobbies: string[];
    age_range: string;
    occupation: string;
  };
  last_action_timestamp: number;
  last_action_time_ago: string;
  decide_model: string;
  message_model: string;
  decide_temp: number;
  message_temp: number;
  portfolio_value: number;
  portfolio: {
    [key: string]: number;
  };
  image_url: string;
  nugget_url: string;
  card_url: string;
};

export type Action = {
  id: string;
  agent_id: string;
  agent_name: string;
  action_timestamp: string;
  action_type: string;
  reasoning: string;
  details: {
    type: string;
    amount_in: number;
    amount_out: number;
    price_after: number;
    token_symbol: string;
  };
  location_id: string;
  created_at: string;
};

export type LeaderboardEntry = {
  ens: EnsData | null;
  agents: number;
} & DxLeaderBoardEntry;

export type Leaderboard = LeaderboardEntry[];

export type DxLeaderBoardEntry = {
  value: number;
  rank: number;
  id: string;
};
