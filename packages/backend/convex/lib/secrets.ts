import {
  CreateSecretCommand,
  GetSecretValueCommand,
  type GetSecretValueCommandOutput,
  PutSecretValueCommand,
  ResourceExistsException,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export function createSecretsManagerClient(): SecretsManagerClient {
  console.log(
    process.env.AWS_REGION,
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY,
    "Creating Secrets Manager Client"
  );

  return new SecretsManagerClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function getSecretValue(
  secretName: string
): Promise<GetSecretValueCommandOutput> {
  const client = createSecretsManagerClient();
  const command = new GetSecretValueCommand({ SecretId: secretName });
  return client.send(command);
}

export async function upsertSecrets(
  secretName: string,
  secretValue: Record<string, unknown>
): Promise<void> {
  const client = createSecretsManagerClient();

  try {
    const createCommand = new CreateSecretCommand({
      Name: secretName,
      SecretString: JSON.stringify(secretValue),
    });
    console.log(secretName, secretValue);

    const a = await client.send(createCommand);
    console.log(a);
  } catch (error) {
    console.log(error);

    if (error instanceof ResourceExistsException) {
      await client.send(
        new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: JSON.stringify(secretValue),
        })
      );
    } else {
      throw error;
    }
  }
}

export function parseSecretString<T = Record<string, unknown>>(
  secret: GetSecretValueCommandOutput
): T | null {
  if (!secret.SecretString) return null;

  try {
    return JSON.parse(secret.SecretString) as T;
  } catch {
    return null;
  }
}
