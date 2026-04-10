import type {
  EntityDashboardPageDeclaration,
  EntityDetailPageDeclaration,
  EntityFormPageDeclaration,
  EntityListPageDeclaration,
  EntityMeta,
  NavigationConfig,
  PageLoaderResult,
  ResolvedPageDeclaration,
} from "../bunshot-types";

export const postEntityMeta: EntityMeta = {
  name: "Post",
  fields: {
    id: {
      name: "id",
      type: "string",
      optional: false,
      primary: true,
      immutable: true,
    },
    title: {
      name: "title",
      type: "string",
      optional: false,
      primary: false,
      immutable: false,
    },
    slug: {
      name: "slug",
      type: "string",
      optional: false,
      primary: false,
      immutable: false,
    },
    body: {
      name: "body",
      type: "string",
      optional: false,
      primary: false,
      immutable: false,
    },
    status: {
      name: "status",
      type: "enum",
      optional: false,
      primary: false,
      immutable: false,
      enumValues: ["draft", "published", "archived"],
    },
    viewCount: {
      name: "viewCount",
      type: "integer",
      optional: true,
      primary: false,
      immutable: false,
    },
    tags: {
      name: "tags",
      type: "string[]",
      optional: true,
      primary: false,
      immutable: false,
    },
    metadata: {
      name: "metadata",
      type: "json",
      optional: true,
      primary: false,
      immutable: false,
    },
    featured: {
      name: "featured",
      type: "boolean",
      optional: false,
      primary: false,
      immutable: false,
    },
    createdAt: {
      name: "createdAt",
      type: "date",
      optional: false,
      primary: false,
      immutable: true,
    },
  },
};

export const commentEntityMeta: EntityMeta = {
  name: "Comment",
  fields: {
    id: {
      name: "id",
      type: "string",
      optional: false,
      primary: true,
      immutable: true,
    },
    postId: {
      name: "postId",
      type: "string",
      optional: false,
      primary: false,
      immutable: false,
    },
    body: {
      name: "body",
      type: "string",
      optional: false,
      primary: false,
      immutable: false,
    },
    status: {
      name: "status",
      type: "enum",
      optional: false,
      primary: false,
      immutable: false,
      enumValues: ["pending", "approved"],
    },
  },
};

export const samplePosts = [
  {
    id: "1",
    title: "First Post",
    slug: "first-post",
    body: "Content...",
    status: "published",
    viewCount: 42,
    tags: ["intro"],
    metadata: { hero: true },
    featured: true,
    createdAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Second Post",
    slug: "second-post",
    body: "More...",
    status: "draft",
    viewCount: 0,
    tags: [],
    metadata: { hero: false },
    featured: false,
    createdAt: "2026-04-02T00:00:00Z",
  },
] as const;

export const sampleComments = [
  { id: "c1", postId: "1", body: "Nice post", status: "approved" },
];

