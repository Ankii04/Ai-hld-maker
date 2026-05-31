export const ARCHITECTURE_TEMPLATES = [
  {
    id: '3tier',
    title: '3-Tier SaaS Web App Preset',
    description: 'Classic secure structure with Web/Mobile clients, API Gateway, Redis Cache, Postgres DB, and Kafka background workers.',
    productName: 'SaaS Platform Blueprint',
    summary: 'A standard robust 3-tier SaaS system design optimized for low-latency client reads, session caching, relational transactions, and async background workers.',
    status: 'generated',
    constraints: {
      scale: 'Enterprise Scale',
      budget: 'Medium',
      expectedUsers: '100K - 1M',
      techPreferences: ['React', 'Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka']
    },
    hld: {
      summary: 'High-Level Design featuring global NGINX load balancing, API Gateway routing, and separate database/cache persistence layers.',
      nodes: [
        { id: 't_client', type: 'client', label: 'Web Browser Client', description: 'React single-page application dashboard', technology: 'React / Tailwind', position: { x: 100, y: 50 } },
        { id: 't_mobile', type: 'client', label: 'Mobile App Client', description: 'iOS and Android client application', technology: 'React Native', position: { x: 340, y: 50 } },
        { id: 't_cdn', type: 'cdn', label: 'Cloudflare CDN', description: 'Static assets caching & DDoS protection', technology: 'Cloudflare Edge', position: { x: 100, y: 200 } },
        { id: 't_lb', type: 'lb', label: 'NGINX Load Balancer', description: 'Layer 7 proxy & SSL termination', technology: 'NGINX Plus', position: { x: 340, y: 200 } },
        { id: 't_gateway', type: 'gateway', label: 'API Gateway', description: 'JWT auth, rate limiting, and CORS headers', technology: 'Kong Gateway', position: { x: 340, y: 350 } },
        { id: 't_auth_svc', type: 'service', label: 'Auth Service', description: 'Validates tokens and manages user credentials', technology: 'Node.js / Express', position: { x: 100, y: 500 } },
        { id: 't_core_svc', type: 'service', label: 'Core API Service', description: 'Main business logic API service', technology: 'Go / Fiber', position: { x: 340, y: 500 } },
        { id: 't_worker_svc', type: 'service', label: 'Notification Service', description: 'Sends emails and push notifications', technology: 'Python / FastAPI', position: { x: 580, y: 500 } },
        { id: 't_redis', type: 'cache', label: 'Redis Cache', description: 'Active session state & query caching', technology: 'Redis Cluster', position: { x: 100, y: 650 } },
        { id: 't_postgres', type: 'database', label: 'PostgreSQL Primary', description: 'Relational storage with read replicas', technology: 'PostgreSQL 16', position: { x: 340, y: 650 } },
        { id: 't_kafka', type: 'queue', label: 'Kafka Message Bus', description: 'Asynchronous event bus for service events', technology: 'Apache Kafka', position: { x: 580, y: 650 } }
      ],
      edges: [
        { id: 'e1', source: 't_client', target: 't_cdn', label: 'Fetch assets', animated: false },
        { id: 'e2', source: 't_client', target: 't_lb', label: 'HTTPS request', animated: true },
        { id: 'e3', source: 't_mobile', target: 't_lb', label: 'HTTPS request', animated: true },
        { id: 'e4', source: 't_lb', target: 't_gateway', label: 'Reverse proxy', animated: true },
        { id: 'e5', source: 't_gateway', target: 't_auth_svc', label: 'Validate JWT', animated: true },
        { id: 'e6', source: 't_gateway', target: 't_core_svc', label: 'Route request', animated: true },
        { id: 'e7', source: 't_core_svc', target: 't_redis', label: 'Check cache', animated: false },
        { id: 'e8', source: 't_core_svc', target: 't_postgres', label: 'Write transaction', animated: true },
        { id: 'e9', source: 't_core_svc', target: 't_kafka', label: 'Publish event', animated: true },
        { id: 'e10', source: 't_kafka', target: 't_worker_svc', label: 'Consume message', animated: true }
      ],
      scalabilityNotes: [
        'Utilize CDN edge nodes to serve index.html and static assets with sub-50ms latency.',
        'Autoscale core services using Kubernetes HPA based on CPU/Memory usage metrics.',
        'Redis cache layers prevent PostgreSQL CPU spikes by handling 85% of read queries.'
      ],
      tradeoffs: [
        { pro: 'High scalability and clear separation of read/write concerns.', con: 'Increased operational complexity due to microservices and Kafka cluster hosting.' }
      ]
    },
    lld: {
      services: [
        {
          name: 'Core API Service',
          responsibility: 'Handles SaaS CRUD logic, billing integrations, and data queries.',
          technology: 'Go / Fiber',
          dependencies: ['Kong Gateway', 'PostgreSQL', 'Redis', 'Kafka'],
          endpoints: [
            { method: 'GET', path: '/api/v1/projects', description: 'Retrieve all user projects', auth: true, requestBody: {}, response: { status: 'success', data: [] } },
            { method: 'POST', path: '/api/v1/projects', description: 'Create a new project workspace', auth: true, requestBody: { name: 'string', description: 'string' }, response: { status: 'success', id: 'uuid' } }
          ]
        },
        {
          name: 'Auth Service',
          responsibility: 'Validates JWTs, handles account creation and user verification.',
          technology: 'Node.js / Express',
          dependencies: ['PostgreSQL'],
          endpoints: [
            { method: 'POST', path: '/api/v1/auth/login', description: 'User login endpoint', auth: false, requestBody: { email: 'string', pass: 'string' }, response: { token: 'jwt-token-here' } }
          ]
        }
      ]
    },
    database: {
      type: 'PostgreSQL 16',
      rationale: 'Strong ACID compliance and relational integrity is required for billing, accounts, and primary data.',
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], isPrimary: true },
            { name: 'email', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'] },
            { name: 'password_hash', type: 'VARCHAR(255)', constraints: ['NOT NULL'] }
          ],
          relations: [{ target: 'projects', type: '1:N' }]
        },
        {
          name: 'projects',
          columns: [
            { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], isPrimary: true },
            { name: 'user_id', type: 'UUID', constraints: ['REFERENCES users(id)'], isForeign: true },
            { name: 'title', type: 'VARCHAR(200)', constraints: ['NOT NULL'] }
          ],
          relations: []
        }
      ],
      cachingStrategy: 'Redis',
      shardingStrategy: 'Hash-based by user_id'
    },
    scalability: {
      loadBalancing: 'NGINX Plus round-robin DNS with health checks.',
      caching: [
        { layer: 'Application L1', technology: 'Redis Cluster', strategy: 'Cache-aside' }
      ],
      sharding: 'Sharded by user tenant ID',
      cdnStrategy: 'Cloudflare Edge Caching',
      estimatedRPS: 5000,
      estimatedUsers: '500,000'
    },
    uiux: {
      userFlows: [
        { id: 'f1', name: 'User Authentication', steps: [{ screen: 'Login Screen', action: 'Submit form', next: 'Dashboard' }] }
      ],
      screens: [
        { name: 'Login Screen', purpose: 'Authenticate user session', layout: 'Split Screen Layout', sections: [{ type: 'form', label: 'Sign In Form', content: 'Email and Password' }] }
      ],
      components: [
        { group: 'Forms', name: 'InputField', description: 'Glowing dark-mode text input field', complexity: 'Simple' }
      ],
      designSystem: {
        colors: { primary: '#3b82f6', secondary: '#8b5cf6', background: '#0a0a0f', surface: '#12121a', text: '#f1f5f9' }
      }
    },
    challengeMode: {
      bottlenecks: [
        { title: 'Single PostgreSQL Node', description: 'Postgres primary will bottleneck on write transactions under heavy load.', severity: 'high', fix: 'Add PgBouncer for connection pooling and implement DB partition sharding.' }
      ],
      spofs: [
        { title: 'Kong Gateway Instance', description: 'If the single gateway crashes, all API requests fail.', severity: 'high', fix: 'Deploy Kong in active-passive clustering mode behind NGINX.' }
      ],
      recommendations: [
        { title: 'Implement Redis Read Replia', impact: 'medium' }
      ]
    }
  },
  {
    id: 'cqrs',
    title: 'CQRS Microservices Preset',
    description: 'Highly segregated architecture splitting reads and writes with separate command and query gateway pipes and Kafka synchronizer.',
    productName: 'CQRS Enterprise Blueprint',
    summary: 'A highly scalable CQRS system design built to handle massive transactional throughput by decoupling command and query pipelines completely.',
    status: 'generated',
    constraints: {
      scale: 'Enterprise Scale',
      budget: 'High',
      expectedUsers: '1M+',
      techPreferences: ['React', 'Java', 'Python', 'Kafka', 'PostgreSQL', 'Elasticsearch']
    },
    hld: {
      summary: 'Command Query Responsibility Segregation (CQRS) using Apache Kafka for write-to-read database replication.',
      nodes: [
        { id: 't_client_cq', type: 'client', label: 'Client Apps', description: 'SPA and mobile app consumers', technology: 'React / Swift', position: { x: 100, y: 50 } },
        { id: 't_lb_cq', type: 'lb', label: 'Load Balancer', description: 'Directs read/write traffic', technology: 'AWS ALB', position: { x: 100, y: 200 } },
        { id: 't_write_gw', type: 'gateway', label: 'Command API Gateway', description: 'Accepts mutative actions', technology: 'Kong Gateway', position: { x: 100, y: 350 } },
        { id: 't_read_gw', type: 'gateway', label: 'Query API Gateway', description: 'Accepts fetch actions', technology: 'Kong Gateway', position: { x: 400, y: 350 } },
        { id: 't_write_svc', type: 'service', label: 'Write Command Service', description: 'Processes commands & applies state', technology: 'Java / Spring Boot', position: { x: 100, y: 500 } },
        { id: 't_read_svc', type: 'service', label: 'Read Query Service', description: 'Queries highly indexed view data', technology: 'Node.js / Fastify', position: { x: 400, y: 500 } },
        { id: 't_kafka_cq', type: 'queue', label: 'Kafka Event Sync', description: 'Propagates state updates to read replica', technology: 'Apache Kafka', position: { x: 100, y: 650 } },
        { id: 't_db_write', type: 'database', label: 'Postgres (Write DB)', description: 'Primary relational database (Write)', technology: 'PostgreSQL 16', position: { x: 250, y: 650 } },
        { id: 't_db_read', type: 'database', label: 'Elasticsearch (Read DB)', description: 'Indexed read store (Query)', technology: 'Elasticsearch 8', position: { x: 400, y: 650 } }
      ],
      edges: [
        { id: 'e1_cq', source: 't_client_cq', target: 't_lb_cq', label: 'Any traffic', animated: true },
        { id: 'e2_cq', source: 't_lb_cq', target: 't_write_gw', label: 'POST / PUT / DELETE', animated: true },
        { id: 'e3_cq', source: 't_lb_cq', target: 't_read_gw', label: 'GET requests', animated: true },
        { id: 'e4_cq', source: 't_write_gw', target: 't_write_svc', label: 'Forward Command', animated: true },
        { id: 'e5_cq', source: 't_read_gw', target: 't_read_svc', label: 'Forward Query', animated: true },
        { id: 'e6_cq', source: 't_write_svc', target: 't_db_write', label: 'Commit transaction', animated: true },
        { id: 'e7_cq', source: 't_write_svc', target: 't_kafka_cq', label: 'Emit EntityCreated event', animated: true },
        { id: 'e8_cq', source: 't_kafka_cq', target: 't_read_svc', label: 'Consume sync events', animated: true },
        { id: 'e9_cq', source: 't_read_svc', target: 't_db_read', label: 'Elasticsearch query', animated: false },
        { id: 'e10_cq', source: 't_read_svc', target: 't_db_read', label: 'Sync index write', animated: true }
      ],
      scalabilityNotes: [
        'Separating reads and writes prevents slow dashboard analytical queries from locking billing transactions.',
        'Scale read servers 5x more than command servers, as reads make up 95% of typical SaaS workloads.',
        'Kafka enables eventual consistency with sub-second lag across the write and search databases.'
      ],
      tradeoffs: [
        { pro: 'Extreme read throughput and custom indexed query views.', con: 'Eventual consistency means clients might see stale data for 100-300ms.' }
      ]
    },
    lld: {
      services: [
        {
          name: 'Write Command Service',
          responsibility: 'Handles strict validation, transaction logs, and entity creations.',
          technology: 'Java / Spring',
          dependencies: ['Kafka', 'PostgreSQL'],
          endpoints: [
            { method: 'POST', path: '/api/v1/orders', description: 'Create a new purchase order', auth: true, requestBody: { item: 'string', amount: 'number' }, response: { orderId: 'id', status: 'pending' } }
          ]
        }
      ]
    },
    database: {
      type: 'PostgreSQL + Elasticsearch',
      rationale: 'Postgres handles transactional state, while Elasticsearch is optimized for blazing-fast full-text searches.',
      tables: [
        {
          name: 'orders_primary',
          columns: [
            { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], isPrimary: true },
            { name: 'amount', type: 'DECIMAL(12,2)', constraints: ['NOT NULL'] }
          ],
          relations: []
        }
      ],
      cachingStrategy: 'Kafka buffer writes',
      shardingStrategy: 'Elasticsearch index sharding'
    },
    scalability: {
      loadBalancing: 'ALB Path routing',
      caching: [],
      sharding: 'Elasticsearch indices sharded into 5 shards',
      cdnStrategy: 'No CDN',
      estimatedRPS: 15000,
      estimatedUsers: '2,000,000'
    },
    uiux: {
      userFlows: [],
      screens: [],
      components: [],
      designSystem: {
        colors: { primary: '#a855f7', secondary: '#3b82f6', background: '#0a0a0f', surface: '#12121a', text: '#f1f5f9' }
      }
    },
    challengeMode: {
      bottlenecks: [],
      spofs: [],
      recommendations: []
    }
  },
  {
    id: 'streaming',
    title: 'Event-driven Streaming Preset',
    description: 'High-throughput event ingestion architecture with MQTT Gateway, RabbitMQ queue, Flink streaming processors, and InfluxDB time-series storage.',
    productName: 'Real-time Streaming Engine',
    summary: 'A time-series streaming blueprint designed for IoT logs ingestion, real-time analytics, dashboards, and stream processing.',
    status: 'generated',
    constraints: {
      scale: 'Enterprise Scale',
      budget: 'High',
      expectedUsers: '10M+ Logs',
      techPreferences: ['Node.js', 'Python', 'RabbitMQ', 'Apache Flink', 'InfluxDB']
    },
    hld: {
      summary: 'Event Ingestion stream with high write time-series databases.',
      nodes: [
        { id: 't_iot', type: 'client', label: 'IoT Device Logger', description: 'Edge logs publisher device', technology: 'C++ MQTT Edge', position: { x: 100, y: 50 } },
        { id: 't_lb_st', type: 'lb', label: 'LB proxy', description: 'UDP/TCP logs load balancer', technology: 'HAProxy', position: { x: 100, y: 200 } },
        { id: 't_gate_st', type: 'gateway', label: 'MQTT Ingestor', description: 'Translates MQTT logs to AMQP events', technology: 'VerneMQ Gateway', position: { x: 100, y: 350 } },
        { id: 't_rabbit', type: 'queue', label: 'RabbitMQ Buffer', description: 'High reliability logs event broker queue', technology: 'RabbitMQ', position: { x: 100, y: 500 } },
        { id: 't_flink', type: 'service', label: 'Apache Flink', description: 'Processes log streams in real-time windows', technology: 'Apache Flink', position: { x: 340, y: 500 } },
        { id: 't_influx', type: 'database', label: 'InfluxDB cluster', description: 'Stores logs as append-only time series', technology: 'InfluxDB v2', position: { x: 340, y: 650 } }
      ],
      edges: [
        { id: 'es1', source: 't_iot', target: 't_lb_st', label: 'TCP socket', animated: true },
        { id: 'es2', source: 't_lb_st', target: 't_gate_st', label: 'Proxy traffic', animated: true },
        { id: 'es3', source: 't_gate_st', target: 't_rabbit', label: 'Enqueue raw log', animated: true },
        { id: 'es4', source: 't_rabbit', target: 't_flink', label: 'Stream pull', animated: true },
        { id: 'es5', source: 't_flink', target: 't_influx', label: 'Write window log metrics', animated: true }
      ],
      scalabilityNotes: [
        'HAProxy load balancer distributes time-series telemetry events evenly across the MQTT gateways.',
        'RabbitMQ acts as a massive backpressure buffer during peak surge logging times.',
        'InfluxDB is tailored specifically for high-speed time-series logs and analytical queries.'
      ],
      tradeoffs: [
        { pro: 'Capable of handling millions of logs per second with backpressure buffering.', con: 'InfluxDB is not suited for complex relational table joins or account billing.' }
      ]
    },
    lld: {
      services: [
        {
          name: 'Apache Flink Stream Processor',
          responsibility: 'Runs sliding time window aggregations on log telemetry events.',
          technology: 'Java / Apache Flink',
          dependencies: ['RabbitMQ', 'InfluxDB'],
          endpoints: []
        }
      ]
    },
    database: {
      type: 'InfluxDB v2',
      rationale: 'High-speed time-series append-only logging database.',
      tables: [
        {
          name: 'telemetry_metrics',
          columns: [
            { name: 'timestamp', type: 'TIMESTAMP', constraints: ['PRIMARY KEY'], isPrimary: true },
            { name: 'device_id', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
            { name: 'cpu_usage', type: 'DOUBLE', constraints: [] }
          ],
          relations: []
        }
      ],
      cachingStrategy: 'Flink in-memory buffer',
      shardingStrategy: 'Sharded by time bucket partition'
    },
    scalability: {
      loadBalancing: 'HAProxy Layer 4',
      caching: [],
      sharding: 'Time bucket sharding',
      cdnStrategy: 'No CDN',
      estimatedRPS: 50000,
      estimatedUsers: '10,000,000 logs'
    },
    uiux: {
      userFlows: [],
      screens: [],
      components: [],
      designSystem: {
        colors: { primary: '#06b6d4', secondary: '#10b981', background: '#0a0a0f', surface: '#12121a', text: '#f1f5f9' }
      }
    },
    challengeMode: {
      bottlenecks: [],
      spofs: [],
      recommendations: []
    }
  }
]
