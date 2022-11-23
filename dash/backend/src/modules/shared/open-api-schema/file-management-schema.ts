export const UPLOAD_FILES_REQUEST_SCHEMA = {
    type: 'object',
    properties: {
        files: {
            type: 'array',
            items: {
                type: 'string',
                format: 'binary',
            }
        },
    },
};

export const UPLOAD_FILES_RESPONSE_SCHEMA = {
    type: 'object',
    required: [
        'success',
        'message',
        'data'
    ],
    properties: {
        success: {
            type: 'boolean',
            title: 'The success schema',
            description: 'An explanation about the purpose of this instance.',
            default: false,
            examples: [true]
        },
        message: {
            type: 'string',
            title: 'The message schema',
            description: 'An explanation about the purpose of this instance.',
            default: '',
            examples: ['']
        },
        data: {
            type: 'array',
            title: 'The data schema',
            description: 'An explanation about the purpose of this instance.',
            default: [],
            examples: [
                [
                    {
                        fileId: '1bb5db20c5374bfdcf4646d7f398be98',
                        fileName: 'file.ext',
                        contentType: 'image/png',
                        contentSize: '218949'
                    }
                ]
            ],
            items: {
                anyOf: [
                    {
                        type: 'object',
                        title: 'The first anyOf schema',
                        description: 'An explanation about the purpose of this instance.',
                        default: {},
                        examples: [
                            {
                                fileId: '1bb5db20c5374bfdcf4646d7f398be98',
                                fileName: 'IntelletiveLogo.png',
                                contentType: 'image/png',
                                contentSize: '218949'
                            }
                        ],
                        required: [
                            'fileId',
                            'fileName',
                            'contentType',
                            'contentSize'
                        ],
                        properties: {
                            fileId: {
                                type: 'string',
                                title: 'The fileId schema',
                                description: 'An explanation about the purpose of this instance.',
                                default: '',
                                examples: [
                                    '1bb5db20c5374bfdcf4646d7f398be98'
                                ]
                            },
                            fileName: {
                                type: 'string',
                                title: 'The fileName schema',
                                description: 'An explanation about the purpose of this instance.',
                                default: '',
                                examples: [
                                    'file.ext'
                                ]
                            },
                            contentType: {
                                type: 'string',
                                title: 'The contentType schema',
                                description: 'An explanation about the purpose of this instance.',
                                default: '',
                                examples: [
                                    'image/png'
                                ]
                            },
                            contentSize: {
                                type: 'string',
                                title: 'The contentSize schema',
                                description: 'An explanation about the purpose of this instance.',
                                default: '',
                                examples: [
                                    '218949'
                                ]
                            }
                        }
                    }
                ]
            }
        }
    }
};