export const navigationFixture: NavigationConfig = {
  shell: "sidebar",
  title: "Control Center",
  items: [
    { label: "Posts", path: "/posts", icon: "file-text" },
    { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  ],
  userMenu: [{ label: "Profile", path: "/profile", icon: "user" }],
};

function buildResolvedDeclaration<T extends object>(
  key: string,
  declaration: T,
): ResolvedPageDeclaration {
  return {
    key,
    declaration,
    entityConfig: null,
    pattern: /^$/,
    paramNames: [],
  } as ResolvedPageDeclaration;
}

export function buildListResult(
  overrides: Partial<PageLoaderResult> = {},
): PageLoaderResult {
  const declaration: EntityListPageDeclaration = {
    type: "entity-list",
    path: "/posts",
    title: "Posts",
    entity: "Post",
    fields: ["title", "status", "createdAt", "metadata"],
    searchable: true,
    pageSize: 20,
    filters: [{ field: "status", label: "Status" }],
    actions: { create: "/posts/new", bulkDelete: true },
    rowClick: "/posts/{id}",
  };

  return {
    declaration: buildResolvedDeclaration("posts-list", declaration),
    data: {
      type: "list",
      items: samplePosts,
      total: samplePosts.length,
      page: 1,
      pageSize: 20,
    },
    entityMeta: { Post: postEntityMeta },
    meta: { title: "Posts" },
    navigation: navigationFixture,
    tags: ["entity:Post"],
    ...overrides,
  };
}

export function buildDetailResult(
  overrides: Partial<PageLoaderResult> = {},
): PageLoaderResult {
  const declaration: EntityDetailPageDeclaration = {
    type: "entity-detail",
    path: "/posts/[id]",
    title: { field: "title" },
    entity: "Post",
    sections: [
      { label: "Summary", fields: ["status", "featured", "createdAt"] },
      { label: "Content", fields: ["body", "tags", "metadata"] },
    ],
    related: [
      {
        entity: "Comment",
        label: "Comments",
        foreignKey: "postId",
        fields: ["body", "status"],
        limit: 5,
      },
    ],
    actions: { back: "/posts", edit: "/posts/{id}/edit", delete: true },
  };

  return {
    declaration: buildResolvedDeclaration("posts-detail", declaration),
    data: {
      type: "detail",
      item: samplePosts[0],
    },
    entityMeta: {
      Post: postEntityMeta,
      Comment: commentEntityMeta,
    },
    meta: { title: "First Post" },
    ...overrides,
  };
}

export function buildFormCreateResult(
  overrides: Partial<PageLoaderResult> = {},
): PageLoaderResult {
  const declaration: EntityFormPageDeclaration = {
    type: "entity-form",
    path: "/posts/new",
    title: "New Post",
    entity: "Post",
    operation: "create",
    fields: ["title", "slug", "status", "metadata"],
    fieldConfig: {
      title: { placeholder: "Enter a title" },
      metadata: { helpText: "JSON metadata" },
    },
    redirect: { on: "success", to: "/posts/{id}" },
    cancel: { to: "/posts" },
  };

  return {
    declaration: buildResolvedDeclaration("posts-create", declaration),
    data: {
      type: "form-create",
      defaults: { status: "draft" },
    },
    entityMeta: { Post: postEntityMeta },
    meta: { title: "New Post" },
    ...overrides,
  };
}

export function buildFormEditResult(
  overrides: Partial<PageLoaderResult> = {},
): PageLoaderResult {
  const declaration: EntityFormPageDeclaration = {
    type: "entity-form",
    path: "/posts/[id]/edit",
    title: { template: "Edit {title}" },
    entity: "Post",
    operation: "update",
    fields: ["title", "slug", "status", "metadata", "createdAt"],
    cancel: { to: "/posts/{id}" },
  };

  return {
    declaration: buildResolvedDeclaration("posts-edit", declaration),
    data: {
      type: "form-edit",
      item: samplePosts[0],
    },
    entityMeta: { Post: postEntityMeta },
    meta: { title: "Edit First Post" },
    ...overrides,
  };
}

export function buildDashboardResult(
  overrides: Partial<PageLoaderResult> = {},
): PageLoaderResult {
  const declaration: EntityDashboardPageDeclaration = {
    type: "entity-dashboard",
    path: "/dashboard",
    title: "Dashboard",
    stats: [
      {
        entity: "Post",
        aggregate: "count",
        label: "Total Posts",
        icon: "file",
      },
      { entity: "Post", aggregate: "count", label: "Published", icon: "check" },
    ],
    chart: {
      entity: "Post",
      chartType: "bar",
      categoryField: "status",
      valueField: "viewCount",
      aggregate: "sum",
      label: "Views",
    },
    activity: {
      entity: "Post",
      fields: ["title", "status", "createdAt"],
      limit: 5,
      sortField: "createdAt",
    },
  };

  return {
    declaration: buildResolvedDeclaration("dashboard", declaration),
    data: {
      type: "dashboard",
      stats: [
        { label: "Total Posts", value: 2 },
        { label: "Published", value: 1 },
      ],
      chart: [
        { category: "published", value: 42 },
        { category: "draft", value: 0 },
      ],
      activity: samplePosts.map((post) => ({
        title: post.title,
        status: post.status,
        createdAt: post.createdAt,
      })),
    },
    entityMeta: { Post: postEntityMeta },
    meta: { title: "Dashboard" },
    ...overrides,
  };
}
