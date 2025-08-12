# System Context Diagrams - Trade Bot Scratch

## 🎯 Mục đích

Tài liệu này chứa các sơ đồ context tổng quan về hệ thống Trade Bot Scratch, mô tả mối quan hệ giữa hệ thống và các external entities.

## 🌐 System Context Diagram (C4 Level 1)

```mermaid
graph TB
    subgraph "External Users"
        U1[Traders]
        U2[Administrators]
        U3[API Users]
    end
    
    subgraph "Trade Bot Scratch System"
        TBS[Trade Bot System<br/>Automated Trading Platform]
    end
    
    subgraph "External Systems"
        subgraph "Exchanges"
            E1[Binance<br/>Crypto Exchange]
            E2[Gate.io<br/>Crypto Exchange] 
            E3[MEXC<br/>Crypto Exchange]
            E4[MetaTrader 5<br/>Forex Platform]
        end
        
        subgraph "Data Providers"
            D1[CoinMarketCap<br/>Market Data]
            D2[Yahoo Finance<br/>Financial Data]
            D3[Alpha Vantage<br/>Stock Data]
        end
        
        subgraph "External Services"
            S1[Email Service<br/>SMTP]
            S2[SMS Gateway<br/>Twilio]
            S3[Payment Gateway<br/>Stripe]
            S4[Cloud Storage<br/>AWS S3]
        end
    end
    
    %% User Interactions
    U1 -->|Manages bots, views analytics| TBS
    U2 -->|System administration| TBS
    U3 -->|REST API calls| TBS
    
    %% Exchange Integrations
    TBS -->|Places orders, fetches data| E1
    TBS -->|Places orders, fetches data| E2
    TBS -->|Places orders, fetches data| E3
    TBS -->|Places orders, fetches data| E4
    
    %% Data Provider Integrations
    TBS -->|Fetches market data| D1
    TBS -->|Fetches financial data| D2
    TBS -->|Fetches stock data| D3
    
    %% External Service Integrations
    TBS -->|Sends notifications| S1
    TBS -->|Sends SMS alerts| S2
    TBS -->|Processes payments| S3
    TBS -->|Stores backups| S4
    
    %% Styling
    classDef userClass fill:#e1f5fe ,color:#000000
    classDef systemClass fill:#f3e5f5,color:#000000
    classDef exchangeClass fill:#e8f5e8,color:#000000
    classDef dataClass fill:#fff3e0,color:#000000
    classDef serviceClass fill:#fce4ec,color:#000000
    
    class U1,U2,U3 userClass
    class TBS systemClass
    class E1,E2,E3,E4 exchangeClass
    class D1,D2,D3 dataClass
    class S1,S2,S3,S4 serviceClass
```

## 🏗️ Container Diagram (C4 Level 2)

```mermaid
graph TB
    subgraph "Users"
        U1[Web Browser<br/>User Interface]
        U2[Mobile App<br/>iOS/Android]
        U3[API Client<br/>Third Party]
    end
    
    subgraph "Trade Bot Scratch System"
        subgraph "Frontend"
            WEB[Web Application<br/>React + TypeScript<br/>Port: 3000]
        end
        
        subgraph "API Layer"
            GW[API Gateway<br/>Express.js + TypeScript<br/>Port: 5000]
        end
        
        subgraph "Microservices"
            MS[Market Service<br/>Node.js + TypeScript<br/>Port: 5001]
            US[User Service<br/>Node.js + TypeScript<br/>Port: 5002]
            TE[Trading Engine<br/>Python + FastAPI<br/>Port: 8000]
            AS[Analysis Service<br/>Python<br/>Port: 8001]
        end
        
        subgraph "Data Storage"
            DB[(PostgreSQL<br/>Primary Database<br/>Port: 5432)]
            CACHE[(Redis<br/>Cache & Sessions<br/>Port: 6379)]
        end
    end
    
    subgraph "External Systems"
        EX[Exchanges<br/>Binance, Gate.io, MEXC]
        MD[Market Data<br/>CoinMarketCap, Yahoo]
        NS[Notification Services<br/>Email, SMS]
        PS[Payment Services<br/>Stripe]
    end
    
    %% User to Frontend
    U1 -->|HTTPS| WEB
    U2 -->|HTTPS API| GW
    U3 -->|REST API| GW
    
    %% Frontend to Backend
    WEB -->|REST API| GW
    
    %% API Gateway to Services
    GW -->|HTTP| MS
    GW -->|HTTP| US
    GW -->|HTTP| TE
    GW -->|HTTP| AS
    
    %% Services to Data
    MS --> DB
    MS --> CACHE
    US --> DB
    US --> CACHE
    TE --> DB
    TE --> CACHE
    AS --> DB
    AS --> CACHE
    
    %% External Integrations
    MS -->|REST API/WebSocket| EX
    MS -->|REST API| MD
    TE -->|REST API| EX
    US -->|SMTP/HTTP| NS
    US -->|REST API| PS
    
    %% Styling
    classDef frontend fill:#e3f2fd
    classDef api fill:#f3e5f5
    classDef service fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef external fill:#fce4ec
    
    class WEB frontend
    class GW api
    class MS,US,TE,AS service
    class DB,CACHE data
    class EX,MD,NS,PS external
```

