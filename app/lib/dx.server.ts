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

export async function getAgents({ address }: { address: string }) {
  const response = await fetch(
    `https://terminal.markets/api/agents/player?playerId=${address}&limit=1000&offset=0`
  );
  const { data } = await response.json();
  if (!data) {
    return [];
  }

  return data;
}

export async function getActions({ agentIds }: { agentIds: string[] }) {
  const url = new URL(`https://terminal.markets/api/agents/logs/actions`);
  url.searchParams.set("agent_ids", agentIds.join(","));
  url.searchParams.set("limit", "1000");
  url.searchParams.set("offset", "0");

  const response = await fetch(url);
  const { data } = await response.json();
  return data.map((action: Action) => ({
    ...action,
    action_time_ago: new Date(action.action_timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  })) as Action[];
}

export type Action = {
  id: string;
  agent_id: string;
  action_timestamp: string;
  action_time_ago: string;
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
