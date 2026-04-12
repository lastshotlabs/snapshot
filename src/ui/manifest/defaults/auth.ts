import type { ManifestConfig, RouteConfig } from "../types";
import { defaultEnglishCatalog } from "./i18n-en";

export type DefaultAuthScreen =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "mfa"
  | "sso-callback";

function centeredLayout() {
  return [{ type: "centered", props: { maxWidth: "sm" } }];
}

function buildFetchCurrentUserActions(
  redirectTo: string,
  additionalActions: Array<Record<string, unknown>> = [],
): Array<Record<string, unknown>> {
  return [
    {
      type: "api",
      method: "GET",
      endpoint: "{auth.contract.endpoints.me}",
      onSuccess: [
        ...additionalActions,
        {
          type: "set-value",
          target: "global.user",
          value: "{result}",
        },
        {
          type: "navigate",
          to: redirectTo,
        },
      ],
    },
  ];
}

const defaultAuthRoutes: RouteConfig[] = [
  {
    id: "login",
    path: "/login",
    shell: false,
    layouts: centeredLayout(),
    guard: { authenticated: false, redirectTo: "{auth.redirects.afterLogin}" },
    title: "{i18n:auth.login.title}",
    content: [
      {
        type: "stack",
        gap: "lg",
        align: "stretch",
        maxWidth: "sm",
        children: [
          {
            type: "heading",
            text: "{auth.branding.title}",
            fallback: "{app.title}",
            level: 1,
            align: "center",
          },
          {
            type: "text",
            value: "{i18n:auth.login.description}",
            variant: "muted",
            align: "center",
          },
          {
            type: "oauth-buttons",
            visibleWhen: "defined(auth.providers)",
          },
          {
            type: "divider",
            label: "{i18n:common.or}",
            visibleWhen: "defined(auth.providers)",
          },
          {
            type: "auto-form",
            id: "login-form",
            submit: "{auth.contract.endpoints.login}",
            method: "POST",
            fields: [
              {
                name: "email",
                type: "email",
                label: "{i18n:auth.field.email.label}",
                placeholder: "{i18n:auth.field.email.placeholder}",
                required: true,
                autoComplete: "email",
              },
              {
                name: "password",
                type: "password",
                label: "{i18n:auth.field.password.label}",
                placeholder: "{i18n:auth.field.password.placeholder}",
                required: true,
                autoComplete: "current-password",
                inlineAction: {
                  label: "{i18n:auth.link.forgot_password}",
                  to: "/forgot-password",
                },
              },
            ],
            submitLabel: "{i18n:auth.action.sign_in}",
            submitLoadingLabel: "{i18n:auth.action.sign_in.loading}",
            on: {
              afterSubmit: "__default_auth_after_login",
            },
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "passkey-button",
            label: "{i18n:auth.label.passkey_button}",
            visibleWhen: "defined(auth.passkey)",
            onSuccess: [
              {
                type: "api",
                method: "GET",
                endpoint: "{auth.contract.endpoints.me}",
                onSuccess: [
                  {
                    type: "set-value",
                    target: "global.user",
                    value: "{result}",
                  },
                  {
                    type: "navigate",
                    to: "{auth.redirects.afterLogin}",
                  },
                ],
              },
            ],
          },
          {
            type: "link",
            to: "/register",
            text: "{i18n:auth.link.create_account}",
            align: "center",
          },
        ],
      },
    ],
  },
  {
    id: "register",
    path: "/register",
    shell: false,
    layouts: centeredLayout(),
    guard: { authenticated: false, redirectTo: "/" },
    title: "{i18n:auth.register.title}",
    content: [
      {
        type: "stack",
        gap: "lg",
        align: "stretch",
        maxWidth: "sm",
        children: [
          {
            type: "heading",
            text: "{auth.branding.title}",
            fallback: "{app.title}",
            level: 1,
            align: "center",
          },
          {
            type: "text",
            value: "{i18n:auth.register.description}",
            variant: "muted",
            align: "center",
          },
          {
            type: "oauth-buttons",
            visibleWhen: "defined(auth.providers)",
          },
          {
            type: "divider",
            label: "{i18n:common.or}",
            visibleWhen: "defined(auth.providers)",
          },
          {
            type: "auto-form",
            id: "register-form",
            submit: "{auth.contract.endpoints.register}",
            method: "POST",
            fields: [
              {
                name: "name",
                type: "text",
                label: "{i18n:auth.field.name.label}",
                placeholder: "{i18n:auth.field.name.placeholder}",
                autoComplete: "name",
              },
              {
                name: "email",
                type: "email",
                label: "{i18n:auth.field.email.label}",
                placeholder: "{i18n:auth.field.email.placeholder}",
                required: true,
                autoComplete: "email",
              },
              {
                name: "password",
                type: "password",
                label: "{i18n:auth.field.password.label}",
                placeholder: "{i18n:auth.field.password.placeholder.register}",
                required: true,
                autoComplete: "new-password",
              },
            ],
            submitLabel: "{i18n:auth.action.create_account}",
            submitLoadingLabel: "{i18n:auth.action.create_account.loading}",
            onSuccess: buildFetchCurrentUserActions(
              "{auth.redirects.afterRegister}",
            ),
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "link",
            to: "/login",
            text: "{i18n:auth.link.sign_in}",
            align: "center",
          },
        ],
      },
    ],
  },
  {
    id: "forgot-password",
    path: "/forgot-password",
    shell: false,
    layouts: centeredLayout(),
    guard: { authenticated: false, redirectTo: "/" },
    title: "{i18n:auth.forgot_password.title}",
    content: [
      {
        type: "stack",
        gap: "lg",
        align: "stretch",
        maxWidth: "sm",
        children: [
          {
            type: "heading",
            text: "{i18n:auth.forgot_password.title}",
            level: 1,
            align: "center",
          },
          {
            type: "text",
            value: "{i18n:auth.forgot_password.description}",
            variant: "muted",
            align: "center",
          },
          {
            type: "auto-form",
            id: "forgot-password-form",
            submit: "{auth.contract.endpoints.forgotPassword}",
            method: "POST",
            fields: [
              {
                name: "email",
                type: "email",
                label: "{i18n:auth.field.email.label}",
                placeholder: "{i18n:auth.field.email.placeholder}",
                required: true,
                autoComplete: "email",
              },
            ],
            submitLabel: "{i18n:auth.action.send_reset_link}",
            submitLoadingLabel: "{i18n:auth.action.send_reset_link.loading}",
            onSuccess: [
              {
                type: "toast",
                variant: "success",
                message: "{i18n:auth.message.forgot_password_sent}",
              },
            ],
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "link",
            to: "/login",
            text: "{i18n:auth.link.back_to_sign_in}",
            align: "center",
          },
        ],
      },
    ],
  },
  {
    id: "reset-password",
    path: "/reset-password",
    shell: false,
    layouts: centeredLayout(),
    title: "{i18n:auth.reset_password.title}",
    content: [
      {
        type: "stack",
        gap: "lg",
        align: "stretch",
        maxWidth: "sm",
        children: [
          {
            type: "heading",
            text: "{i18n:auth.reset_password.title}",
            level: 1,
            align: "center",
          },
          {
            type: "text",
            value: "{i18n:auth.reset_password.description}",
            variant: "muted",
            align: "center",
          },
          {
            type: "alert",
            variant: "warning",
            description: "{i18n:auth.error.reset_link_missing_token}",
            visibleWhen: "empty(route.query.token)",
          },
          {
            type: "auto-form",
            id: "reset-password-form",
            submit: "{auth.contract.endpoints.resetPassword}",
            method: "POST",
            visibleWhen: "defined(route.query.token)",
            fields: [
              {
                name: "token",
                type: "text",
                default: "{route.query.token}",
                visible: false,
              },
              {
                name: "password",
                type: "password",
                label: "{i18n:auth.field.password.label.reset}",
                placeholder: "{i18n:auth.field.password.placeholder.reset}",
                required: true,
                autoComplete: "new-password",
              },
            ],
            submitLabel: "{i18n:auth.action.reset_password}",
            submitLoadingLabel: "{i18n:auth.action.reset_password.loading}",
            onSuccess: [
              {
                type: "toast",
                variant: "success",
                message: "{i18n:auth.message.password_reset}",
              },
            ],
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "link",
            to: "/login",
            text: "{i18n:auth.link.back_to_sign_in}",
            align: "center",
          },
        ],
      },
    ],
  },
  {
    id: "verify-email",
    path: "/verify-email",
    shell: false,
    layouts: centeredLayout(),
    title: "{i18n:auth.verify_email.title}",
    content: [
      {
        type: "stack",
        gap: "lg",
        align: "stretch",
        maxWidth: "sm",
        children: [
          {
            type: "heading",
            text: "{i18n:auth.verify_email.title}",
            level: 1,
            align: "center",
          },
          {
            type: "text",
            value: "{i18n:auth.verify_email.description}",
            variant: "muted",
            align: "center",
          },
          {
            type: "auto-form",
            id: "verify-email-auto",
            submit: "{auth.contract.endpoints.verifyEmail}",
            method: "POST",
            autoSubmit: true,
            autoSubmitWhen: "defined(route.query.token)",
            fields: [
              {
                name: "token",
                type: "text",
                default: "{route.query.token}",
                visible: false,
              },
            ],
            onSuccess: [
              {
                type: "toast",
                variant: "success",
                message: "{i18n:auth.message.email_verified}",
              },
            ],
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "auto-form",
            id: "resend-verification-form",
            submit: "{auth.contract.endpoints.resendVerification}",
            method: "POST",
            visibleWhen: "empty(route.query.token)",
            fields: [
              {
                name: "email",
                type: "email",
                label: "{i18n:auth.field.email.label}",
                placeholder: "{i18n:auth.field.email.placeholder}",
                required: true,
                autoComplete: "email",
              },
            ],
            submitLabel: "{i18n:auth.action.resend_verification}",
            submitLoadingLabel:
              "{i18n:auth.action.resend_verification.loading}",
            onSuccess: [
              {
                type: "toast",
                variant: "success",
                message: "{i18n:auth.message.verification_sent}",
              },
            ],
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "link",
            to: "/login",
            text: "{i18n:auth.link.continue_to_sign_in}",
            align: "center",
          },
        ],
      },
    ],
  },
  {
    id: "mfa",
    path: "/mfa",
    shell: false,
    layouts: centeredLayout(),
    title: "{i18n:auth.mfa.title}",
    content: [
      {
        type: "stack",
        gap: "lg",
        align: "stretch",
        maxWidth: "sm",
        children: [
          {
            type: "heading",
            text: "{i18n:auth.mfa.title}",
            level: 1,
            align: "center",
          },
          {
            type: "text",
            value: "{i18n:auth.mfa.description}",
            variant: "muted",
            align: "center",
          },
          {
            type: "alert",
            variant: "warning",
            description: "{i18n:auth.error.no_active_challenge}",
            visibleWhen: "empty(global.pendingMfaChallenge)",
          },
          {
            type: "auto-form",
            id: "mfa-form",
            submit: "{auth.contract.endpoints.mfaVerify}",
            method: "POST",
            visibleWhen: "defined(global.pendingMfaChallenge)",
            fields: [
              {
                name: "mfaToken",
                type: "text",
                default: "{global.pendingMfaChallenge.mfaToken}",
                visible: false,
              },
              {
                name: "code",
                type: "text",
                label: "{i18n:auth.field.code.label}",
                placeholder: "{i18n:auth.field.code.placeholder}",
                required: true,
                autoComplete: "one-time-code",
              },
              {
                name: "method",
                type: "select",
                label: "{i18n:auth.field.method.label}",
                visibleWhen:
                  "length(global.pendingMfaChallenge.mfaMethods) > 1",
                options: { from: "global.pendingMfaChallenge.mfaMethods" },
                default: "{global.pendingMfaChallenge.mfaMethods.0}",
              },
            ],
            submitLabel: "{i18n:auth.action.verify}",
            submitLoadingLabel: "{i18n:auth.action.verify.loading}",
            onSuccess: buildFetchCurrentUserActions(
              "{auth.redirects.afterMfa}",
              [
                {
                  type: "set-value",
                  target: "global.pendingMfaChallenge",
                  value: null,
                },
              ],
            ),
            onError: [
              {
                type: "toast",
                variant: "error",
                message: "{error.message}",
              },
            ],
          },
          {
            type: "link",
            to: "/login",
            text: "{i18n:auth.link.back_to_sign_in}",
            align: "center",
          },
        ],
      },
    ],
  },
  {
    id: "sso-callback",
    path: "/auth/callback",
    shell: false,
    layouts: centeredLayout(),
    title: "{i18n:auth.sso_callback.title}",
    enter: {
      type: "api",
      method: "POST",
      endpoint: "{auth.contract.endpoints.oauthCallback}",
      body: {
        code: "{route.query.code}",
        state: "{route.query.state}",
      },
      onSuccess: [
        {
          type: "api",
          method: "GET",
          endpoint: "{auth.contract.endpoints.me}",
          onSuccess: [
            {
              type: "set-value",
              target: "global.user",
              value: "{result}",
            },
            {
              type: "navigate",
              to: "{auth.redirects.afterLogin}",
              replace: true,
            },
          ],
        },
      ],
      onError: [
        {
          type: "toast",
          variant: "error",
          message: "{error.message}",
        },
        { type: "navigate", to: "/login", replace: true },
      ],
    },
    content: [
      {
        type: "stack",
        gap: "md",
        align: "center",
        maxWidth: "sm",
        children: [
          { type: "spinner", size: "lg" },
          {
            type: "text",
            value: "{i18n:auth.sso_callback.message}",
            variant: "muted",
            align: "center",
          },
        ],
      },
    ],
  },
];

