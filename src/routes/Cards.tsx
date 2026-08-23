import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth";

export function Cards() {
  const { me, refresh } = useAuth();
  const location = useLocation();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!me) return null;

  const addCard = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.linkCard(key.trim());
      setKey("");
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to link card.");
      }
    } finally {
      setBusy(false);
    }
  };

  const removeCard = async (id: string) => {
    setBusy(true);
    try {
      await api.unlinkCard(id);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="screen screen-cards">
      <h1>Your Cards</h1>
      <ul class="card-list">
        {me.cards.map((c) => (
          <li key={c.card_id} class="card-list-item">
            <img src={`/assets/avatars/${c.avatar_index}.png`} alt="" class="card-avatar" />
            <div class="card-info">
              <div class="card-name">{c.player_name || "(unnamed)"}</div>
              <div class="card-id">{c.card_id}</div>
            </div>
            <button type="button" onClick={() => location.route(`/player/${c.card_id}`)}>
              View
            </button>
            <button type="button" onClick={() => removeCard(c.card_id)} disabled={busy}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form class="add-card-form" onSubmit={addCard}>
        <h2>Add a card</h2>
        <input
          type="text"
          placeholder="Card key"
          value={key}
          onInput={(e) => setKey((e.target as HTMLInputElement).value)}
          required
        />
        <button type="submit" disabled={busy}>
          Add
        </button>
      </form>
      {error && <p class="error">{error}</p>}
    </div>
  );
}
