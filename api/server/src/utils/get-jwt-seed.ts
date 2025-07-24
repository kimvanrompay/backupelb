import {getAwsSecret} from '@lib/utils/aws-secret-manager';

let secret: {seed: string} | undefined;

/**
 * Retrieves the JWT secret from AWS Secrets Manager.
 * The secret is cached after the first retrieval to avoid multiple calls.
 */
const getJwtSecret = async () => {
	if (secret) {
		return secret;
	}

	console.log('Fetching JWT secret from AWS Secrets Manager...');
	secret = await getAwsSecret<{seed: string}>('prd/jwt-seed'); // TODO: use a different secret for dev and prod

	return secret;
};

export {getJwtSecret};
