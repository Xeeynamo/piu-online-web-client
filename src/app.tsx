import { LocationProvider, Router, Route, useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { AuthContext, useAuth, useProvideAuth } from "./auth";
import { Login } from "./routes/Login";
import { Cards } from "./routes/Cards";
import { Player } from "./routes/Player";
import { Songs } from "./routes/Songs";
import { Song } from "./routes/Song";
import { SongChart } from "./routes/SongChart";

function RequireAuth({ children }: { children: preact.ComponentChildren }) {
  const { me, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div class="screen">Loading...</div>;
  if (!me) {
    location.route("/login");
    return null;
  }
  return <>{children}</>;
}

function Header() {
  const { me, logout } = useAuth();
  const location = useLocation();
  if (!me) return null;

  // The player-scoped nav (Home/Recent/Best) needs a card. Derive it from the
  // current path so the header works on any /player/:card/* route.
  const cardMatch = location.path.match(/^\/player\/([^/]+)/);
  const card = cardMatch?.[1];

  const path = location.path;
  const isHome = card ? path === `/player/${card}` : false;
  const onSongs = card ? path === `/player/${card}/songs` : false;
  // Recent is the default Songs tab; Best is ?tab=best.
  const tab = new URLSearchParams(location.query as Record<string, string>).get("tab");
  const isRecent = onSongs && tab !== "best";
  const isBest = onSongs && tab === "best";

  return (
    <header class="app-header">
      <div class="app-brand" onClick={() => location.route("/cards")}>
        <span class="app-brand-mark">PRIME 2</span>
      </div>

      {card && (
        <nav class="app-nav">
          <button
            type="button"
            class={isHome ? "active" : ""}
            onClick={() => location.route(`/player/${card}`)}
          >
            Home
          </button>
          <button
            type="button"
            class={isRecent ? "active" : ""}
            onClick={() => location.route(`/player/${card}/songs`)}
          >
            Recent
          </button>
          <button
            type="button"
            class={isBest ? "active" : ""}
            onClick={() => location.route(`/player/${card}/songs?tab=best`)}
          >
            Best
          </button>
        </nav>
      )}

      <div class="app-actions">
        <button type="button" onClick={() => location.route("/cards")}>
          Cards
        </button>
        <button
          type="button"
          class="app-signout"
          onClick={() => logout().then(() => location.route("/login"))}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

function Home() {
  const location = useLocation();
  useEffect(() => {
    location.route("/cards", true);
  }, []);
  return <div class="screen">Loading...</div>;
}

function Routes() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route
        path="/cards"
        component={() => (
          <RequireAuth>
            <Cards />
          </RequireAuth>
        )}
      />
      <Route
        path="/player/:card"
        component={({ card }: { card: string }) => (
          <RequireAuth>
            <Player card={card} />
          </RequireAuth>
        )}
      />
      <Route
        path="/player/:card/songs"
        component={({ card }: { card: string }) => (
          <RequireAuth>
            <Songs card={card} />
          </RequireAuth>
        )}
      />
      <Route
        path="/player/:card/song/:songId"
        component={({ card, songId }: { card: string; songId: string }) => (
          <RequireAuth>
            <Song card={card} songId={songId} />
          </RequireAuth>
        )}
      />
      <Route
        path="/player/:card/song/:songId/:mode/:diff"
        component={({ card, songId, mode, diff }: { card: string; songId: string; mode: string; diff: string }) => (
          <RequireAuth>
            <SongChart card={card} songId={songId} mode={mode} diff={diff} />
          </RequireAuth>
        )}
      />
      <Route default component={() => <div class="screen">Not found</div>} />
    </Router>
  );
}

export function App() {
  const auth = useProvideAuth();
  return (
    <LocationProvider>
      <AuthContext.Provider value={auth}>
        <Header />
        <Routes />
      </AuthContext.Provider>
    </LocationProvider>
  );
}