## 🔧 Component Diagram - Market Service (C4 Level 3)

```mermaid
graph TB
    subgraph "Market Service Container"
        subgraph "Controllers"
            MC[Market Controller<br/>REST Endpoints]
            WSC[WebSocket Controller<br/>Real-time Data]
        end
        
        subgraph "Business Logic"
            MDS[Market Data Service<br/>Data Processing]
            AMS[Aggregation Service<br/>Multi-source Data]
            CAS[Cache Service<br/>Data Optimization]
        end
        
        subgraph "Integration Layer"
            EA[Exchange Adapters<br/>CCXT Integration]
            DPA[Data Provider Adapters<br/>External APIs]
            WSM[WebSocket Manager<br/>Real-time Streams]
        end
        
        subgraph "Data Access"
            DR[Data Repository<br/>Database Access]
            CR[Cache Repository<br/>Redis Access]
        end
    end
    
    subgraph "External Dependencies"
        API[API Gateway]
        DB[(PostgreSQL)]
        REDIS[(Redis)]
        BINANCE[Binance API]
        CMC[CoinMarketCap API]
    end
    
    %% Internal Component Flow
    API --> MC
    API --> WSC
    
    MC --> MDS
    WSC --> MDS
    
    MDS --> AMS
    MDS --> CAS
    
    AMS --> EA
    AMS --> DPA
    CAS --> WSM
    
    EA --> DR
    DPA --> DR
    WSM --> CR
    
    %% External Dependencies
    DR --> DB
    CR --> REDIS
    EA --> BINANCE
    DPA --> CMC
    
    %% Styling
    classDef controller fill:#e3f2fd
    classDef business fill:#e8f5e8
    classDef integration fill:#fff3e0
    classDef data fill:#f3e5f5
    classDef external fill:#fce4ec
    
    class MC,WSC controller
    class MDS,AMS,CAS business
    class EA,DPA,WSM integration
    class DR,CR data
    class API,DB,REDIS,BINANCE,CMC external
```

## 📊 Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant G as API Gateway
    participant M as Market Service
    participant T as Trading Engine
    participant E as Exchange
    participant D as Database
    participant R as Redis
    
    Note over U,R: Real-time Market Data Flow
    
    E->>M: WebSocket: Price Updates
    M->>R: Cache: Store Latest Prices
    M->>W: WebSocket: Broadcast Updates
    W->>U: UI: Display Price Changes
    
    Note over U,R: Trading Flow
    
    U->>W: Place Trade Order
    W->>G: POST /api/v1/trading/orders
    G->>T: Forward Order Request
    T->>D: Validate: User Balance & Limits
    T->>E: Execute: Place Order
    E->>T: Confirm: Order Executed
    T->>D: Store: Trade Record
    T->>R: Cache: Update Positions
    T->>G: Return: Trade Confirmation
    G->>W: Return: Success Response
    W->>U: Display: Trade Confirmed
    
    Note over U,R: Market Data Request Flow
    
    U->>W: Request: OHLCV Data
    W->>G: GET /api/v1/market/ohlcv
    G->>M: Forward Request
    M->>R: Check: Cache
    alt Cache Hit
        R->>M: Return: Cached Data
    else Cache Miss
        M->>E: Fetch: Fresh Data
        E->>M: Return: OHLCV Data
        M->>R: Store: Cache Data
        M->>D: Store: Historical Data
    end
    M->>G: Return: OHLCV Data
    G->>W: Return: Response
    W->>U: Display: Chart Data
