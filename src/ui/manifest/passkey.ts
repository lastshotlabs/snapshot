function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64Url(value: ArrayBuffer | Uint8Array | null): string | null {
  if (!value) {
    return null;
  }

  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeRequestOptions(
  options: unknown,
): PublicKeyCredentialRequestOptions {
  const value = (options ?? {}) as Record<string, unknown>;
  const allowCredentials = Array.isArray(value.allowCredentials)
    ? value.allowCredentials.map((credential) => {
        const item = credential as Record<string, unknown>;
        return {
          ...item,
          id:
            typeof item.id === "string" ? decodeBase64Url(item.id) : item.id,
        } as PublicKeyCredentialDescriptor;
      })
    : undefined;

  return {
    ...value,
    challenge:
      typeof value.challenge === "string"
        ? decodeBase64Url(value.challenge)
        : (value.challenge as BufferSource),
    allowCredentials,
  } as PublicKeyCredentialRequestOptions;
}

export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials?.get
  );
}

export async function startPasskeyAuthentication(
  options: unknown,
): Promise<Record<string, unknown>> {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported in this browser.");
  }

  const credential = (await navigator.credentials.get({
    publicKey: normalizeRequestOptions(options),
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey authentication did not return a credential.");
  }

  const response =
    credential.response as AuthenticatorAssertionResponse | null;

  if (!response) {
    throw new Error("Passkey authentication returned an invalid response.");
  }

  return {
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults:
      typeof credential.getClientExtensionResults === "function"
        ? credential.getClientExtensionResults()
        : {},
    response: {
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      authenticatorData: encodeBase64Url(response.authenticatorData),
      signature: encodeBase64Url(response.signature),
      userHandle: encodeBase64Url(response.userHandle),
    },
  };
}
