import { useMemo, useState } from "react";
import {
  AlertBase,
  BadgeBase,
  ButtonBase,
  CardBase,
  ColumnBase,
  DataTableBase,
  EmptyStateBase,
  GridBase,
  InputField,
  RowBase,
  StatCardBase,
  TabsBase,
} from "@lastshotlabs/snapshot/ui";

type Page = "overview" | "data" | "forms" | "feedback";

const PAGES: Array<{
  key: Page;
  label: string;
  description: string;
}> = [
  {
    key: "overview",
    label: "Overview",
    description: "Cards, badges, layout, and actions composed with plain props.",
  },
  {
    key: "data",
    label: "Data",
    description: "Tables and stats wired to local fixture data.",
  },
  {
    key: "forms",
    label: "Forms",
    description: "Controlled inputs and submit actions owned by React state.",
  },
  {
    key: "feedback",
    label: "Feedback",
    description: "Empty, loading, and alert states for product flows.",
  },
];

const rows = [
  {
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "Admin",
    status: "active",
  },
  {
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "Owner",
    status: "active",
  },
  {
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Member",
    status: "pending",
  },
];

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="showcase__section">
      <div className="showcase__section-header">
        <h3>{title}</h3>
        <span className="showcase__section-tag">Demo</span>
      </div>
      <div className="showcase__section-body">{children}</div>
    </div>
  );
}

function OverviewPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="App Header">
        <CardBase
          title="Snapshot UI"
          subtitle="Code-first React components"
          slots={{
            root: {
              style: {
                maxWidth: "44rem",
              },
            },
          }}
        >
          <ColumnBase gap="md">
            <p>
              Compose Snapshot UI with normal props, React state, and your own
              data loading.
            </p>
            <RowBase gap="sm" wrap>
              <BadgeBase text="Code-first" color="primary" variant="soft" />
              <BadgeBase text="Standalone" color="success" variant="soft" />
              <BadgeBase text="Typed props" color="info" variant="soft" />
            </RowBase>
            <RowBase gap="sm" wrap>
              <ButtonBase label="Primary action" icon="check" />
              <ButtonBase label="Secondary" variant="outline" />
            </RowBase>
          </ColumnBase>
        </CardBase>
      </ShowcaseSection>

      <ShowcaseSection title="Tabs">
        <TabsBase
          variant="pills"
          tabs={[
            {
              label: "Profile",
              content: <p>Profile content rendered as React children.</p>,
            },
            {
              label: "Billing",
              content: <p>Billing content can fetch, mutate, or render freely.</p>,
            },
            {
              label: "Security",
              content: <p>Security content uses the same component surface.</p>,
            },
          ]}
        />
      </ShowcaseSection>
    </div>
  );
}

function DataPage() {
  const columns = useMemo(
    () => [
      { field: "name", label: "Name", sortable: true },
      { field: "email", label: "Email" },
      {
        field: "role",
        label: "Role",
        format: "badge" as const,
        badgeColors: {
          Admin: "blue",
          Owner: "green",
          Member: "gray",
        },
      },
      {
        field: "status",
        label: "Status",
        format: "badge" as const,
        badgeColors: {
          active: "green",
          pending: "yellow",
        },
      },
    ],
    [],
  );

  return (
    <div className="showcase">
      <ShowcaseSection title="Stats">
        <GridBase columns="repeat(auto-fit, minmax(12rem, 1fr))" gap="md">
          <StatCardBase
            label="Revenue"
            value="$48.2K"
            icon="dollar-sign"
            trend={{
              direction: "up",
              value: "+12%",
              percentage: 12,
              sentiment: "positive",
            }}
          />
          <StatCardBase
            label="Active users"
            value="12,480"
            icon="users"
            trend={{
              direction: "up",
              value: "+4.8%",
              percentage: 4.8,
              sentiment: "positive",
            }}
          />
          <StatCardBase label="Queue" value="37" icon="inbox" />
        </GridBase>
      </ShowcaseSection>

      <ShowcaseSection title="Data Table">
        <DataTableBase
          columns={columns}
          rows={rows}
          searchable
          hoverable
          striped
          emptyMessage="No users found"
        />
      </ShowcaseSection>
    </div>
  );
}

function FormsPage() {
  const [email, setEmail] = useState("ada@example.com");
  const [name, setName] = useState("Ada Lovelace");
  const [saved, setSaved] = useState(false);

  return (
    <div className="showcase">
      <ShowcaseSection title="Controlled Form">
        <CardBase title="Profile">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
          >
            <ColumnBase gap="md">
              <InputField
                label="Name"
                value={name}
                onChange={(value) => {
                  setName(value);
                  setSaved(false);
                }}
              />
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  setSaved(false);
                }}
              />
              {saved ? (
                <AlertBase severity="success">Profile saved.</AlertBase>
              ) : null}
              <ButtonBase label="Save profile" type="submit" />
            </ColumnBase>
          </form>
        </CardBase>
      </ShowcaseSection>
    </div>
  );
}

function FeedbackPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="Alerts">
        <ColumnBase gap="sm">
          <AlertBase severity="success">Deployment finished.</AlertBase>
          <AlertBase severity="warning">Usage is near the plan limit.</AlertBase>
          <AlertBase severity="error">Payment method requires attention.</AlertBase>
        </ColumnBase>
      </ShowcaseSection>

      <ShowcaseSection title="Empty State">
        <EmptyStateBase
          title="No projects yet"
          description="Create a project to start collecting activity."
        />
      </ShowcaseSection>
    </div>
  );
}

export function ComponentShowcase() {
  const [page, setPage] = useState<Page>("overview");
  const currentPage = PAGES.find((item) => item.key === page) ?? PAGES[0]!;

  return (
    <>
      <div className="page-nav">
        <div className="page-nav__main">
          <select
            className="page-nav__select"
            value={page}
            onChange={(event) => setPage(event.target.value as Page)}
            aria-label="Select playground section"
          >
            {PAGES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <div className="page-nav__info">
            <h2 className="page-nav__title">{currentPage.label}</h2>
            <p className="page-nav__desc">{currentPage.description}</p>
          </div>
        </div>
        <dl className="page-nav__stats">
          <div>
            <dt>Demos</dt>
            <dd>{PAGES.length}</dd>
          </div>
        </dl>
      </div>

      {page === "overview" ? <OverviewPage /> : null}
      {page === "data" ? <DataPage /> : null}
      {page === "forms" ? <FormsPage /> : null}
      {page === "feedback" ? <FeedbackPage /> : null}
    </>
  );
}