```

## 🔄 Event Flow Diagram

```mermaid
graph LR
    subgraph "Event Sources"
        ES1[Market Data Updates]
        ES2[Trade Executions]
        ES3[User Actions]
        ES4[System Events]
    end
    
    subgraph "Event Processing"
        EB[Event Bus<br/>Redis Pub/Sub]
        EP[Event Processor<br/>Stream Processing]
    end
    
    subgraph "Event Consumers"
        EC1[Analytics Service<br/>Performance Metrics]
        EC2[Notification Service<br/>Alerts & Updates]
        EC3[Risk Management<br/>Position Monitoring]
        EC4[Audit Service<br/>Compliance Logging]
    end
    
    subgraph "Data Stores"
        DS1[(Time Series DB<br/>Market Data)]
        DS2[(OLTP Database<br/>Transactions)]
        DS3[(OLAP Database<br/>Analytics)]
        DS4[(Log Store<br/>Audit Trail)]
    end
    
    %% Event Flow
    ES1 --> EB
    ES2 --> EB
    ES3 --> EB
    ES4 --> EB
    
    EB --> EP
    
    EP --> EC1
    EP --> EC2
    EP --> EC3
    EP --> EC4
    
    EC1 --> DS1
    EC1 --> DS3
    EC2 --> DS2
    EC3 --> DS2
    EC4 --> DS4
    
    %% Styling
    classDef source fill:#e3f2fd
    classDef processing fill:#e8f5e8
    classDef consumer fill:#fff3e0
    classDef storage fill:#f3e5f5
    
    class ES1,ES2,ES3,ES4 source
    class EB,EP processing
    class EC1,EC2,EC3,EC4 consumer
    class DS1,DS2,DS3,DS4 storage
```

## 🌍 Deployment Diagram

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[NGINX<br/>Load Balancer<br/>Port: 80/443]
        end
        
        subgraph "Application Tier"
            subgraph "Node 1"
                N1_WEB[Web App]
                N1_API[API Gateway]
                N1_MS[Market Service]
            end
            
            subgraph "Node 2"
                N2_WEB[Web App]
                N2_API[API Gateway]
                N2_US[User Service]
            end
            
            subgraph "Node 3"
                N3_TE[Trading Engine]
                N3_AS[Analysis Service]
            end
        end
        
        subgraph "Data Tier"
            subgraph "Database Cluster"
                DB_PRIMARY[(PostgreSQL<br/>Primary)]
                DB_REPLICA1[(PostgreSQL<br/>Replica 1)]
                DB_REPLICA2[(PostgreSQL<br/>Replica 2)]
            end
            
            subgraph "Cache Cluster"
                REDIS_1[(Redis Node 1)]
                REDIS_2[(Redis Node 2)]
                REDIS_3[(Redis Node 3)]
            end
        end
        
        subgraph "Monitoring"
            PROM[Prometheus<br/>Metrics]
            GRAF[Grafana<br/>Dashboards]
            ELK[ELK Stack<br/>Logging]
        end
    end
    
    subgraph "External Services"
        CDN[CloudFlare CDN]
        EXCHANGES[Exchanges<br/>Binance, Gate.io]
        BACKUP[AWS S3<br/>Backups]
    end
    
    %% Load Balancer Connections
    CDN --> LB
    LB --> N1_WEB
    LB --> N2_WEB
    LB --> N1_API
    LB --> N2_API
    
    %% Service Connections
    N1_API --> N1_MS
    N1_API --> N2_US
    N2_API --> N3_TE
    N2_API --> N3_AS
    
    %% Database Connections
    N1_MS --> DB_PRIMARY
    N2_US --> DB_PRIMARY
    N3_TE --> DB_PRIMARY
    N3_AS --> DB_REPLICA1
    
    DB_PRIMARY --> DB_REPLICA1
    DB_PRIMARY --> DB_REPLICA2
    
    %% Cache Connections
    N1_MS --> REDIS_1
    N2_US --> REDIS_2
    N3_TE --> REDIS_3
    
    %% External Connections
    N1_MS --> EXCHANGES
    N3_TE --> EXCHANGES
    DB_PRIMARY --> BACKUP
    
    %% Monitoring Connections
    N1_API --> PROM
    N2_API --> PROM
    N3_TE --> PROM
    PROM --> GRAF
    
    %% Styling
    classDef loadbalancer fill:#e3f2fd
    classDef app fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef monitoring fill:#f3e5f5
    classDef external fill:#fce4ec
    
    class LB loadbalancer
    class N1_WEB,N1_API,N1_MS,N2_WEB,N2_API,N2_US,N3_TE,N3_AS app
    class DB_PRIMARY,DB_REPLICA1,DB_REPLICA2,REDIS_1,REDIS_2,REDIS_3 data
    class PROM,GRAF,ELK monitoring
    class CDN,EXCHANGES,BACKUP external
```

