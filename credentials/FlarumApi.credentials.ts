import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FlarumApi implements ICredentialType {
	name = 'flarumApi';
	displayName = 'Flarum API';
	documentationUrl = 'https://docs.flarum.org/rest-api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://forum.example.com',
			description: 'The root URL of your Flarum forum (no trailing slash)',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The token value from your api_keys table (or an extension-generated key)',
			required: true,
		},
		{
			displayName: 'User ID (Optional)',
			name: 'userId',
			type: 'string',
			default: '',
			description: 'Only needed if using a master key and you want to act as a specific user. Leave empty otherwise.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization:
					'=Token {{$credentials.apiToken}}{{$credentials.userId ? ";userId=" + $credentials.userId : ""}}',
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api',
			method: 'GET',
		},
	};
}
