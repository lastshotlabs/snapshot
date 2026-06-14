import React, { useState, useEffect, useCallback, useRef } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Provider as JotaiProvider, createStore } from "jotai";
import {
  resolveTokens,
  ToastContainer,
  ConfirmDialog,
  StatCardBase,
  DataTableBase,
  ButtonBase,
  TabsBase,
  ModalBase,
  BadgeBase,
  EmptyStateBase,
  SkeletonBase,
  AlertBase,
  CardBase,
  InputField,
} from "@lastshotlabs/snapshot/ui";
import { tokenStorage, queryClient as snapshotQueryClient } from "./lib/snapshot";
import {
  postApiGuestSession,
} from "./api/guest";
import {
  getApiLibraryByKind,
  getApiLibraryByKindById,
  postApiLibraryByKind,
} from "./api/library";
import {
  getApiMatches,
  postApiMatches,
  postApiMatchesByIdStart,
  postApiMatchesByIdEnd,
} from "./api/matches";
import {
  getApiJeopardyStatus,
} from "./api/system";
import { TokenEditorSidebar } from "./token-editor";

const initialCss = resolveTokens({ flavor: "neutral" });
const style = document.createElement("style");
style.id = "snapshot-tokens";
style.textContent = initialCss;
document.head.appendChild(style);

const jotaiStore = createStore();

// ── Session management ────────────────────────────────────────────────────────

