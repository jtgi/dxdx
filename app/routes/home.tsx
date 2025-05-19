import React, { Suspense } from "react";
import { useKeyboardShortcut } from "~/hooks/useKeyboardShortcut";
import type { Route } from "./+types/home";
import { SearchForm } from "~/components/SearchForm";
import { Await, Link, redirect } from "react-router";
import { getLeaderboard } from "~/lib/dx.server";
import { prettyAddress } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Bot } from "lucide-react";
import numeral from "numeral";

export function meta({}: Route.MetaArgs) {
  return [{ title: "dxdx - dxterminal pro" }, { name: "description", content: "dxdx - dxterminal pro" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const address = url.searchParams.get("address");
  if (address) {
    return redirect(`/${address}`);
  }

  return {
    leaderboard: getLeaderboard(),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { leaderboard } = loaderData;
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

  return (
    <main className="p-4 text-white w-full h-screen">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4">
        <div className="flex flex-col items-center justify-center max-w-xl gap-12">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <h1 className="text-4xl font-bold">dxterminal powertools</h1>
            <p className="text-zinc-400">Enter an address or ENS name to view trading activity</p>
            <SearchForm ref={searchInputRef} />
          </div>

          <div className="text-sm text-zinc-500 text-center">
            <Suspense
              fallback={
                <div>
                  <p className="mb-4 text-zinc-400 font-medium">Top Traders</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-md border border-zinc-800"
                      >
                        <div className="h-7 w-7 rounded-full bg-zinc-800 shrink-0" />
                        <div className="flex flex-col min-w-0 flex-auto">
                          <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                          <div className="flex items-center gap-4 mt-1">
                            <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-5 w-12 bg-zinc-800 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <Await resolve={leaderboard}>
                {(leaderboard) => (
                  <div>
                    <p className="mb-4 text-zinc-400 font-medium">Top Traders</p>
                    <div className="grid grid-cols-2 gap-2">
                      {leaderboard.slice(0, 8).map((leader, index) => (
                        <Link
                          key={leader.id}
                          to={`/${leader.ens?.ens || leader.id}`}
                          className="block flex items-center gap-3 p-2 rounded-md border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage
                              src={leader.ens?.avatar || leader.ens?.avatar_small || leader.ens?.avatar_url}
                            />
                            <AvatarFallback>
                              <Bot className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-auto">
                            <p className="text-xs text-zinc-300 text-left truncate">
                              {leader.ens?.ens || prettyAddress(leader.id)}
                            </p>
                            <div className="flex items-center gap-4">
                              <p className="text-xs text-zinc-500 text-left flex items-center gap-1">
                                <Bot className="w-3 h-3 inline" />
                                <p>{leader.agents}</p>
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-light text-zinc-300 font-medium text-left pl-2">
                            ${numeral(leader.value).format("0a").toUpperCase()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
