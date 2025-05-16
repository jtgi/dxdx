import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { Route } from "./+types/home";
import { getAgents, type Agent } from "~/lib/dx.server";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { resolveEnsName } from "~/lib/ens.server";
import { useKeyboardShortcut } from "~/hooks/useKeyboardShortcut";
import { ArrowRight } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Webcoin" }, { name: "description", content: "Webcoin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const input = url.searchParams.get("address");

  if (!input) {
    return { agents: [], address: "" };
  }

  const { address, error } = await resolveEnsName(input);

  if (error) {
    return { agents: [], address: input, error };
  }

  const agents = await getAgents({ address });

  if (agents.length === 0) {
    return { agents: [], address: input, error: "No agents found" };
  }

  const sorted = agents.sort((a: Agent, b: Agent) => b.portfolio_value - a.portfolio_value);
  return { agents: sorted, address: input };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { agents, address, error } = loaderData;
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

  const total = agents.reduce((acc: number, agent: Agent) => acc + agent.portfolio_value, 0) as number;
  const aggregated = agents.reduce((acc: Record<string, number>, agent: Agent) => {
    Object.entries(agent.portfolio).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {}) as Record<string, number>;

  return (
    <main className="p-4 text-white w-full h-screen">
      {error ? (
        <div className="flex flex-col gap-12 max-w-xl mx-auto pb-20">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-12 max-w-xl mx-auto pb-20">
          <div>
            <p className="text-sm text-zinc-400">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-white">{Math.round(total).toLocaleString()} WEBCOIN</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div>
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
                      {Object.entries(aggregated)
                        .sort((a, b) => b[1] - a[1])
                        .map(([key, value]) => (
                          <tr key={key} className="border-b border-zinc-800 hover:bg-zinc-800">
                            <td className="py-2 font-mono text-sm">{key}</td>
                            <td className="py-2 text-right font-mono text-sm">
                              {Math.round(value).toLocaleString()}
                            </td>
                            <td className="py-2 text-right font-mono text-sm">
                              {((value / total) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">All Traders</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="uppercase text-xs text-zinc-400 font-bold border-b-2 border-zinc-700 bg-zinc-900">
                    <th className="text-left  py-2">Trader</th>
                    <th className="text-right py-2">Portfolio Value</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent: Agent) => (
                    <React.Fragment key={agent.id}>
                      <tr
                        className="bg-zinc-900 border-b cursor-pointer hover:bg-zinc-800"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <td className="py-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={agent.image_url} alt={agent.name} />
                              <AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{agent.name}</span>
                          </div>
                        </td>
                        <td className="py-2 align-middle text-right font-mono text-xs font-bold whitespace-nowrap">
                          {Math.round(agent.portfolio_value).toLocaleString()} WEBCOIN
                        </td>
                      </tr>
                      {Object.entries(agent.portfolio)
                        .sort((a, b) => b[1] - a[1])
                        .map(([key, value]) => (
                          <tr
                            key={`${agent.id}-${key}`}
                            className="hover:bg-zinc-800 border-b border-zinc-900"
                          >
                            <td className="py-1 text-xs font-mono text-zinc-300 pl-10 text-right" colSpan={2}>
                              {Math.round(value).toLocaleString()} {key}
                            </td>
                          </tr>
                        ))}
                      <tr className="h-6" />
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800">
        <div className="max-w-xl mx-auto">
          <form className="flex gap-2">
            <Input
              ref={searchInputRef}
              type="text"
              name="address"
              defaultValue={address}
              className="bg-zinc-900 border-zinc-800 text-white w-[300px] selection:bg-orange-500/20 selection:text-orange-400"
              placeholder="Enter address or ENS name..."
            />
            <Button type="submit" size="sm" className="bg-white text-black hover:bg-zinc-200">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
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
              <div className="border-b border-zinc-800 my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base">
                <div>
                  <div className="uppercase tracking-wide text-xs font-bold text-zinc-400 mb-3">Persona</div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-zinc-400">Animal:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.persona.animal}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Gender:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.persona.gender}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Age Range:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.persona.age_range}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Occupation:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.persona.occupation}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Hobbies:</span>{" "}
                      <span className="font-medium text-white">
                        {selectedAgent.persona.hobbies.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wide text-xs font-bold text-zinc-400 mb-3">Details</div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-zinc-400">Condition:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.condition}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Energy:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.energy}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Last Action:</span>{" "}
                      <span className="font-medium text-white">{selectedAgent.last_action_time_ago}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Portfolio Value:</span>{" "}
                      <span className="font-medium text-white">
                        {Math.round(selectedAgent.portfolio_value).toLocaleString()} WEBCOIN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
