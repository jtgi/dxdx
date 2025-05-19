import React, { Suspense } from "react";
import { useKeyboardShortcut } from "~/hooks/useKeyboardShortcut";
import type { Route } from "./+types/home";
import { SearchForm } from "~/components/SearchForm";
import { Await, Link, redirect } from "react-router";
import { getLeaderboard } from "~/lib/dx.server";
import { prettyAddress } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
                        <span className="text-zinc-600 w-6 text-right">{index + 1}</span>
                        <div className="h-8 w-8 rounded-full bg-zinc-800" />
                        <div className="h-4 w-32 bg-zinc-800 rounded" />
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
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {leaderboard.slice(0, 8).map((leader, index) => (
                        <Link
                          key={leader.id}
                          to={`/${leader.ens?.ens || leader.id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                          <p className="text-zinc-600 w-6">{index + 1}</p>
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={leader.ens?.avatar || leader.ens?.avatar_small || leader.ens?.avatar_url}
                            />
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs text-zinc-300 text-left">
                              {leader.ens?.ens || prettyAddress(leader.id)}
                            </p>
                            <p className="text-zinc-500 text-[8px]">{leader.agents} agents</p>
                          </div>
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
