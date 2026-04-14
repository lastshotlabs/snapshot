import type { PageConfig } from "../manifest/types";
import {
  withDefaultAuthFormSlots,
  withDefaultAuthOAuthButtonSlots,
} from "./auth-surfaces";
import type { AuthPageOptions } from "./types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildAuthForm(
  slug: string,
  options: AuthPageOptions,
): Record<string, unknown> {
  switch (options.screen) {
    case "register":
      return withDefaultAuthFormSlots({
        type: "form",
        id: `${slug}-form`,
        submit: "auth:register",
        method: "POST",
        fields: [
          { name: "email", type: "email", label: "Email", required: true },
          {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
          },
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirm Password",
            required: true,
          },
        ],
        submitLabel: "Create Account",
        onSuccess: {
          type: "navigate",
          to: options.redirects?.afterRegister ?? "/auth/verify-email",
        },
      });
    case "forgot-password":
      return withDefaultAuthFormSlots({
        type: "form",
        id: `${slug}-form`,
        submit: "auth:forgotPassword",
        method: "POST",
        fields: [
          { name: "email", type: "email", label: "Email", required: true },
        ],
        submitLabel: "Send Reset Link",
        onSuccess: {
          type: "toast",
          message: "Reset link sent. Check your email.",
          variant: "success",
        },
      });
    case "reset-password":
      return withDefaultAuthFormSlots({
        type: "form",
        id: `${slug}-form`,
        submit: "auth:resetPassword",
        method: "POST",
        fields: [
          {
            name: "password",
            type: "password",
            label: "New Password",
            required: true,
          },
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirm Password",
            required: true,
          },
        ],
        submitLabel: "Reset Password",
        onSuccess: {
          type: "navigate",
          to: options.redirects?.login ?? "/auth/login",
        },
      });
    case "verify-email":
      return {
        type: "button",
        label: "Resend Verification Email",
        variant: "outline",
        action: {
          type: "api",
          method: "POST",
          endpoint: "auth:resendVerification",
          onSuccess: {
            type: "toast",
            message: "Verification email sent.",
            variant: "success",
          },
        },
      };
    case "login":
    default:
      return withDefaultAuthFormSlots({
        type: "form",
        id: `${slug}-form`,
        submit: "auth:login",
        method: "POST",
        fields: [
          { name: "email", type: "email", label: "Email", required: true },
          {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
          },
        ],
        submitLabel: "Sign In",
        onSuccess: {
          type: "navigate",
          to: options.redirects?.afterLogin ?? "/",
        },
      });
  }
}

/**
 * Build a manifest page config for a common auth screen.
 */
export function authPage(options: AuthPageOptions): PageConfig {
  const slug = options.id ?? `auth-${slugify(options.screen)}`;
  const cardChildren: Record<string, unknown>[] = [];

  if (options.branding?.logo) {
    cardChildren.push({
      type: "image",
      src: options.branding.logo,
      alt: options.branding.appName ?? "Logo",
      width: 120,
    });
  }

  if (options.branding?.appName) {
    cardChildren.push({
      type: "heading",
      text: options.branding.appName,
      level: 2,
      align: "center",
    });
  }

  if (options.branding?.tagline) {
    cardChildren.push({
      type: "heading",
      text: options.branding.tagline,
      level: 6,
      align: "center",
    });
  }

  cardChildren.push(buildAuthForm(slug, options));

  if (options.oauthProviders?.length) {
    cardChildren.push(withDefaultAuthOAuthButtonSlots({
      type: "oauth-buttons",
      heading: "Continue with",
    }));
  }

  if (options.passkey) {
    cardChildren.push({
      type: "passkey-button",
      label: "Sign in with passkey",
    });
  }

  const content: Record<string, unknown>[] = [
    {
      type: "container",
      id: slug,
      maxWidth: "sm",
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--sn-spacing-lg, 1.5rem)",
        backgroundImage: options.branding?.background?.image
          ? `url(${options.branding.background.image})`
          : undefined,
        backgroundPosition: options.branding?.background?.position,
        backgroundColor: options.branding?.background?.color,
      },
      children: [
        {
          type: "card",
          id: `${slug}-card`,
          children: cardChildren,
        },
      ],
    },
  ];

  const titleByScreen: Record<AuthPageOptions["screen"], string> = {
    login: "Sign In",
    register: "Create Account",
    "forgot-password": "Forgot Password",
    "reset-password": "Reset Password",
    "verify-email": "Verify Email",
  };

  return {
    title: titleByScreen[options.screen],
    content: content as PageConfig["content"],
  };
}
