import React from "react";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useKeyboardShortcut } from "~/hooks/useKeyboardShortcut";
import { getAgents, getActions } from "~/lib/dx.server";
import { resolveEnsName } from "~/lib/ens.server";
import type { Route } from "./+types/home";
import type { Agent, Action } from "~/lib/dx.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "dxdx - dxterminal pro" }, { name: "description", content: "dxdx - dxterminal pro" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const input = url.searchParams.get("address");

  if (!input) {
    return { agents: [], actions: [], address: "" };
  }

  const { address, error } = await resolveEnsName(input);
  if (error) {
    return { agents: [], actions: [], address: input, error };
  }

  const agents = await getAgents({ address });
  if (agents.length === 0) {
    return { agents: [], actions: [], address: input, error: "No agents found" };
  }

  const sortedAgents = agents.sort((a: Agent, b: Agent) => b.portfolio_value - a.portfolio_value);
  const actions = await getActions({ agentIds: agents.map((agent: Agent) => agent.id) });
  return { agents: sortedAgents, actions, address: input };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { agents, address, error, actions } = loaderData;
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useKeyboardShortcut({
    keys: { key: "/" },
    action: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    },
  });

  const totalPortfolioValue = agents.reduce((acc: number, agent: Agent) => acc + agent.portfolio_value, 0);
  const portfolioDistribution = agents.reduce((acc: Record<string, number>, agent: Agent) => {
    Object.entries(agent.portfolio as Record<string, number>).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {}) as Record<string, number>;

  const actionsByAgent = actions.reduce((acc: Record<string, Action[]>, action: Action) => {
    acc[action.agent_id] = [...(acc[action.agent_id] || []), action];
    return acc;
  }, {}) as Record<string, Action[]>;

  const sortedActions = [...actions].sort(
    (a: Action, b: Action) => new Date(b.action_timestamp).getTime() - new Date(a.action_timestamp).getTime()
  );

  const renderSearchForm = (className = "") => (
    <form className={`flex gap-2 ${className}`}>
      <Input
        ref={searchInputRef}
        type="text"
        name="address"
        defaultValue={address}
        className="bg-zinc-900 border-zinc-800 text-gray-300 w-[300px] md:w-[400px] selection:bg-orange-500/20 selection:text-orange-400"
        placeholder="Address or ENS..."
      />
      <Button type="submit" size="sm" variant="ghost" className="bg-white text-black hover:bg-zinc-200">
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );

  if (error) {
    return (
      <main className="p-4 text-white w-full h-screen">
        <div className="flex flex-col gap-12 max-w-xl mx-auto pb-20">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (agents.length === 0) {
    return (
      <main className="p-4 text-white w-full h-screen">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4">
          <div className="text-center max-w-xl">
            <h1 className="text-4xl font-bold mb-6">dxterminal powertools</h1>
            <p className="text-zinc-400 mb-8">Enter an address or ENS name to view trading activity</p>
            {renderSearchForm("mb-8")}
            <div className="text-sm text-zinc-500">
              <p className="mb-2">Try these holders</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="?address=0x5dC5E4c884e0719d07122333d0558aBa5Cd670A6"
                  className="text-zinc-400 hover:text-white"
                >
                  0x5dC5E...
                </a>
                <a href="?address=aimhigher.eth" className="text-zinc-400 hover:text-white">
                  aimhigher.eth
                </a>
                <a href="?address=fivelines.eth" className="text-zinc-400 hover:text-white">
                  fivelines.eth
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 text-white w-full h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
        <div>
          <p className="text-sm text-zinc-400">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-white">
            {Math.round(totalPortfolioValue).toLocaleString()} WEBCOIN
          </p>
          <div className="mt-8">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Portfolio Distribution</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                    <th className="text-left pb-2">Asset</th>
                    <th className="text-right pb-2">Amount</th>
                    <th className="text-right pb-2">% of Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(portfolioDistribution)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([key, value]: [string, number]) => (
                      <tr key={key} className="border-b border-zinc-800 hover:bg-zinc-800">
                        <td className="py-2 text-sm">{key}</td>
                        <td className="py-2 text-right text-sm">{Math.round(value).toLocaleString()}</td>
                        <td className="py-2 text-right text-sm">
                          {((value / totalPortfolioValue) * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">All Traders</h2>
          <div className="grid grid-cols-1 gap-4">
            {agents.map((agent: Agent) => (
              <div
                key={agent.id}
                className="border border-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-800"
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={agent.image_url} alt={agent.name} />
                        <AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{agent.name}</div>
                        <div className="text-xs text-zinc-400">{agent.type}</div>
                      </div>
                    </div>

                    {actionsByAgent[agent.id]?.[0] && (
                      <div className="text-xs text-zinc-400">
                        <div className="font-medium text-zinc-300">
                          {actionsByAgent[agent.id][0].reasoning}
                        </div>
                        <div className="mt-1">{actionsByAgent[agent.id][0].action_time_ago}</div>
                      </div>
                    )}
                  </div>

                  <div className="text-right min-w-[200px]">
                    <div className="text-sm font-bold mb-2">
                      {Math.round(agent.portfolio_value).toLocaleString()} WEBCOIN
                    </div>
                    <div className="space-y-1">
                      {Object.entries(agent.portfolio as Record<string, number>)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([key, value]: [string, number]) => (
                          <div key={key} className="text-xs text-zinc-400">
                            {Math.round(value).toLocaleString()} {key}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Recent Actions</h2>
          <div className="space-y-2">
            {sortedActions.map((action) => {
              const agent = agents.find((a: Agent) => a.id === action.agent_id);
              return (
                <div key={action.id} className="bg-zinc-900 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6 mt-1">
                      <AvatarImage src={agent?.image_url} alt={agent?.name || ""} />
                      <AvatarFallback>{agent?.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-400">
                        {agent?.name} • {action.action_time_ago}
                      </div>
                      <div className="text-sm mt-1">{action.reasoning}</div>
                      {action.details && (
                        <div className="text-xs text-zinc-400 mt-1">
                          {action.details.type} • {action.details.amount_in} → {action.details.amount_out}{" "}
                          {action.details.token_symbol}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/30 backdrop-blur-sm border-t border-zinc-800">
        <div className="max-w-xl mx-auto flex gap-4 items-center justify-between">
          <div className="text-xl md:text-3xl italic font-extrabold text-zinc-200">dxdx</div>
          {renderSearchForm()}
        </div>
      </div>

      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-xl">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4 mb-2">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={selectedAgent.image_url} alt={selectedAgent.name} />
                    <AvatarFallback>{selectedAgent.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-2xl font-extrabold leading-tight">{selectedAgent.name}</div>
                    <div className="text-base font-semibold text-zinc-400 mt-1">{selectedAgent.type}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="my-4">
                <table className="w-full text-xs text-zinc-300 border-separate [border-spacing:0.25rem]">
                  <tbody>
                    <tr>
                      <td className="font-semibold text-zinc-400">Animal</td>
                      <td>{selectedAgent.persona.animal}</td>
                      <td className="font-semibold text-zinc-400">Condition</td>
                      <td>{selectedAgent.condition}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-zinc-400">Gender</td>
                      <td>{selectedAgent.persona.gender}</td>
                      <td className="font-semibold text-zinc-400">Energy</td>
                      <td>{selectedAgent.energy}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-zinc-400">Age</td>
                      <td>{selectedAgent.persona.age_range}</td>
                      <td className="font-semibold text-zinc-400">Last Action</td>
                      <td>{selectedAgent.last_action_time_ago}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-zinc-400">Occupation</td>
                      <td colSpan={3}>{selectedAgent.persona.occupation}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-zinc-400">Hobbies</td>
                      <td colSpan={3}>{selectedAgent.persona.hobbies.join(", ")}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-zinc-400">Portfolio Value</td>
                      <td colSpan={3}>
                        {Math.round(selectedAgent.portfolio_value).toLocaleString()} WEBCOIN
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-b border-zinc-800 my-2" />

              {actionsByAgent[selectedAgent.id] && (
                <div>
                  <div className="uppercase tracking-wide text-xs font-bold text-zinc-400 mb-2">
                    Recent Actions
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {actionsByAgent[selectedAgent.id].slice(0, 10).map((action) => (
                      <div key={action.id} className="bg-zinc-800/50 rounded-lg p-2">
                        <div className="text-xs text-zinc-400">{action.action_time_ago}</div>
                        <div className="text-xs mt-1">{action.reasoning}</div>
                        {action.details && (
                          <div className="text-xs text-zinc-400 mt-1">
                            <span className="uppercase">{action.details.type}</span> •{" "}
                            {action.details.amount_in} → {action.details.amount_out}{" "}
                            {action.details.token_symbol}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