function useGuestSession() {
  const [sessionState, setSessionState] = useState<{
    userId: string | null;
    displayName: string | null;
    ready: boolean;
    error: string | null;
  }>({ userId: null, displayName: null, ready: false, error: null });

  useEffect(() => {
    const existing = tokenStorage.get();
    if (existing) {
      try {
        const parts = existing.split(".");
        const payload = JSON.parse(atob(parts[1]!));
        const exp = payload.exp as number;
        if (exp * 1000 > Date.now()) {
          setSessionState({
            userId: payload.sub as string,
            displayName: localStorage.getItem("jeopardy_display_name"),
            ready: true,
            error: null,
          });
          return;
        }
      } catch {}
      tokenStorage.clear();
    }

    const name = localStorage.getItem("jeopardy_display_name") || `Player${Math.floor(Math.random() * 9000) + 1000}`;
    postApiGuestSession({ displayName: name })
      .then((res) => {
        const token = (res.session as Record<string, unknown>).token as string;
        tokenStorage.set(token);
        localStorage.setItem("jeopardy_display_name", res.guest.displayName);
        setSessionState({
          userId: res.guest.userId,
          displayName: res.guest.displayName,
          ready: true,
          error: null,
        });
      })
      .catch((err) => {
        setSessionState({ userId: null, displayName: null, ready: false, error: String(err) });
      });
  }, []);

  return sessionState;
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBadge() {
  const { data } = useQuery({
    queryKey: ["system", "status"],
    queryFn: getApiJeopardyStatus,
    refetchInterval: 30_000,
  });

  if (!data) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <BadgeBase
        text={data.phase}
        color="success"
        variant="soft"
        size="sm"
      />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function AppHeader({ darkMode, onToggleDark, displayName }: {
  darkMode: boolean;
  onToggleDark: () => void;
  displayName: string | null;
}) {
  return (
    <header style={{
      background: "var(--sn-color-card, #ffffff)",
      borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "var(--sn-color-primary, #2563eb)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}>🎯</div>
        <div>
          <div style={{
            fontWeight: "700",
            fontSize: "1.125rem",
            color: "var(--sn-color-foreground, #111827)",
            lineHeight: 1.1,
          }}>Jeopardy</div>
          <div style={{
            fontSize: "0.6875rem",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>Game Platform</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <StatusBadge />
        {displayName && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <div style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "var(--sn-color-primary, #2563eb)",
              color: "var(--sn-color-primary-foreground, #fff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "700",
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground, #6b7280)" }}>
              {displayName}
            </span>
          </div>
        )}
        <ButtonBase
          label={darkMode ? "Light" : "Dark"}
          variant="outline"
          size="sm"
          icon={darkMode ? "sun" : "moon"}
          onClick={onToggleDark}
        />
      </div>
    </header>
  );
}

// ── Home tab ──────────────────────────────────────────────────────────────────

function HomeTab({ userId }: { userId: string | null }) {
  const { data: statusData } = useQuery({
    queryKey: ["system", "status"],
    queryFn: getApiJeopardyStatus,
    refetchInterval: 30_000,
  });

  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => getApiMatches(),
    enabled: !!userId,
  });

  const { data: cluesetsData, isLoading: cluesetsLoading } = useQuery({
    queryKey: ["library", "clue-sets"],
    queryFn: () => getApiLibraryByKind("clue-sets"),
    enabled: !!userId,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["library", "categories"],
    queryFn: () => getApiLibraryByKind("categories"),
    enabled: !!userId,
  });

  const matches = (matchesData?.items ?? []) as Record<string, unknown>[];
  const clueSets = (cluesetsData?.items ?? []) as Record<string, unknown>[];
  const categories = (categoriesData?.items ?? []) as Record<string, unknown>[];

  const activeMatches = matches.filter(m => m.status !== "ended" && m.status !== "archived");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "0 0 0.25rem", color: "var(--sn-color-foreground)" }}>
          Dashboard
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground)", margin: 0 }}>
          {statusData ? `${statusData.gameType} · ${statusData.phase}` : "Connecting…"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <StatCardBase
          label="Clue Sets"
          value={cluesetsLoading ? null : String(clueSets.length)}
          icon="library"
          isLoading={cluesetsLoading}
          trend={null}
        />
        <StatCardBase
          label="Categories"
          value={categoriesLoading ? null : String(categories.length)}
          icon="folder"
          isLoading={categoriesLoading}
          trend={null}
        />
        <StatCardBase
          label="Total Matches"
          value={matchesLoading ? null : String(matches.length)}
          icon="gamepad-2"
          isLoading={matchesLoading}
          trend={null}
        />
        <StatCardBase
          label="Active Matches"
          value={matchesLoading ? null : String(activeMatches.length)}
          icon="play-circle"
          iconColor="success"
          isLoading={matchesLoading}
          trend={null}
        />
      </div>

      {matches.length > 0 && (
        <CardBase>
          <div style={{ padding: "1rem 1.25rem 0.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 1rem", color: "var(--sn-color-foreground)" }}>
              Recent Matches
            </h3>
            <DataTableBase
              columns={[
                { field: "title", label: "Title" },
                { field: "status", label: "Status", format: "badge", badgeColors: { active: "success", ended: "muted", draft: "secondary", paused: "warning" } },
                { field: "createdAt", label: "Created", format: "date" },
              ]}
              rows={matches.slice(0, 5).map(m => ({ ...m, title: (m.title as string) || "Untitled Match" }))}
              hoverable
              compact
            />
          </div>
        </CardBase>
      )}

      {matches.length === 0 && !matchesLoading && (
        <CardBase>
          <EmptyStateBase
            icon="gamepad-2"
            title="No matches yet"
            description="Create your first match to get started."
            size="sm"
          />
        </CardBase>
      )}
    </div>
  );
}

// ── Library tab ───────────────────────────────────────────────────────────────

function CreateLibraryItemModal({ kind, open, onClose, onCreated }: {
  kind: "clue-sets" | "categories" | "clues";
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => postApiLibraryByKind(kind, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library", kind] });
      onCreated();
      setTitle("");
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create");
    },
  });

  const kindLabel = kind === "clue-sets" ? "Clue Set" : kind === "categories" ? "Category" : "Clue";

  const handleSubmit = () => {
    if (!title.trim()) { setError("Title is required"); return; }
    mutation.mutate({ title: title.trim() });
  };

  useEffect(() => {
    if (!open) { setTitle(""); setError(null); }
  }, [open]);

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={`New ${kindLabel}`}
      size="sm"
      footer={[
        { label: "Cancel", variant: "outline", onClick: onClose },
        { label: mutation.isPending ? "Creating…" : "Create", onClick: handleSubmit },
      ]}
    >
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
          <AlertBase variant="destructive" title="Error" description={error} />
        )}
        <InputField
          label={`${kindLabel} title`}
          placeholder={`Enter ${kindLabel.toLowerCase()} title…`}
          value={title}
          onChange={setTitle}
          required
        />
      </div>
    </ModalBase>
  );
}