const DEFAULT_SECTION_ORDER: Partial<Record<DefaultAuthScreen, string[]>> = {
  login: ["providers", "form", "passkey", "links"],
  register: ["providers", "form", "links"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getScreenOptions(
  manifest: ManifestConfig,
  screen: DefaultAuthScreen,
): Record<string, unknown> | undefined {
  const screenOptions = manifest.auth?.screenOptions;
  if (!screenOptions || !isRecord(screenOptions)) {
    return undefined;
  }

  const option = (screenOptions as Record<string, unknown>)[screen];
  return isRecord(option) ? option : undefined;
}

function getConfiguredProviderNames(
  manifest: ManifestConfig,
  options: Record<string, unknown> | undefined,
): string[] {
  const allProviders = Object.keys(manifest.auth?.providers ?? {});
  const allowed = Array.isArray(options?.providers)
    ? new Set(
        options.providers.filter(
          (value): value is string => typeof value === "string",
        ),
      )
    : null;

  return allProviders.filter((provider) =>
    allowed ? allowed.has(provider) : true,
  );
}

function resolveScreenPath(
  manifest: ManifestConfig,
  screen: DefaultAuthScreen,
): string {
  return (
    manifest.routes.find((route) => route.id === screen)?.path ??
    defaultAuthRoutes.find((route) => route.id === screen)?.path ??
    `/${screen}`
  );
}

function buildLinks(
  manifest: ManifestConfig,
  options: Record<string, unknown> | undefined,
  fallbackLinks: Array<{ text: string; screen: DefaultAuthScreen }>,
): Array<Record<string, unknown>> {
  const links = Array.isArray(options?.links) ? options.links : undefined;
  if (!links || links.length === 0) {
    return fallbackLinks.map((link) => ({
      type: "link",
      text: link.text,
      to: resolveScreenPath(manifest, link.screen),
      align: "center",
    }));
  }

  return links
    .filter((link): link is Record<string, unknown> => isRecord(link))
    .map((link) => ({
      type: "link",
      text:
        typeof link.label === "string" ? link.label : "{i18n:auth.link.sign_in}",
      to:
        typeof link.path === "string"
          ? link.path
          : resolveScreenPath(
              manifest,
              String(link.screen ?? "login") as DefaultAuthScreen,
            ),
      align: "center",
    }));
}

function patchAutoForm(
  component: Record<string, unknown>,
  options: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const fields = Array.isArray(component.fields) ? component.fields : [];
  const fieldOverrides =
    options?.fields && isRecord(options.fields) ? options.fields : undefined;
  const labels =
    options?.labels && isRecord(options.labels) ? options.labels : undefined;
  const successMessage =
    typeof options?.successMessage === "string"
      ? options.successMessage
      : undefined;

  const next: Record<string, unknown> = {
    ...component,
    submitLabel:
      typeof options?.submitLabel === "string"
        ? options.submitLabel
        : component.submitLabel,
    fields: fields.map((field) => {
      if (!isRecord(field)) {
        return field;
      }

      const override =
        fieldOverrides && isRecord(fieldOverrides[field.name as string])
          ? (fieldOverrides[field.name as string] as Record<string, unknown>)
          : undefined;

      return {
        ...field,
        label:
          typeof override?.label === "string"
            ? override.label
            : field.name === "method" && typeof labels?.method === "string"
              ? labels.method
              : field.label,
        placeholder:
          typeof override?.placeholder === "string"
            ? override.placeholder
            : field.placeholder,
      };
    }),
  };

  if (successMessage && Array.isArray(component.onSuccess)) {
    next.onSuccess = component.onSuccess.map((action) =>
      isRecord(action) &&
      action.type === "toast" &&
      action.variant === "success"
        ? { ...action, message: successMessage }
        : action,
    );
  }

  return next;
}

function applyScreenOptions(
  route: RouteConfig,
  manifest: ManifestConfig,
): RouteConfig {
  const screen = route.id as DefaultAuthScreen;
  const options = getScreenOptions(manifest, screen);
  if (!options) {
    return route;
  }

  const content = [...route.content];
  const root = content[0];
  if (!isRecord(root) || root.type !== "stack" || !Array.isArray(root.children)) {
    return route;
  }

  const children = [...root.children];
  const heading = isRecord(children[0]) ? { ...children[0] } : children[0];
  const description = isRecord(children[1]) ? { ...children[1] } : children[1];

  if (isRecord(heading) && typeof options.title === "string") {
    heading.text = options.title;
  }
  if (isRecord(description) && typeof options.description === "string") {
    description.value = options.description;
  }

  const fallbackLinks =
    screen === "login"
      ? [{ text: "{i18n:auth.link.create_account}", screen: "register" as const }]
      : screen === "register"
        ? [{ text: "{i18n:auth.link.sign_in}", screen: "login" as const }]
        : [{ text: "{i18n:auth.link.back_to_sign_in}", screen: "login" as const }];
  const linkComponents = buildLinks(manifest, options, fallbackLinks);
  const hasProviderSection = getConfiguredProviderNames(manifest, options).length > 0;
  const passkeyOption = options.passkey;
  const passkeyEnabled =
    passkeyOption === false
      ? false
      : isRecord(passkeyOption)
        ? passkeyOption.enabled !== false
        : true;

  if (screen === "login" || screen === "register") {
    const providers = isRecord(children[2]) ? { ...children[2] } : children[2];
    const divider = isRecord(children[3]) ? { ...children[3] } : children[3];
    const form = isRecord(children[4]) ? patchAutoForm(children[4], options) : children[4];
    const passkey = isRecord(children[5]) ? { ...children[5] } : children[5];
    if (isRecord(passkey) && options.labels && isRecord(options.labels)) {
      const passkeyButton = options.labels.passkeyButton;
      if (typeof passkeyButton === "string") {
        passkey.label = passkeyButton;
      }
    }

    const order = Array.isArray(options.sections)
      ? options.sections.filter(
          (value): value is string => typeof value === "string",
        )
      : DEFAULT_SECTION_ORDER[screen] ?? [];
    const orderedChildren: unknown[] = [heading, description];

    order.forEach((section, index) => {
      if (section === "providers" && hasProviderSection && providers) {
        orderedChildren.push(providers);
        const hasFollowingRenderableSection = order
          .slice(index + 1)
          .some(
            (nextSection) =>
              nextSection === "form" ||
              (nextSection === "passkey" && passkeyEnabled),
          );
        if (divider && hasFollowingRenderableSection) {
          orderedChildren.push(divider);
        }
      }

      if (section === "passkey" && passkeyEnabled && passkey) {
        orderedChildren.push(passkey);
      }

      if (section === "form" && form) {
        orderedChildren.push(form);
      }

      if (section === "links") {
        orderedChildren.push(...linkComponents);
      }
    });

    content[0] = {
      ...root,
      children: orderedChildren,
    };

    return {
      ...route,
      title:
        typeof options.title === "string" ? options.title : route.title,
      content,
    };
  }

  const patchedChildren = children.map((child) =>
    isRecord(child) && child.type === "auto-form"
      ? patchAutoForm(child, options)
      : child,
  );
  const withoutTrailingLinks = patchedChildren.filter(
    (child) => !isRecord(child) || child.type !== "link",
  );

  content[0] = {
    ...root,
    children: [...withoutTrailingLinks, ...linkComponents],
  };

  return {
    ...route,
    title: typeof options.title === "string" ? options.title : route.title,
    content,
  };
}

function resolveAuthReferences<T>(
  value: T,
  manifest: ManifestConfig,
): T {
  const loginPath = resolveScreenPath(manifest, "login");
  const registerPath = resolveScreenPath(manifest, "register");
  const forgotPasswordPath = resolveScreenPath(manifest, "forgot-password");
  const mfaPath = resolveScreenPath(manifest, "mfa");
  const afterLogin = manifest.auth?.redirects?.afterLogin ?? manifest.app?.home ?? "/";
  const afterRegister =
    manifest.auth?.redirects?.afterRegister ?? afterLogin;
  const afterMfa = manifest.auth?.redirects?.afterMfa ?? afterLogin;

  const replace = (input: unknown, key?: string): unknown => {
    if (typeof input === "string") {
      if (input === "{auth.redirects.afterLogin}") {
        return afterLogin;
      }
      if (input === "{auth.redirects.afterRegister}") {
        return afterRegister;
      }
      if (input === "{auth.redirects.afterMfa}") {
        return afterMfa;
      }
      if (key === "to" || key === "redirectTo") {
        if (input === "/login") {
          return loginPath;
        }
        if (input === "/register") {
          return registerPath;
        }
        if (input === "/forgot-password") {
          return forgotPasswordPath;
        }
        if (input === "/mfa") {
          return mfaPath;
        }
      }
      return input;
    }

    if (Array.isArray(input)) {
      return input.map((item) => replace(item));
    }

    if (isRecord(input)) {
      return Object.fromEntries(
        Object.entries(input).map(([nestedKey, nestedValue]) => [
          nestedKey,
          replace(nestedValue, nestedKey),
        ]),
      );
    }

    return input;
  };

  return replace(value) as T;
}

export function normalizeAuthScreens(
  screens:
    | NonNullable<ManifestConfig["auth"]>["screens"]
    | undefined,
): Record<DefaultAuthScreen, "default" | false> {
  const base = {
    login: false,
    register: false,
    "forgot-password": false,
    "reset-password": false,
    "verify-email": false,
    mfa: false,
    "sso-callback": false,
  } as Record<DefaultAuthScreen, "default" | false>;

  if (!screens) {
    return base;
  }

  if (Array.isArray(screens)) {
    for (const screen of screens) {
      if (screen in base) {
        base[screen as DefaultAuthScreen] = "default";
      }
    }
    return base;
  }

  return {
    ...base,
    ...(screens as Partial<Record<DefaultAuthScreen, "default" | false>>),
  };
}

export function buildDefaultAuthFragment(
  manifest: ManifestConfig,
): Pick<ManifestConfig, "routes" | "i18n" | "workflows"> {
  const screens = normalizeAuthScreens(manifest.auth?.screens);
  const workflows: NonNullable<ManifestConfig["workflows"]> = {
    __default_auth_after_login: [
      {
        type: "if" as const,
        condition: {
          left: { from: "result.mfaRequired" },
          operator: "truthy" as const,
        },
        then: [
          {
            type: "set-value" as const,
            target: "global.pendingMfaChallenge",
            value: {
              mfaToken: "{result.mfaToken}",
              mfaMethods: "{result.mfaMethods}",
            },
          },
          {
            type: "navigate" as const,
            to: "/mfa",
          },
        ],
        else: [
          {
            type: "capture" as const,
            as: "auth.me",
            action: {
              type: "api" as const,
              method: "GET" as const,
              endpoint: "{auth.contract.endpoints.me}",
            },
          },
          {
            type: "set-value" as const,
            target: "global.user",
            value: "{auth.me}",
          },
          {
            type: "if" as const,
            condition: {
              left: { from: "route.query.redirect" },
              operator: "exists" as const,
            },
            then: [
              {
                type: "navigate" as const,
                to: "{route.query.redirect}",
                replace: true,
              },
            ],
            else: [
              {
                type: "navigate" as const,
                to: "{auth.redirects.afterLogin}",
                replace: true,
              },
            ],
          },
        ],
      },
    ],
  };

  return {
    routes: defaultAuthRoutes
      .filter((route) => screens[route.id as DefaultAuthScreen] === "default")
      .map((route) => resolveAuthReferences(applyScreenOptions(route, manifest), manifest)),
    i18n: {
      default: "en",
      locales: ["en"],
      strings: {
        en: defaultEnglishCatalog,
      },
    },
    workflows: resolveAuthReferences(workflows, manifest),
  };
}
