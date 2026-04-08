export interface ScaffoldConfig {
  projectName: string;
  packageName: string;
  dir: string;
  securityProfile: "hardened" | "prototype";
  layout: "minimal" | "top-nav" | "sidebar";
  theme: "default" | "dark" | "minimal" | "vibrant";
  authPages: boolean;
  mfaPages: boolean;
  passkeyPages: boolean;
  components: string[];
  webSocket: boolean;
  communityPages: boolean;
  sse: boolean;
  mailPlugin: boolean;
  gitInit: boolean;
}

export interface AdminScaffoldConfig {
  projectName: string;
  packageName: string;
  dir: string;
  webhookAdminPages: boolean;
  gitInit: boolean;
}
