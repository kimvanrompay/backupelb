export const productionConfig = {
	environment: 'production',
	cpu: 1024,
	memoryLimitMiB: 2048,
	desiredCount: 3,
	domainName: 'api.eclaut.com',
	ecrRepoName: 'eclaut-backend-api-production',
};