function LibraryItemPreviewModal({
  kind,
  itemId,
  open,
  onClose,
}: {
  kind: "clue-sets" | "categories" | "clues";
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useQuery({
    enabled: open && Boolean(itemId),
    queryKey: ["library", kind, itemId],
    queryFn: () => getApiLibraryByKindById(kind, itemId!),
  });

  const record = (data ?? null) as Record<string, unknown> | null;
  const title = (record?.title as string) || "Preview";
  const kindLabel =
    kind === "clue-sets" ? "Clue Set" : kind === "categories" ? "Category" : "Clue";

  // Pull common clue fields if present.
  const prompt =
    (record?.prompt as string | undefined) ??
    (record?.question as string | undefined) ??
    (record?.body as string | undefined);
  const answer =
    (record?.answer as string | undefined) ??
    (record?.solution as string | undefined);
  const workflowStatus = record?.workflowStatus as string | undefined;
  const visibility = record?.visibility as string | undefined;

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={`${kindLabel}: ${title}`}
      size="md"
      footer={[{ label: "Close", variant: "outline", onClick: onClose }]}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {isLoading && <SkeletonBase height="120px" />}
        {error && (
          <AlertBase
            variant="destructive"
            title="Failed to load"
            description={String(error)}
          />
        )}
        {!isLoading && !error && record && (
          <>
            {(workflowStatus || visibility) && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {workflowStatus && (
                  <BadgeBase
                    label={workflowStatus}
                    variant={
                      workflowStatus === "published" || workflowStatus === "approved"
                        ? "success"
                        : workflowStatus === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  />
                )}
                {visibility && (
                  <BadgeBase
                    label={visibility}
                    variant={visibility === "public" ? "success" : "secondary"}
                  />
                )}
              </div>
            )}
            {prompt && (
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--sn-color-muted-foreground)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Prompt
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    color: "var(--sn-color-foreground)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {prompt}
                </div>
              </div>
            )}
            {answer && (
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--sn-color-muted-foreground)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Answer
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    color: "var(--sn-color-foreground)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {answer}
                </div>
              </div>
            )}
            {!prompt && !answer && (
              <EmptyStateBase
                icon="file-question"
                title="No preview content"
                description="This record has no prompt or answer fields to preview."
                size="sm"
              />
            )}
          </>
        )}
      </div>
    </ModalBase>
  );
}

