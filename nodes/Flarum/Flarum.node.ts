import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class Flarum implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Flarum',
		name: 'flarum',
		icon: 'file:flarum.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with a Flarum forum via its JSON:API',
		defaults: { name: 'Flarum' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'flarumApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Custom', value: 'custom' },
					{ name: 'Discussion', value: 'discussion' },
					{ name: 'Post', value: 'post' },
					{ name: 'Tag', value: 'tag' },
					{ name: 'User', value: 'user' },
				],
				default: 'discussion',
			},

			// ---------- Discussion ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['discussion'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a discussion' },
					{ name: 'Delete', value: 'delete', action: 'Delete a discussion' },
					{ name: 'Get', value: 'get', action: 'Get a discussion' },
					{ name: 'List', value: 'list', action: 'List discussions' },
					{ name: 'Update', value: 'update', action: 'Update a discussion' },
				],
				default: 'list',
			},
			// ---------- Post ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['post'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a post reply' },
					{ name: 'Delete', value: 'delete', action: 'Delete a post' },
					{ name: 'Get', value: 'get', action: 'Get a post' },
					{ name: 'List', value: 'list', action: 'List posts' },
					{ name: 'Update', value: 'update', action: 'Update a post' },
				],
				default: 'list',
			},
			// ---------- User ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['user'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get a user' },
					{ name: 'List', value: 'list', action: 'List users' },
				],
				default: 'list',
			},
			// ---------- Tag ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['tag'] } },
				options: [{ name: 'List', value: 'list', action: 'List tags' }],
				default: 'list',
			},
			// ---------- Custom ----------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['custom'] } },
				options: [{ name: 'Request', value: 'request', action: 'Make a custom request' }],
				default: 'request',
			},

			// ===== Shared: ID field for get/update/delete =====
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['discussion', 'post', 'user'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},

			// ===== Discussion: Create =====
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['discussion'], operation: ['create'] } },
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'Body of the first post (Markdown/BBCode depending on forum formatter)',
				displayOptions: { show: { resource: ['discussion'], operation: ['create'] } },
			},

			// ===== Discussion: Update =====
			{
				displayName: 'New Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['discussion'], operation: ['update'] } },
			},

			// ===== Post: Create =====
			{
				displayName: 'Discussion ID',
				name: 'discussionId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID of the discussion to reply to',
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
			},

			// ===== Post: Update =====
			{
				displayName: 'New Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				displayOptions: { show: { resource: ['post'], operation: ['update'] } },
			},

			// ===== List operations: filter/sort/page =====
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['list'] } },
				options: [
					{
						displayName: 'Filter (Q)',
						name: 'filterQ',
						type: 'string',
						default: '',
						description: 'Search query, e.g. Flarum full-text search syntax',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'string',
						default: '',
						placeholder: '-createdAt',
					},
					{
						displayName: 'Page Limit',
						name: 'pageLimit',
						type: 'number',
						default: 20,
					},
					{
						displayName: 'Page Offset',
						name: 'pageOffset',
						type: 'number',
						default: 0,
					},
				],
			},

			// ===== Custom =====
			{
				displayName: 'Method',
				name: 'customMethod',
				type: 'options',
				options: [
					{ name: 'GET', value: 'GET' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PATCH', value: 'PATCH' },
					{ name: 'DELETE', value: 'DELETE' },
				],
				default: 'GET',
				displayOptions: { show: { resource: ['custom'] } },
			},
			{
				displayName: 'Path',
				name: 'customPath',
				type: 'string',
				default: '/api/',
				placeholder: '/api/discussions/5/vote',
				description: 'Path relative to the forum base URL',
				displayOptions: { show: { resource: ['custom'] } },
			},
			{
				displayName: 'Body (JSON)',
				name: 'customBody',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: { resource: ['custom'], customMethod: ['POST', 'PATCH'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('flarumApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
				let path = '';
				let body: IDataObject | undefined;
				const qs: IDataObject = {};

				const applyListParams = () => {
					const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
					if (additional.filterQ) qs['filter[q]'] = additional.filterQ;
					if (additional.sort) qs.sort = additional.sort;
					if (additional.pageLimit !== undefined) qs['page[limit]'] = additional.pageLimit;
					if (additional.pageOffset !== undefined) qs['page[offset]'] = additional.pageOffset;
				};

				if (resource === 'discussion') {
					if (operation === 'list') {
						method = 'GET';
						path = '/api/discussions';
						applyListParams();
					} else if (operation === 'get') {
						method = 'GET';
						path = `/api/discussions/${this.getNodeParameter('id', i)}`;
					} else if (operation === 'create') {
						method = 'POST';
						path = '/api/discussions';
						body = {
							data: {
								type: 'discussions',
								attributes: {
									title: this.getNodeParameter('title', i),
									content: this.getNodeParameter('content', i),
								},
							},
						};
					} else if (operation === 'update') {
						method = 'PATCH';
						const id = this.getNodeParameter('id', i);
						path = `/api/discussions/${id}`;
						const title = this.getNodeParameter('title', i, '') as string;
						body = {
							data: {
								type: 'discussions',
								id,
								attributes: title ? { title } : {},
							},
						};
					} else if (operation === 'delete') {
						method = 'DELETE';
						path = `/api/discussions/${this.getNodeParameter('id', i)}`;
					}
				} else if (resource === 'post') {
					if (operation === 'list') {
						method = 'GET';
						path = '/api/posts';
						applyListParams();
					} else if (operation === 'get') {
						method = 'GET';
						path = `/api/posts/${this.getNodeParameter('id', i)}`;
					} else if (operation === 'create') {
						method = 'POST';
						path = '/api/posts';
						body = {
							data: {
								type: 'posts',
								attributes: { content: this.getNodeParameter('content', i) },
								relationships: {
									discussion: {
										data: {
											type: 'discussions',
											id: this.getNodeParameter('discussionId', i),
										},
									},
								},
							},
						};
					} else if (operation === 'update') {
						method = 'PATCH';
						const id = this.getNodeParameter('id', i);
						path = `/api/posts/${id}`;
						body = {
							data: {
								type: 'posts',
								id,
								attributes: { content: this.getNodeParameter('content', i) },
							},
						};
					} else if (operation === 'delete') {
						method = 'DELETE';
						path = `/api/posts/${this.getNodeParameter('id', i)}`;
					}
				} else if (resource === 'user') {
					if (operation === 'list') {
						method = 'GET';
						path = '/api/users';
						applyListParams();
					} else if (operation === 'get') {
						method = 'GET';
						path = `/api/users/${this.getNodeParameter('id', i)}`;
					}
				} else if (resource === 'tag') {
					method = 'GET';
					path = '/api/tags';
				} else if (resource === 'custom') {
					method = this.getNodeParameter('customMethod', i) as 'GET' | 'POST' | 'PATCH' | 'DELETE';
					path = this.getNodeParameter('customPath', i) as string;
					if ((method as string) === 'POST' || (method as string) === 'PATCH') {
						body = this.getNodeParameter('customBody', i) as IDataObject;
					}
				}

				const options: IHttpRequestOptions = {
					method,
					url: `${baseUrl}${path}`,
					qs,
					body,
					json: true,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'flarumApi',
					options,
				);

				if (Array.isArray(response?.data)) {
					for (const entry of response.data) {
						returnData.push({ json: entry as IDataObject });
					}
				} else {
					returnData.push({ json: (response ?? {}) as IDataObject });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
