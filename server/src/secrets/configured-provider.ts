import { SECRET_PROVIDERS, type SecretProvider } from "@jasminiaai/shared";

export function getConfiguredSecretProvider(): SecretProvider {
  const configuredProvider = process.env.JASMINIA_SECRETS_PROVIDER;
  return configuredProvider && SECRET_PROVIDERS.includes(configuredProvider as SecretProvider)
    ? configuredProvider as SecretProvider
    : "local_encrypted";
}