function LibraryKindView({ kind, label }: { kind: "clue-sets" | "categories" | "clues"; label: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["library", kind],
    queryFn: () => getApiLibraryByKind(kind),
  });

  const items = ((data?.items ?? []) as Record<string, unknown>[]).map(item => ({
    ...item,
    title: (item.title as string) || "Untitled",
    workflowStatus: item.workflowStatus as string,
    visibility: item.visibility as string,
    createdAt: item.createdAt as string,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 0.25rem", color: "var(--sn-color-foreground)" }}>
            {label}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--sn-color-muted-foreground)", margin: 0 }}>
            {isLoading ? "Loading…" : `${items.length} item${items.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <ButtonBase
          label={`New ${label.slice(0, -1)}`}
          icon="plus"
          size="sm"
          onClick={() => setCreateOpen(true)}
        />
      </div>

      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[1, 2, 3].map(i => <SkeletonBase key={i} height="48px" />)}
        </div>
      )}

      {error && (
        <AlertBase variant="destructive" title="Failed to load" description={String(error)} />
      )}

      {!isLoading && !error && items.length === 0 && (
        <EmptyStateBase
          icon="inbox"
          title={`No ${label.toLowerCase()} yet`}
          description={`Create your first ${label.slice(0, -1).toLowerCase()} to get started.`}
          actionLabel={`New ${label.slice(0, -1)}`}
          onAction={() => setCreateOpen(true)}
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <DataTableBase
          columns={[
            { field: "title", label: "Title" },
            { field: "workflowStatus", label: "Status", format: "badge", badgeColors: { draft: "muted", published: "success", submitted: "info", approved: "success", rejected: "destructive", archived: "secondary" } },
            { field: "visibility", label: "Visibility", format: "badge", badgeColors: { private: "secondary", public: "success" } },
            { field: "createdAt", label: "Created", format: "date" },
          ]}
          rows={items}
          searchable
          searchPlaceholder={`Search ${label.toLowerCase()}…`}
          hoverable
          striped
          onRowClick={(row) => {
            const id = row.id as string | undefined;
            if (id) setPreviewId(id);
          }}
        />
      )}

      <CreateLibraryItemModal
        kind={kind}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
      />

      <LibraryItemPreviewModal
        kind={kind}
        itemId={previewId}
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
      />
    </div>
  );
}

function LibraryTab() {
  const [activeKind, setActiveKind] = useState(0);
  const kinds = [
    { kind: "clue-sets" as const, label: "Clue Sets" },
    { kind: "categories" as const, label: "Categories" },
    { kind: "clues" as const, label: "Clues" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "0 0 0.25rem", color: "var(--sn-color-foreground)" }}>
          Library
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground)", margin: 0 }}>
          Manage your clue sets, categories, and clues.
        </p>
      </div>
      <TabsBase
        variant="underline"
        defaultTab={activeKind}
        onTabChange={setActiveKind}
        tabs={kinds.map(({ kind, label }) => ({
          label,
          content: <LibraryKindView kind={kind} label={label} />,
        }))}
      />
    </div>
  );
}

// ── Matches tab ───────────────────────────────────────────────────────────────

function CreateMatchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"title" | "board">("title");
  const [matchId, setMatchId] = useState<string | null>(null);

  const createMatch = useMutation({
    mutationFn: (data: Record<string, unknown>) => postApiMatches(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      onClose();
      setTitle("");
      setError(null);
      setStep("title");
      setMatchId(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create match");
    },
  });

  useEffect(() => {
    if (!open) { setTitle(""); setError(null); setStep("title"); setMatchId(null); }
  }, [open]);

  const handleCreate = () => {
    if (!title.trim()) { setError("Title is required"); return; }
    createMatch.mutate({ title: title.trim() });
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="New Match"
      size="sm"
      footer={[
        { label: "Cancel", variant: "outline", onClick: onClose },
        { label: createMatch.isPending ? "Creating…" : "Create Match", onClick: handleCreate },
      ]}
    >
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
          <AlertBase variant="destructive" title="Error" description={error} />
        )}
        <InputField
          label="Match title"
          placeholder="e.g. Friday Night Trivia"
          value={title}
          onChange={setTitle}
          required
        />
        <AlertBase
          variant="info"
          title="Note"
          description="You can configure the board and players after creating the match."
        />
      </div>
    </ModalBase>
  );
}

function MatchesTab() {
  const [createOpen, setCreateOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: () => getApiMatches(),
  });

  const endMatch = useMutation({
    mutationFn: (id: string) => postApiMatchesByIdEnd(id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });

  const startMatch = useMutation({
    mutationFn: (id: string) => postApiMatchesByIdStart(id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });

  const matches = ((data?.items ?? []) as Record<string, unknown>[]).map(m => ({
    ...m,
    title: (m.title as string) || "Untitled Match",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "0 0 0.25rem", color: "var(--sn-color-foreground)" }}>
            Matches
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground)", margin: 0 }}>
            {isLoading ? "Loading…" : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
          </p>
        </div>
        <ButtonBase
          label="New Match"
          icon="plus"
          onClick={() => setCreateOpen(true)}
        />
      </div>

      {error && (
        <AlertBase variant="destructive" title="Failed to load matches" description={String(error)} />
      )}

      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[1, 2, 3].map(i => <SkeletonBase key={i} height="56px" />)}
        </div>
      )}

      {!isLoading && !error && matches.length === 0 && (
        <EmptyStateBase
          icon="gamepad-2"
          title="No matches yet"
          description="Create a match to start playing Jeopardy."
          actionLabel="New Match"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {!isLoading && !error && matches.length > 0 && (
        <DataTableBase
          columns={[
            { field: "title", label: "Match" },
            { field: "status", label: "Status", format: "badge", badgeColors: { active: "success", ended: "muted", draft: "secondary", paused: "warning", "in-progress": "info" } },
            { field: "createdAt", label: "Created", format: "date" },
            { field: "updatedAt", label: "Updated", format: "date" },
          ]}
          rows={matches}
          searchable
          searchPlaceholder="Search matches…"
          hoverable
          striped
          rowActions={[
            {
              label: "Start",
              icon: "play",
              onAction: (row) => startMatch.mutate(row.id as string),
            },
            {
              label: "End",
              icon: "square",
              variant: "destructive",
              onAction: (row) => endMatch.mutate(row.id as string),
            },
          ]}
        />
      )}

      <CreateMatchModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

// ── Discovery tab ─────────────────────────────────────────────────────────────

function DiscoveryTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["discovery"],
    queryFn: async () => {
      const { getApiDiscovery } = await import("./api/discovery");
      return getApiDiscovery();
    },
  });

  type DiscoverySection = { kind: string; items: Record<string, unknown>[] };
  const dataObj = data as Record<string, unknown> | null | undefined;
  const sections = (dataObj?.sections as DiscoverySection[] | undefined) ?? [];
  const allItems = sections.flatMap(s => (s.items ?? []).map(item => ({ ...item, kind: s.kind })));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "0 0 0.25rem", color: "var(--sn-color-foreground)" }}>
          Discovery
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground)", margin: 0 }}>
          Browse publicly published content.
        </p>
      </div>

      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3, 4].map(i => <SkeletonBase key={i} height="120px" />)}
        </div>
      )}

      {!isLoading && allItems.length === 0 && (
        <EmptyStateBase
          icon="search"
          title="Nothing published yet"
          description="Public clue sets and categories will appear here once published."
          size="md"
        />
      )}

      {!isLoading && allItems.length > 0 && (
        <DataTableBase
          columns={[
            { field: "title", label: "Title" },
            { field: "kind", label: "Type", format: "badge", badgeColors: { "clue-sets": "info", categories: "success", clues: "secondary", generators: "warning" } },
            { field: "ratingAverage", label: "Rating" },
            { field: "createdAt", label: "Published", format: "date" },
          ]}
          rows={(allItems as Record<string, unknown>[]).map(i => ({ ...i, title: (i.title as string) || "Untitled" }))}
          searchable
          searchPlaceholder="Search content…"
          hoverable
        />
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

function JeopardyApp() {
  const session = useGuestSession();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!session.ready && !session.error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        background: "var(--sn-color-background, #f9fafb)",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "var(--sn-color-primary, #2563eb)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
        }}>🎯</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "var(--sn-color-foreground, #111827)" }}>
            Jeopardy
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground, #6b7280)", marginTop: "0.25rem" }}>
            Connecting…
          </div>
        </div>
        <SkeletonBase width="200px" height="8px" />
      </div>
    );
  }

  if (session.error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--sn-color-background, #f9fafb)",
      }}>
        <AlertBase
          variant="destructive"
          title="Connection failed"
          description={`Could not connect to the Jeopardy API. ${session.error}`}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--sn-color-background, #f9fafb)",
      display: "flex",
      flexDirection: "column",
    }}>
      <AppHeader
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        displayName={session.displayName}
      />

      <div style={{ display: "flex", flex: 1 }}>
        <TokenEditorSidebar darkMode={darkMode} />

        <main style={{ flex: 1, padding: "1.5rem 2rem", maxWidth: "1200px" }}>
          <TabsBase
            variant="pills"
            defaultTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              {
                label: "Home",
                icon: "home",
                content: <HomeTab userId={session.userId} />,
              },
              {
                label: "Library",
                icon: "library",
                content: <LibraryTab />,
              },
              {
                label: "Matches",
                icon: "gamepad-2",
                content: <MatchesTab />,
              },
              {
                label: "Discovery",
                icon: "search",
                content: <DiscoveryTab />,
              },
            ]}
          />
        </main>
      </div>

      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={snapshotQueryClient}>
      <JotaiProvider store={jotaiStore}>
        <JeopardyApp />
      </JotaiProvider>
    </QueryClientProvider>
  );
}
