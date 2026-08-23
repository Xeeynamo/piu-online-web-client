import { useEffect, useRef, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { api } from "../api/client";
import { googleConfigured, renderGoogleSignInButton } from "../google-identity";
import { useAuth } from "../auth";

export function Login() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();
  const location = useLocation();
  const mock = !googleConfigured();

  const signIn = async (idToken: string) => {
    try {
      await api.authGoogle(idToken);
      await refresh();
      location.route("/cards");
    } catch {
      setError("Sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    if (mock || !buttonRef.current) return;
    renderGoogleSignInButton(buttonRef.current, signIn).catch(() =>
      setError("Could not load Google Sign-In."),
    );
  }, [mock]);

  if (mock) {
    return <MockLogin onSignIn={signIn} error={error} />;
  }

  return (
    <div class="screen screen-login">
      <h1>PRIME 2 Player Profile</h1>
      <p>Sign in with Google to view your profile and scores.</p>
      <div ref={buttonRef} />
      {error && <p class="error">{error}</p>}
    </div>
  );
}

// MockLogin stands in for Google Sign-In when no real OAuth client id is
// configured (local testing). It lets you pick any account identity and sends
// a "mock:" token the server only accepts while it too is unconfigured.
function MockLogin({
  onSignIn,
  error,
}: {
  onSignIn: (idToken: string) => void;
  error: string | null;
}) {
  const [sub, setSub] = useState("dev-user");
  const [email, setEmail] = useState("dev@example.com");

  const submit = (e: Event) => {
    e.preventDefault();
    onSignIn(`mock:${sub}:${email}`);
  };

  return (
    <div class="screen screen-login">
      <h1>PRIME 2 Player Profile</h1>
      <p class="mock-banner">
        Dev mode: Google Sign-In is not configured, so this is a mock login.
        Set <code>GOOGLE_AUTH_APP_ID</code> to enable the real flow.
      </p>
      <form onSubmit={submit} class="mock-login-form">
        <label>
          Account id (sub)
          <input value={sub} onInput={(e) => setSub((e.target as HTMLInputElement).value)} />
        </label>
        <label>
          Email
          <input value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
        </label>
        <button type="submit">Sign in (mock)</button>
      </form>
      {error && <p class="error">{error}</p>}
    </div>
  );
}
