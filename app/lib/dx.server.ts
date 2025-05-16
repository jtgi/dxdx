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