## 📈 Scalability Diagram

```mermaid
graph TB
    subgraph "Auto-Scaling Groups"
        subgraph "Frontend Tier (Auto-Scale: 2-10)"
            FE1[Frontend Instance 1]
            FE2[Frontend Instance 2]
            FE_N[Frontend Instance N]
        end
        
        subgraph "API Tier (Auto-Scale: 3-20)"
            API1[API Gateway 1]
            API2[API Gateway 2]
            API_N[API Gateway N]
        end
        
        subgraph "Service Tier (Auto-Scale: 2-15)"
            MS1[Market Service 1]
            MS2[Market Service 2]
            TE1[Trading Engine 1]
            TE2[Trading Engine 2]
        end
    end
    
    subgraph "Data Tier (Fixed + Read Replicas)"
        DB_M[(PostgreSQL Master)]
        DB_R1[(Read Replica 1)]
        DB_R2[(Read Replica 2)]
        DB_RN[(Read Replica N)]
        
        REDIS_CLUSTER[(Redis Cluster<br/>6 Nodes)]
    end
    
    subgraph "Load Balancers"
        ALB[Application Load Balancer]
        NLB[Network Load Balancer]
    end
    
    subgraph "Scaling Triggers"
        ST1[CPU > 70%]
        ST2[Memory > 80%]
        ST3[Request Count > 1000/min]
        ST4[Queue Depth > 100]
    end
    
    %% Load Balancing
    ALB --> FE1
    ALB --> FE2
    ALB --> FE_N
    
    NLB --> API1
    NLB --> API2
    NLB --> API_N
    
    %% Service Connections
    API1 --> MS1
    API1 --> TE1
    API2 --> MS2
    API2 --> TE2
    
    %% Database Connections
    MS1 --> DB_M
    MS2 --> DB_R1
    TE1 --> DB_M
    TE2 --> DB_R2
    
    %% Cache Connections
    MS1 --> REDIS_CLUSTER
    MS2 --> REDIS_CLUSTER
    TE1 --> REDIS_CLUSTER
    TE2 --> REDIS_CLUSTER
    
    %% Scaling Triggers
    ST1 -.-> FE_N
    ST2 -.-> API_N
    ST3 -.-> MS2
    ST4 -.-> TE2
    
    %% Styling
    classDef frontend fill:#e3f2fd
    classDef api fill:#e8f5e8
    classDef service fill:#fff3e0
    classDef data fill:#f3e5f5
    classDef loadbalancer fill:#fce4ec
    classDef trigger fill:#ffebee
    
    class FE1,FE2,FE_N frontend
    class API1,API2,API_N api
    class MS1,MS2,TE1,TE2 service
    class DB_M,DB_R1,DB_R2,DB_RN,REDIS_CLUSTER data
    class ALB,NLB loadbalancer
    class ST1,ST2,ST3,ST4 trigger
```

---
*Last updated: 10/08/2025*
*Version: 1.0*
