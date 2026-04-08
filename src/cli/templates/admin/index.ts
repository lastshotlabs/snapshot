export {
  generatePackageJson,
  generateTsConfig,
  generateViteConfig,
  generateEnvFile,
  generateSnapshotConfig,
  generateGitignore,
} from "./config";

export {
  generateCapabilitiesLib,
  generateSnapshotLib,
  generateRouterLib,
} from "./lib";

export {
  generateAdminLayoutComponent,
  generateCapabilityContextComponent,
  generateUsersPageComponent,
  generateUserDetailPageComponent,
  generateUserSessionsPageComponent,
  generateUserAuditLogPageComponent,
  generateAuditLogPageComponent,
  generateGroupsPageComponent,
  generateOrgsPageComponent,
  generateCapabilitiesPageComponent,
} from "./pages";

export {
  generateRootRoute,
  generateIndexRoute,
  generateAuthenticatedRoute,
  generateUsersRoute,
  generateUserDetailRoute,
  generateUserSessionsRoute,
  generateUserAuditLogRoute,
  generateAuditLogRoute,
  generateGroupsRoute,
  generateOrgsRoute,
  generateCapabilitiesRoute,
} from "./routes";

export {
  generateWebhooksPageComponent,
  generateWebhookDetailPageComponent,
  generateWebhooksRoute,
  generateWebhookDetailRoute,
} from "./webhooks";
