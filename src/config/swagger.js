const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'PortfolioPro Backend API',
    version: '1.0.0',
    description: 'API documentation for PortfolioPro Backend'
  },
  servers: [
    {
      url: '/api',
      description: 'API base path'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Categories' },
    { name: 'TODO' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          isActive: { type: 'boolean' },
          isSubscribed: { type: 'boolean' },
          mobileNumber: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CategoryRequest: {
        type: 'object',
        required: ['categoryName'],
        properties: {
          categoryName: { type: 'string' },
          isActive: { type: 'boolean' },
          categoryImage: {
            type: 'string',
            format: 'binary'
          }
        }
      },
      CategoryUpdateRequest: {
        type: 'object',
        properties: {
          categoryName: { type: 'string' },
          isActive: { type: 'boolean' },
          categoryImage: {
            type: 'string',
            format: 'binary'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoryName: { type: 'string' },
          isActive: { type: 'boolean' },
          categoryImagePath: { type: 'string', nullable: true },
          createdOn: { type: 'string', format: 'date-time' },
          createdById: { type: 'string', format: 'uuid' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        servers: [{ url: '/' }],
        responses: {
          200: {
            description: 'API is healthy'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: { description: 'User created' },
          400: { description: 'Validation error or duplicate user' }
        }
      }
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user alias',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: { description: 'User created' },
          400: { description: 'Validation error or duplicate user' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Admin only.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          },
          403: { description: 'Admin access required' }
        }
      }
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' },
          401: { description: 'Unauthorized' }
        }
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get categories',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Category list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        description: 'Admin only.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CategoryRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Category created' },
          403: { description: 'Admin access required' }
        }
      }
    },
    '/categories/{id}': {
      patch: {
        tags: ['Categories'],
        summary: 'Update category',
        description: 'Admin only. Supports marking category active or inactive.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CategoryUpdateRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Category updated' },
          403: { description: 'Admin access required' },
          404: { description: 'Category not found' }
        }
      }
    },
    '/resumes': {
      get: {
        tags: ['TODO'],
        summary: 'Resume Suite placeholder',
        responses: { 501: { description: 'TODO Later' } }
      }
    },
    '/ai': {
      get: {
        tags: ['TODO'],
        summary: 'AI integration placeholder',
        responses: { 501: { description: 'TODO Later' } }
      }
    },
    '/billing': {
      get: {
        tags: ['TODO'],
        summary: 'Billing placeholder',
        responses: { 501: { description: 'TODO Later' } }
      }
    }
  }
};

module.exports = { swaggerUi, swaggerDocument };
