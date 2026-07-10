// OpenAPI 3.0 specification served at /api/v1/api-docs
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Safe Courier API",
    description:
      "Safe courier is a service that helps users deliver parcels to different destinations. The API provides courier quotes based on weight categories and tracks delivery status.",
    version: "2.0.0",
    license: {
      name: "MIT",
      url: "https://github.com/kallyas/safe-courier/LICENSE",
    },
    contact: {
      name: "Safe Courier Team",
      email: "support@safecourier.com",
      url: "https://github.com/kallyas/safe-courier",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "Local development server",
    },
    {
      url: "https://safe-courier-backend-api.herokuapp.com/api/v1",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Users",
      description: "User management",
    },
    {
      name: "Parcels",
      description: "Parcel management and operations",
    },
    {
      name: "Search",
      description: "Search functionality",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      UserRegistration: {
        type: "object",
        required: ["username", "email", "password", "firstName", "lastName"],
        properties: {
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "johndoe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "Password123",
          },
          firstName: {
            type: "string",
            minLength: 2,
            example: "John",
          },
          lastName: {
            type: "string",
            minLength: 2,
            example: "Doe",
          },
          profileImage: {
            type: "string",
            format: "uri",
            example: "https://example.com/profile.jpg",
          },
        },
      },
      UserLogin: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            example: "johndoe",
          },
          password: {
            type: "string",
            example: "Password123",
          },
        },
      },
      UserUpdate: {
        type: "object",
        properties: {
          firstName: {
            type: "string",
            minLength: 2,
            example: "John",
          },
          lastName: {
            type: "string",
            minLength: 2,
            example: "Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          profileImage: {
            type: "string",
            format: "uri",
            example: "https://example.com/profile.jpg",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "60c72b2f9b1d8c001c8f0fdd",
          },
          username: {
            type: "string",
            example: "johndoe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          role: {
            type: "string",
            enum: ["user", "admin", "courier"],
            example: "user",
          },
          status: {
            type: "string",
            enum: ["pending", "active", "suspended", "deactivated"],
            example: "active",
          },
          isAdmin: {
            type: "boolean",
            example: false,
          },
          profileImage: {
            type: "string",
            format: "uri",
            example: "https://example.com/profile.jpg",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      ParcelCreate: {
        type: "object",
        required: [
          "parcelType",
          "weight",
          "locationFrom",
          "locationTo",
          "recipient",
          "city",
        ],
        properties: {
          parcelType: {
            type: "string",
            enum: [
              "document",
              "package",
              "fragile",
              "perishable",
              "electronics",
              "other",
            ],
            example: "package",
          },
          description: {
            type: "string",
            example: "Laptop computer in original packaging",
          },
          weight: {
            type: "number",
            minimum: 0.1,
            example: 2.5,
          },
          dimensions: {
            type: "object",
            properties: {
              length: {
                type: "number",
                example: 30,
              },
              width: {
                type: "number",
                example: 25,
              },
              height: {
                type: "number",
                example: 10,
              },
              unit: {
                type: "string",
                enum: ["cm", "in"],
                default: "cm",
                example: "cm",
              },
            },
          },
          locationFrom: {
            $ref: "#/components/schemas/Location",
          },
          locationTo: {
            $ref: "#/components/schemas/Location",
          },
          recipient: {
            $ref: "#/components/schemas/Recipient",
          },
          city: {
            type: "string",
            example: "New York",
          },
          notes: {
            type: "string",
            example: "Please handle with care",
          },
        },
      },
      Parcel: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "60c72c3f9b1d8c001c8f0fde",
          },
          trackingCode: {
            type: "string",
            example: "ABC123XYZ",
          },
          parcelType: {
            type: "string",
            enum: [
              "document",
              "package",
              "fragile",
              "perishable",
              "electronics",
              "other",
            ],
            example: "package",
          },
          description: {
            type: "string",
            example: "Laptop computer in original packaging",
          },
          sender: {
            oneOf: [
              {
                type: "string",
                example: "60c72b2f9b1d8c001c8f0fdd",
              },
              {
                $ref: "#/components/schemas/User",
              },
            ],
          },
          weight: {
            type: "number",
            example: 2.5,
          },
          dimensions: {
            type: "object",
            properties: {
              length: {
                type: "number",
                example: 30,
              },
              width: {
                type: "number",
                example: 25,
              },
              height: {
                type: "number",
                example: 10,
              },
              unit: {
                type: "string",
                enum: ["cm", "in"],
                example: "cm",
              },
            },
          },
          price: {
            type: "object",
            properties: {
              amount: {
                type: "number",
                example: 45.5,
              },
              currency: {
                type: "string",
                enum: ["USD", "EUR", "GBP", "JPY"],
                example: "USD",
              },
            },
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "in-transit",
              "delivered",
              "returned",
              "cancelled",
              "processing",
              "on-hold",
            ],
            example: "in-transit",
          },
          locationFrom: {
            $ref: "#/components/schemas/Location",
          },
          locationTo: {
            $ref: "#/components/schemas/Location",
          },
          presentLocation: {
            $ref: "#/components/schemas/Location",
          },
          notes: {
            type: "string",
            example: "Please handle with care",
          },
          recipient: {
            $ref: "#/components/schemas/Recipient",
          },
          estimatedDelivery: {
            type: "string",
            format: "date-time",
          },
          pickupDate: {
            type: "string",
            format: "date-time",
          },
          deliveryDate: {
            type: "string",
            format: "date-time",
          },
          courierAssigned: {
            oneOf: [
              {
                type: "string",
                example: "60c72b2f9b1d8c001c8f0fde",
              },
              {
                $ref: "#/components/schemas/User",
              },
            ],
          },
          paymentStatus: {
            type: "string",
            enum: ["pending", "paid", "failed", "refunded"],
            example: "paid",
          },
          progress: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            example: 50,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Location: {
        type: "object",
        required: ["address", "city"],
        properties: {
          address: {
            type: "string",
            example: "123 Main St",
          },
          city: {
            type: "string",
            example: "New York",
          },
          state: {
            type: "string",
            example: "NY",
          },
          country: {
            type: "string",
            example: "USA",
          },
          postalCode: {
            type: "string",
            example: "10001",
          },
          coordinates: {
            type: "array",
            items: {
              type: "number",
            },
            example: [-73.9857, 40.7484],
          },
        },
      },
      Recipient: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: {
            type: "string",
            example: "Jane Doe",
          },
          phone: {
            type: "string",
            example: "+1-555-123-4567",
          },
          email: {
            type: "string",
            format: "email",
            example: "jane.doe@example.com",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          total: {
            type: "integer",
            example: 100,
          },
          page: {
            type: "integer",
            example: 1,
          },
          pages: {
            type: "integer",
            example: 10,
          },
          limit: {
            type: "integer",
            example: 10,
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "error",
          },
          statusCode: {
            type: "integer",
            example: 400,
          },
          message: {
            type: "string",
            example: "Bad request",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Username is required",
                },
                path: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["username"],
                },
              },
            },
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "success",
          },
          message: {
            type: "string",
            example: "Operation successful",
          },
        },
      },
    },
  },
  paths: {
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserRegistration",
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "User created successfully",
                    },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login to the system",
        description: "Authenticate a user and get a token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserLogin",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Successfully logged in",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Logged in successfully",
                    },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout from the system",
        description: "Invalidate current token",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Successfully logged out",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/verify": {
      post: {
        tags: ["Auth"],
        summary: "Verify token",
        description: "Verify if token is valid",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Token is valid",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Token is valid",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          example: "60c72b2f9b1d8c001c8f0fdd",
                        },
                        username: {
                          type: "string",
                          example: "johndoe",
                        },
                        role: {
                          type: "string",
                          example: "user",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        description: "Retrieve a list of all users (admin only)",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: "status",
            in: "query",
            description: "Filter by user status",
            schema: {
              type: "string",
              enum: ["pending", "active", "suspended", "deactivated"],
            },
          },
          {
            name: "role",
            in: "query",
            description: "Filter by user role",
            schema: {
              type: "string",
              enum: ["user", "admin", "courier"],
            },
          },
          {
            name: "includeParcels",
            in: "query",
            description: "Include user parcels in response",
            schema: {
              type: "boolean",
              default: false,
            },
          },
        ],
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/user/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        description: "Retrieve a user by their ID",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update a user's information",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserUpdate",
              },
            },
          },
        },
        responses: {
          200: {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Delete a user account",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/user/{id}/password": {
      put: {
        tags: ["Users"],
        summary: "Change password",
        description: "Update user's password",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword", "confirmPassword"],
                properties: {
                  currentPassword: {
                    type: "string",
                    example: "OldPassword123",
                  },
                  newPassword: {
                    type: "string",
                    minLength: 8,
                    example: "NewPassword456",
                  },
                  confirmPassword: {
                    type: "string",
                    example: "NewPassword456",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password changed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Current password is incorrect",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/profile": {
      get: {
        tags: ["Users"],
        summary: "Get user profile",
        description: "Get current user's profile information",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels": {
      get: {
        tags: ["Parcels"],
        summary: "Get all parcels",
        description: "Retrieve all parcels (admin) or current user's parcels",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: "status",
            in: "query",
            description: "Filter by status",
            schema: {
              type: "string",
              enum: [
                "pending",
                "in-transit",
                "delivered",
                "returned",
                "cancelled",
                "processing",
                "on-hold",
              ],
            },
          },
          {
            name: "parcelType",
            in: "query",
            description: "Filter by parcel type",
            schema: {
              type: "string",
              enum: [
                "document",
                "package",
                "fragile",
                "perishable",
                "electronics",
                "other",
              ],
            },
          },
        ],
        responses: {
          200: {
            description: "List of parcels",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Parcel",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Parcels"],
        summary: "Create a parcel",
        description: "Create a new parcel delivery order",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ParcelCreate",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Parcel created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Parcel created successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/{parcelId}": {
      get: {
        tags: ["Parcels"],
        summary: "Get parcel by ID",
        description: "Retrieve a specific parcel by ID",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "parcelId",
            in: "path",
            description: "Parcel ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Parcel found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Parcel not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/track/{trackingCode}": {
      get: {
        tags: ["Parcels"],
        summary: "Track parcel",
        description: "Track a parcel by its tracking code (public endpoint)",
        parameters: [
          {
            name: "trackingCode",
            in: "path",
            description: "Parcel tracking code",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Parcel tracking information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "object",
                      properties: {
                        trackingCode: {
                          type: "string",
                          example: "ABC123XYZ",
                        },
                        status: {
                          type: "string",
                          example: "in-transit",
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                        },
                        estimatedDelivery: {
                          type: "string",
                          format: "date-time",
                        },
                        locationFrom: {
                          $ref: "#/components/schemas/Location",
                        },
                        locationTo: {
                          $ref: "#/components/schemas/Location",
                        },
                        presentLocation: {
                          $ref: "#/components/schemas/Location",
                        },
                        progress: {
                          type: "integer",
                          example: 50,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Parcel not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/users/{userId}/parcels": {
      get: {
        tags: ["Parcels"],
        summary: "Get user parcels",
        description: "Retrieve all parcels for a specific user",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "userId",
            in: "path",
            description: "User ID",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: "status",
            in: "query",
            description: "Filter by status",
            schema: {
              type: "string",
              enum: [
                "pending",
                "in-transit",
                "delivered",
                "returned",
                "cancelled",
                "processing",
                "on-hold",
              ],
            },
          },
        ],
        responses: {
          200: {
            description: "List of user parcels",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Parcel",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "No parcels found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/{parcelId}/cancel": {
      put: {
        tags: ["Parcels"],
        summary: "Cancel parcel",
        description: "Cancel a parcel delivery order",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "parcelId",
            in: "path",
            description: "Parcel ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Parcel cancelled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Parcel cancelled successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "Parcel not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/{parcelId}/destination": {
      put: {
        tags: ["Parcels"],
        summary: "Update destination",
        description: "Change the destination of a parcel",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "parcelId",
            in: "path",
            description: "Parcel ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["locationTo"],
                properties: {
                  locationTo: {
                    $ref: "#/components/schemas/Location",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Destination updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Destination updated successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "Parcel not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/{parcelId}/status": {
      put: {
        tags: ["Parcels"],
        summary: "Update status",
        description: "Change the status of a parcel (admin only)",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "parcelId",
            in: "path",
            description: "Parcel ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: [
                      "pending",
                      "in-transit",
                      "delivered",
                      "returned",
                      "cancelled",
                      "processing",
                      "on-hold",
                    ],
                    example: "delivered",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Status updated successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "Parcel not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/{parcelId}/presentLocation": {
      put: {
        tags: ["Parcels"],
        summary: "Update present location",
        description: "Change the current location of a parcel (admin only)",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "parcelId",
            in: "path",
            description: "Parcel ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["presentLocation"],
                properties: {
                  presentLocation: {
                    $ref: "#/components/schemas/Location",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Location updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Location updated successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "Parcel not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/{parcelId}/assign": {
      put: {
        tags: ["Parcels"],
        summary: "Assign courier",
        description: "Assign a courier to a parcel (admin only)",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "parcelId",
            in: "path",
            description: "Parcel ID",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courierId"],
                properties: {
                  courierId: {
                    type: "string",
                    example: "60c72b2f9b1d8c001c8f0fdf",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Courier assigned successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Courier assigned successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/Parcel",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          404: {
            description: "Parcel or courier not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/users/search": {
      get: {
        tags: ["Search"],
        summary: "Search users",
        description: "Search for users by query string",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Search query",
            required: true,
            schema: {
              type: "string",
              minLength: 2,
            },
          },
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/parcels/search": {
      get: {
        tags: ["Search"],
        summary: "Search parcels",
        description: "Search for parcels by query string",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Search query",
            required: true,
            schema: {
              type: "string",
              minLength: 2,
            },
          },
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Parcel",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/search/advanced": {
      post: {
        tags: ["Search"],
        summary: "Advanced search",
        description: "Search with multiple criteria and filters",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Text search query",
                    example: "laptop",
                  },
                  type: {
                    type: "string",
                    enum: ["users", "parcels"],
                    description: "Type of content to search",
                    example: "parcels",
                  },
                  dateFrom: {
                    type: "string",
                    format: "date",
                    description: "Start date for date range filter",
                    example: "2023-01-01",
                  },
                  dateTo: {
                    type: "string",
                    format: "date",
                    description: "End date for date range filter",
                    example: "2023-12-31",
                  },
                  status: {
                    type: "string",
                    description: "Status filter for parcels",
                    example: "in-transit",
                  },
                  parcelType: {
                    type: "string",
                    description: "Parcel type filter",
                    example: "electronics",
                  },
                  weight: {
                    type: "string",
                    description: "Weight range (min-max)",
                    example: "0.5-10",
                  },
                  city: {
                    type: "string",
                    description: "City filter",
                    example: "New York",
                  },
                  sortBy: {
                    type: "string",
                    description: "Field to sort by",
                    example: "createdAt",
                  },
                  sortOrder: {
                    type: "string",
                    enum: ["asc", "desc"],
                    description: "Sort order",
                    example: "desc",
                  },
                  page: {
                    type: "integer",
                    description: "Page number",
                    example: 1,
                  },
                  limit: {
                    type: "integer",
                    description: "Items per page",
                    example: 10,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "success",
                    },
                    data: {
                      type: "array",
                      items: {
                        oneOf: [
                          {
                            $ref: "#/components/schemas/User",
                          },
                          {
                            $ref: "#/components/schemas/Parcel",
                          },
                        ],
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    // Add this to the paths section of the swagger.js file:

    "/health": {
      get: {
        tags: ["System"],
        summary: "Basic health check",
        description: "Check the health status of the API and its dependencies",
        responses: {
          200: {
            description: "Health check information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["ok", "degraded", "error"],
                      example: "ok",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                    uptime: {
                      type: "number",
                      example: 3600.5,
                    },
                    environment: {
                      type: "string",
                      example: "production",
                    },
                    services: {
                      type: "object",
                      properties: {
                        api: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["ok", "error"],
                              example: "ok",
                            },
                          },
                        },
                        database: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["ok", "error", "disconnected", "checking"],
                              example: "ok",
                            },
                          },
                        },
                        redis: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["ok", "error", "disabled"],
                              example: "ok",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          503: {
            description: "Service unavailable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "error",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health/deep": {
      get: {
        tags: ["System"],
        summary: "Detailed health check",
        description:
          "Perform a more thorough health check of the API and its dependencies with detailed information",
        responses: {
          200: {
            description: "Detailed health information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["ok", "degraded", "error"],
                      example: "ok",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                    uptime: {
                      type: "number",
                      example: 3600.5,
                    },
                    environment: {
                      type: "string",
                      example: "production",
                    },
                    memory: {
                      type: "object",
                      properties: {
                        rss: {
                          type: "number",
                          example: 102400000,
                        },
                        heapTotal: {
                          type: "number",
                          example: 51200000,
                        },
                        heapUsed: {
                          type: "number",
                          example: 30720000,
                        },
                        external: {
                          type: "number",
                          example: 5120000,
                        },
                      },
                    },
                    cpuUsage: {
                      type: "object",
                      properties: {
                        user: {
                          type: "number",
                          example: 1500000,
                        },
                        system: {
                          type: "number",
                          example: 750000,
                        },
                      },
                    },
                    services: {
                      type: "object",
                      properties: {
                        api: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["ok", "error"],
                              example: "ok",
                            },
                            version: {
                              type: "string",
                              example: "2.0.0",
                            },
                          },
                        },
                        database: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["ok", "error", "disconnected", "checking"],
                              example: "ok",
                            },
                            ping: {
                              type: "string",
                              example: "15ms",
                            },
                            version: {
                              type: "string",
                              example: "5.0.7",
                            },
                            connection: {
                              type: "object",
                              properties: {
                                host: {
                                  type: "string",
                                  example: "mongodb.example.com",
                                },
                              },
                            },
                            connections: {
                              type: "object",
                              properties: {
                                current: {
                                  type: "number",
                                  example: 5,
                                },
                                available: {
                                  type: "number",
                                  example: 95,
                                },
                              },
                            },
                          },
                        },
                        redis: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["ok", "error", "disabled"],
                              example: "ok",
                            },
                            ping: {
                              type: "string",
                              example: "5ms",
                            },
                            version: {
                              type: "string",
                              example: "6.2.5",
                            },
                            memory: {
                              type: "string",
                              example: "1.5M",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          503: {
            description: "Service unavailable",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
