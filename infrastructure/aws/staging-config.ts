export const stagingConfig = {
	environment: 'staging',
	cpu: 256,
	memoryLimitMiB: 512,
	desiredCount: 1,
	domainName: 'staging.api.eclaut.com',
	ecrRepoName: 'eclaut-backend-api-staging',
};
