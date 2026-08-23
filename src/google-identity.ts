// Thin wrapper around Google Identity Services' script-injected global,
// loaded lazily so pages that don't need sign-in never pay for it.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }): void;
          renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

// googleConfigured reports whether a real Google OAuth client id is wired in.
// When it isn't (empty, or the docker-compose dev placeholder), the client
// falls back to a mock sign-in so the app can be tested locally without a
// Google project. The server applies the same rule to accept the mock token.
export function googleConfigured(): boolean {
  const id = import.meta.env.VITE_GOOGLE_AUTH_APP_ID;
  return !!id && !id.startsWith("dev-placeholder");
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function renderGoogleSignInButton(
  container: HTMLElement,
  onCredential: (idToken: string) => void,
) {
  await loadScript();
  if (!window.google) throw new Error("Google Identity Services did not initialize");
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_AUTH_APP_ID,
    callback: (response) => onCredential(response.credential),
  });
  window.google.accounts.id.renderButton(container, { theme: "outline", size: "large" });
}
