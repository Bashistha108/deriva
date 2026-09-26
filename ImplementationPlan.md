# DERIVA — MASTER IMPLEMENTATION SPECIFICATION

## 1. ROLE AND OBJECTIVE

You are implementing **Deriva**, a professional multi-user **Options Learning + Simulated Options Trading Platform**.

This is a serious Java/Spring Boot learning project. The objective is to build a maintainable, production-style modular monolith while teaching and demonstrating:

* Java 21
* Spring Boot
* Spring MVC
* Spring Data JPA
* Hibernate
* Spring Security
* PostgreSQL
* Liquibase
* Maven
* Maven multi-module projects
* REST APIs
* WebSockets
* TypeScript
* React
* Next.js
* HTML/CSS
* JUnit 5
* AssertJ
* Mockito
* Spring Boot Test
* Testcontainers
* Docker
* Docker Compose
* Git
* GitHub
* GitHub Actions
* logging
* observability
* financial-domain modelling
* options mathematics
* database design
* concurrency
* transactional consistency

The final system must be a **modular monolith**.

Do NOT introduce microservices.

Do NOT introduce Kafka, Redis, Kubernetes, GraphQL, Elasticsearch, or other unnecessary infrastructure.

The system must be designed so that these technologies could theoretically be introduced later without forcing a complete rewrite, but they are NOT part of the initial implementation.

---

# 2. MOST IMPORTANT IMPLEMENTATION RULE

This specification is the source of truth.

Do NOT silently invent financial, database, security, business, or architectural rules.

If something is genuinely unspecified and the decision could affect:

* financial correctness
* database structure
* API compatibility
* security
* concurrency
* accounting
* simulation behaviour
* option pricing
* settlement
* future architecture

then STOP at that point and ask for clarification.

Do not make a hidden assumption and continue.

For minor implementation details that do not affect domain behaviour, use normal professional engineering judgement.

---

# 3. IMPLEMENTATION PROCESS

Implement the project **phase by phase**.

Do NOT attempt to implement the whole system in one operation.

For every phase:

1. Inspect the existing repository.
2. Understand the current architecture.
3. Implement only the requested phase.
4. Run compilation.
5. Run relevant tests.
6. Verify database migrations if applicable.
7. Verify architecture/module boundaries.
8. Verify previously established invariants.
9. Fix problems before proceeding.
10. Provide a concise summary of:

* what was implemented
* files/modules changed
* tests executed
* current status
* any unresolved issue

Do not proceed to a later phase if an earlier phase is broken.

Never destroy existing working functionality merely to simplify implementation.

---

# 4. PROJECT ARCHITECTURE

Use a **modular monolith**.

The backend must be a Maven multi-module project.

The conceptual module structure is:

```text
deriva/
├── backend/
│   ├── deriva-domain/
│   ├── deriva-application/
│   ├── deriva-market/
│   ├── deriva-trading/
│   ├── deriva-learning/
│   ├── deriva-risk/
│   ├── deriva-persistence/
│   ├── deriva-api/
│   └── deriva-bootstrap/
│
└── frontend/
    └── Next.js application
```

The exact Maven dependency graph must be designed carefully.

Avoid circular module dependencies.

The domain must not depend on the web layer.

The domain must not depend on infrastructure-specific implementation details unless explicitly justified.

The API layer must not contain financial business logic.

The persistence layer must not contain business decisions.

The application layer coordinates use cases.

The domain layer owns domain rules.

---

# 5. TECHNOLOGY STACK

## Backend

Use:

* Java 21
* Spring Boot
* Spring MVC
* Spring Data JPA
* Hibernate
* Spring Security
* Bean Validation
* PostgreSQL
* Liquibase
* Maven
* SLF4J
* Logback
* Spring Boot Actuator
* OpenAPI/Swagger

## Frontend

Use:

* TypeScript
* React
* Next.js
* HTML
* CSS

Use a suitable charting library for:

* payoff graphs
* portfolio charts
* price charts

Do not introduce unnecessary frontend frameworks.

## Testing

Use:

* JUnit 5
* AssertJ
* Mockito
* Spring Boot Test
* Testcontainers

## Infrastructure

Use:

* Git
* GitHub
* Docker
* Docker Compose
* GitHub Actions

---

# 6. CORE DOMAINS

The application has five major domains.

## 6.1 User and Authentication

Responsible for:

* registration
* login
* logout
* authentication
* authorization
* roles
* password management
* user preferences

## 6.2 Learning

Responsible for:

* courses
* sections
* lessons
* strategies
* strategy templates
* lesson progress
* admin content management

## 6.3 Market Simulation

Responsible for:

* simulated stocks
* simulated ETFs
* market factors
* sector factors
* stock prices
* volatility
* volume
* market regimes
* market sessions
* simulation clock
* simulation runs
* market ticks

## 6.4 Trading and Portfolio

Responsible for:

* orders
* executions
* cash
* buying power
* positions
* portfolio valuation
* P&L
* assignment
* expiration
* settlement

## 6.5 Risk and Analysis

Responsible for:

* Black-Scholes pricing
* Greeks
* implied volatility
* payoff calculations
* scenario analysis
* portfolio Greeks
* saved analyses

---

# 7. DATABASE PRINCIPLES

PostgreSQL is the persistent source of truth.

Liquibase manages all schema changes.

Never manually modify the schema outside Liquibase migrations.

Use database constraints in addition to application validation.

Use:

* UUID for users and business entities
* BIGINT/BIGSERIAL for high-volume time-series/reference data

Do not use Java `double` for monetary amounts.

Use `BigDecimal` for:

* prices
* premiums
* cash
* P&L
* rates
* monetary values

Use PostgreSQL `NUMERIC` for financial values.

Historical records should be treated as immutable.

---

# 8. USER DATABASE

## users

Fields:

```text
id UUID PRIMARY KEY
username VARCHAR UNIQUE NOT NULL
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
role VARCHAR NOT NULL
enabled BOOLEAN NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
last_login_at TIMESTAMP NULL
```

Roles:

```text
USER
ADMIN
```

Never expose password hashes through APIs.

---

## user_preferences

Fields:

```text
user_id UUID PRIMARY KEY
base_currency VARCHAR NOT NULL
timezone VARCHAR NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

Default timezone:

```text
Europe/Berlin
```

---

## password_reset_tokens

Fields:

```text
id UUID PRIMARY KEY
user_id UUID NOT NULL
token_hash VARCHAR NOT NULL
expires_at TIMESTAMP NOT NULL
used_at TIMESTAMP NULL
created_at TIMESTAMP NOT NULL
```

Never store reset tokens in plaintext.

---

# 9. MARKET UNIVERSE

The simulated market contains:

* exactly 100 stocks
* sector ETFs
* one overall market ETF

The initial sectors are:

```text
TECHNOLOGY
HEALTHCARE
CONSUMER_GOODS
EXTRA
```

All users share the same market universe.

Users do NOT receive separate simulated prices.

Each user receives an independent portfolio.

---

# 10. SECTORS TABLE

## sectors

Fields:

```text
id BIGINT PRIMARY KEY
code VARCHAR UNIQUE NOT NULL
name VARCHAR NOT NULL
description TEXT
```

---

# 11. INSTRUMENTS TABLE

## instruments

Fields:

```text
id BIGINT PRIMARY KEY
symbol VARCHAR UNIQUE NOT NULL
name VARCHAR NOT NULL
instrument_type VARCHAR NOT NULL
sector_id BIGINT NULL
active BOOLEAN NOT NULL
initial_price NUMERIC NOT NULL
created_at TIMESTAMP NOT NULL
```

Instrument types:

```text
STOCK
ETF
```

Stocks belong to a sector.

The overall market ETF may have no normal sector.

The symbol prefix may be used for naming:

```text
Txxx = Technology
Hxxx = Healthcare
Cxxx = Consumer Goods
Exxx = Extra
```

However, the symbol prefix is NOT authoritative.

`sector_id` is the source of truth.

---

# 12. INSTRUMENT SIMULATION PARAMETERS

Create:

## instrument_simulation_parameters

Fields should include:

```text
instrument_id
base_volatility
drift
market_beta
sector_beta
liquidity_factor
average_volume
price_floor
price_ceiling
jump_probability
jump_size_factor
enabled
```

These values control simulation behaviour.

Do not mix simulation parameters with the instrument identity itself.

---

# 13. SIMULATION RUNS

Create:

## simulation_runs

Fields:

```text
id UUID PRIMARY KEY
seed BIGINT NOT NULL
status VARCHAR NOT NULL
started_at TIMESTAMP NULL
ended_at TIMESTAMP NULL
created_at TIMESTAMP NOT NULL
```

Statuses:

```text
CREATED
RUNNING
PAUSED
COMPLETED
FAILED
RESET
```

A simulation run represents one reproducible simulated market history.

---

# 14. SIMULATION STATE

Create:

## simulation_state

Fields:

```text
id UUID PRIMARY KEY
simulation_run_id UUID NOT NULL
current_simulated_timestamp TIMESTAMP NOT NULL
current_market_session_id BIGINT NULL
last_completed_tick_id BIGINT NULL
status VARCHAR NOT NULL
updated_at TIMESTAMP NOT NULL
```

The backend owns the simulation clock.

The frontend must NEVER control simulation time.

---

# 15. MARKET CONFIGURATION

Create:

## market_configurations

Fields:

```text
id BIGINT PRIMARY KEY
risk_free_rate NUMERIC NOT NULL
calculation_interval_seconds INTEGER NOT NULL
live_update_interval_seconds INTEGER NOT NULL
persistence_interval_seconds INTEGER NOT NULL
market_open_time TIME NOT NULL
market_close_time TIME NOT NULL
settlement_start_time TIME NOT NULL
settlement_end_time TIME NOT NULL
timezone VARCHAR NOT NULL
market_status VARCHAR NOT NULL
updated_at TIMESTAMP NOT NULL
updated_by UUID NOT NULL
```

Defaults:

```text
risk_free_rate = 0.05
calculation_interval_seconds = 1
live_update_interval_seconds = 1
persistence_interval_seconds = 10
timezone = Europe/Berlin
market_close_time = 02:00
settlement_start_time = 02:00
settlement_end_time = 06:00
```

The market is simulated continuously outside the settlement window according to the configured market schedule.

The exact market opening time must be stored in configuration rather than hard-coded throughout the application.

---

# 16. CONFIGURATION VERSIONING

Market configuration changes must be historically explainable.

Create:

## market_configuration_versions

or an equivalent effective-dated configuration mechanism.

Each configuration must support:

```text
effective_from
effective_until
```

Changing the risk-free rate from 5% to 4%, for example, must not rewrite historical calculations.

Historical calculations must remain explainable using the configuration that was active at the time.

---

# 17. MARKET SESSIONS

Create:

## market_sessions

Fields:

```text
id BIGINT PRIMARY KEY
simulation_run_id UUID NOT NULL
trading_date DATE NOT NULL
opens_at TIMESTAMP NOT NULL
closes_at TIMESTAMP NOT NULL
status VARCHAR NOT NULL
created_at TIMESTAMP NOT NULL
closed_at TIMESTAMP NULL
```

Statuses:

```text
OPEN
CLOSED
SETTLING
SETTLED
```

The market lifecycle is:

```text
OPEN
↓
TRADING
↓
CLOSE
↓
SETTLEMENT
↓
EXPIRATION
↓
NEXT SESSION
```

Use `Europe/Berlin` and the Java timezone database.

Do not manually calculate German UTC offsets.

---

# 18. MARKET TICKS

Create:

## market_ticks

Fields:

```text
id BIGINT PRIMARY KEY
simulation_run_id UUID NOT NULL
simulated_timestamp TIMESTAMP NOT NULL
sequence_number BIGINT NOT NULL
calculation_started_at TIMESTAMP NULL
calculation_completed_at TIMESTAMP NULL
status VARCHAR NOT NULL
```

Each simulation update receives one unique market tick.

A market tick groups related market calculations.

---

# 19. MARKET SIMULATION MODEL

The market must behave approximately like a realistic synthetic market.

Do NOT generate every stock as an independent random number.

Use a factor-based stochastic model.

The baseline price process should be based on geometric Brownian motion.

For a small time step:

$$
S_{t+\Delta t}
=
S_t
\exp
\left[
(\mu-\frac{1}{2}\sigma^2)\Delta t
+
\sigma\sqrt{\Delta t}Z
\right]
$$

where:

* `S` = current price
* `mu` = drift
* `sigma` = volatility
* `dt` = time step
* `Z` = standard normal random variable

But stock returns must also contain correlated factors.

Conceptually:

```text
stock return
=
market factor
+
sector factor
+
idiosyncratic factor
+
optional jump
```

This creates correlation between:

* overall market
* sector ETFs
* stocks in the same sector

---

# 20. MARKET REGIMES

Initial regimes:

```text
CALM
NORMAL
VOLATILE
STRESSED
```

Regimes must persist for a meaningful period.

Do NOT randomly switch regime every tick.

Each regime can affect:

* volatility
* drift
* volume
* jump probability
* jump magnitude

The transition model must be deterministic for a given simulation seed.

---

# 21. SIMULATION RANDOMNESS

Every simulation run has a seed.

The same:

```text
seed
+
initial state
+
configuration
```

must produce reproducible results.

This is required for:

* debugging
* regression tests
* demonstrations
* deterministic simulations

---

# 22. MARKET PRICE SNAPSHOTS

Create:

## market_price_snapshots

Fields:

```text
id BIGINT PRIMARY KEY
market_tick_id BIGINT NOT NULL
simulation_run_id UUID NOT NULL
instrument_id BIGINT NOT NULL
market_session_id BIGINT NOT NULL
timestamp TIMESTAMP NOT NULL
price NUMERIC NOT NULL
previous_price NUMERIC NULL
change NUMERIC NULL
change_percent NUMERIC NULL
volume BIGINT NOT NULL
```

Historical records are immutable.

---

# 23. CURRENT INSTRUMENT MARKET STATE

Create:

## instrument_market_states

This represents current/latest simulation state rather than historical snapshots.

Fields should include:

```text
id
instrument_id
market_tick_id
timestamp
price
volatility
drift
volume
market_regime
```

Do not duplicate historical data unnecessarily.

---

# 24. MARKET DATA FREQUENCY

These three concepts must remain separate:

### Calculation frequency

Default:

```text
1 second
```

The market engine calculates a new state every second.

### Live update frequency

Default:

```text
1 second
```

Latest market state can be sent to connected clients every second.

### Historical persistence frequency

Default:

```text
10 seconds
```

Historical snapshots are persisted every 10 seconds by default.

All three values must be configurable.

Do NOT persist every calculated second by default.

The architecture must support changing these values without redesigning the market engine.

---

# 25. OPTION CONTRACTS

Create:

## option_contracts

Fields:

```text
id BIGINT PRIMARY KEY
underlying_instrument_id BIGINT NOT NULL
option_type VARCHAR NOT NULL
strike_price NUMERIC NOT NULL
expiration_date DATE NOT NULL
contract_multiplier INTEGER NOT NULL
status VARCHAR NOT NULL
created_at TIMESTAMP NOT NULL
```

Option types:

```text
CALL
PUT
```

Statuses:

```text
ACTIVE
EXPIRED
```

Contract definitions are separate from market quotes.

---

# 26. OPTION CONTRACT GENERATION

The system must support configurable:

* expiration count
* strike spacing
* strike range
* minimum strike
* maximum strike
* contract multiplier

Do not generate unlimited contracts.

The active option universe should be deliberately bounded.

Contracts should be generated ahead of their expiration rather than recreated every tick.

---

# 27. OPTION PRICING MODEL

Version 1 uses **European-style options**.

Assignment/exercise occurs at expiration.

Do not implement American early exercise in Version 1.

Use Black-Scholes.

For a call:

$$
C = SN(d_1)-Ke^{-rT}N(d_2)
$$

For a put:

$$
P = Ke^{-rT}N(-d_2)-SN(-d_1)
$$

where:

$$
d_1 =
\frac{\ln(S/K)+(r+\frac{1}{2}\sigma^2)T}
{\sigma\sqrt{T}}
$$

and:

$$
d_2=d_1-\sigma\sqrt{T}
$$

Inputs:

* underlying price
* strike
* time to expiration
* volatility
* risk-free rate

Version 1 assumes:

```text
dividend yield = 0
```

unless a later specification explicitly adds dividends.

---

# 28. GREEKS

Calculate:

* Delta
* Gamma
* Theta
* Vega
* Rho

Define and document units.

For example:

* theta = price change per day
* vega = price change for a 1.00 change in decimal volatility, or another explicitly documented convention

Use one convention consistently throughout the application and frontend.

---

# 29. VOLATILITY MODEL

The market simulation produces a model volatility for each underlying.

The options pricing engine receives that volatility.

Conceptually:

```text
Underlying market state
        ↓
volatility
        ↓
Black-Scholes
        ↓
theoretical option price
```

---

# 30. OPTION QUOTE GENERATION

For every active option:

```text
underlying price
+
volatility
+
rate
+
time to expiration
+
contract
        ↓
theoretical price
        ↓
spread/liquidity model
        ↓
bid / ask
```

The spread model must consider:

* moneyness
* time to expiration
* volatility
* liquidity
* volume
* open interest
* market regime

ATM options should generally have better liquidity and tighter spreads than extremely deep OTM options.

Do not hard-code one identical spread for every contract.

---

# 31. OPTION MARKET SNAPSHOTS

Create:

## option_market_snapshots

Fields:

```text
id BIGINT PRIMARY KEY
market_tick_id BIGINT NOT NULL
option_contract_id BIGINT NOT NULL
market_session_id BIGINT NOT NULL
timestamp TIMESTAMP NOT NULL
underlying_price NUMERIC NOT NULL
theoretical_price NUMERIC NOT NULL
bid_price NUMERIC NOT NULL
ask_price NUMERIC NOT NULL
mid_price NUMERIC NOT NULL
implied_volatility NUMERIC NULL
delta NUMERIC NOT NULL
gamma NUMERIC NOT NULL
theta NUMERIC NOT NULL
vega NUMERIC NOT NULL
rho NUMERIC NOT NULL
volume BIGINT NOT NULL
open_interest BIGINT NOT NULL
```

Optional derived values:

```text
spread
spread_percent
```

---

# 32. IMPLIED VOLATILITY

The system distinguishes between:

### Model volatility

The volatility used to calculate theoretical price.

### Implied volatility

The volatility obtained by solving for the volatility that reproduces an observed market price.

Solve:

$$
ModelPrice(\sigma)=MarketPrice
$$

Use a robust root-finding method such as Brent's method.

Newton-Raphson may be used as an optimization where appropriate.

The IV solver must handle invalid or non-solvable inputs safely.

Do not return meaningless IV values.

---

# 33. OPTION SANITY CHECKS

The pricing/quote engine must enforce:

```text
bid >= 0
ask >= 0
bid <= ask
theoretical_price >= 0
```

For European options with zero dividends, verify put-call parity within an accepted numerical tolerance:

$$
C-P=S-Ke^{-rT}
$$

Also verify appropriate intrinsic-value/lower-bound constraints.

The system must not routinely generate obviously invalid arbitrage relationships.

---

# 34. OPTION VOLUME AND OPEN INTEREST

The simulation must distinguish:

### Volume

Contracts traded during the relevant period.

### Open interest

Currently open contracts.

Open interest should not randomly change every tick without relation to trading.

Trading activity should affect volume and, where appropriate, open interest.

---

# 35. ORDERS

Create:

## orders

Fields:

```text
id UUID PRIMARY KEY
user_id UUID NOT NULL
instrument_id BIGINT NULL
option_contract_id BIGINT NULL
side VARCHAR NOT NULL
order_type VARCHAR NOT NULL
quantity INTEGER NOT NULL
limit_price NUMERIC NULL
idempotency_key VARCHAR NOT NULL
status VARCHAR NOT NULL
submitted_at TIMESTAMP NOT NULL
filled_at TIMESTAMP NULL
cancelled_at TIMESTAMP NULL
version INTEGER NOT NULL
```

Exactly one of:

```text
instrument_id
option_contract_id
```

must be populated.

Use a database/application constraint to enforce this.

---

# 36. ORDER TYPES

Version 1 supports:

```text
MARKET
LIMIT
```

Sides:

```text
BUY
SELL
```

Statuses:

```text
PENDING
OPEN
FILLED
CANCELLED
REJECTED
EXPIRED
```

Version 1 does NOT support partial fills.

An order is either:

* fully filled
* rejected
* cancelled
* expired

Do not introduce partial-fill complexity in Version 1.

---

# 37. ORDER EXECUTION

For market orders:

### Buying

Execute at the current ask.

### Selling

Execute at the current bid.

For stocks and ETFs:

```text
BUY → ask
SELL → bid
```

For options:

```text
BUY → ask
SELL → bid
```

Limit orders execute only when the current simulated quote satisfies the limit condition.

No order may execute using stale market data.

---

# 38. ORDER IDEMPOTENCY

Every order request requires an idempotency key.

The combination of:

```text
user_id + idempotency_key
```

must be unique.

Retrying the same request must not create a second order.

---

# 39. TRADES

Create:

## trades

Fields:

```text
id UUID PRIMARY KEY
order_id UUID NOT NULL
user_id UUID NOT NULL
instrument_id BIGINT NULL
option_contract_id BIGINT NULL
side VARCHAR NOT NULL
quantity INTEGER NOT NULL
execution_price NUMERIC NOT NULL
fees NUMERIC NOT NULL
executed_at TIMESTAMP NOT NULL
market_tick_id BIGINT NOT NULL
```

An order can have at most one trade in Version 1 because partial fills are not supported.

---

# 40. FEES

Version 1 may use a configurable simulated trading fee.

The fee must be represented explicitly in the cash ledger.

Never silently subtract fees without creating a cash transaction.

---

# 41. CASH ACCOUNTS

Create:

## cash_accounts

Fields:

```text
id UUID PRIMARY KEY
user_id UUID UNIQUE NOT NULL
currency VARCHAR NOT NULL
balance NUMERIC NOT NULL
reserved_balance NUMERIC NOT NULL
available_balance NUMERIC NOT NULL
version INTEGER NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

Relationship:

$$
availableBalance = balance - reservedBalance
$$

---

# 42. CASH TRANSACTIONS

Create:

## cash_transactions

Fields:

```text
id UUID PRIMARY KEY
cash_account_id UUID NOT NULL
type VARCHAR NOT NULL
amount NUMERIC NOT NULL
currency VARCHAR NOT NULL
reference_type VARCHAR NULL
reference_id UUID NULL
created_at TIMESTAMP NOT NULL
description TEXT NULL
```

Types:

```text
INITIAL_DEPOSIT
TRADE_PAYMENT
TRADE_RECEIPT
OPTION_ASSIGNMENT
OPTION_EXERCISE
OPTION_EXPIRATION
FEE
```

Cash transactions are immutable.

---

# 43. INITIAL USER BALANCE

Every newly created user receives a configured simulated starting balance.

The amount must be stored as configuration/seed data rather than scattered as a magic number throughout the code.

The initial deposit must create an `INITIAL_DEPOSIT` cash transaction.

---

# 44. BUYING POWER

The system must reserve buying power for open orders.

Before accepting an order:

```text
required buying power
<=
available buying power
```

The order is rejected if this is false.

When the order is:

* filled
* cancelled
* rejected
* expired

the reservation must be released or converted into the appropriate cash movement.

---

# 45. SHORT OPTION COLLATERAL

Version 1 uses a conservative simplified collateral model.

For short puts:

```text
required collateral =
strike × contract multiplier × quantity
```

For short calls:

```text
required collateral =
underlying price × contract multiplier × quantity
```

This is a simulated platform, not a broker margin engine.

Do not implement complex regulatory margin rules in Version 1.

The collateral calculation must be centralized in the risk/trading domain.

---

# 46. POSITIONS

Create:

## positions

Fields:

```text
id UUID PRIMARY KEY
user_id UUID NOT NULL
instrument_id BIGINT NULL
option_contract_id BIGINT NULL
quantity INTEGER NOT NULL
average_entry_price NUMERIC NOT NULL
realized_pnl NUMERIC NOT NULL
opened_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
version INTEGER NOT NULL
```

Exactly one of:

```text
instrument_id
option_contract_id
```

must be populated.

A position quantity may be positive or negative.

Positive:

```text
long
```

Negative:

```text
short
```

Zero positions should be closed rather than retained as active positions.

---

# 47. POSITION ACCOUNTING

Version 1 uses average-cost accounting.

The system must correctly calculate:

* average entry price
* realized P&L
* unrealized P&L

Do not implement tax-lot accounting in Version 1.

---

# 48. POSITION SNAPSHOTS

Create:

## position_snapshots

Fields:

```text
id BIGINT PRIMARY KEY
market_tick_id BIGINT NOT NULL
user_id UUID NOT NULL
position_id UUID NOT NULL
timestamp TIMESTAMP NOT NULL
quantity INTEGER NOT NULL
market_price NUMERIC NOT NULL
market_value NUMERIC NOT NULL
unrealized_pnl NUMERIC NOT NULL
delta NUMERIC NOT NULL
gamma NUMERIC NOT NULL
theta NUMERIC NOT NULL
vega NUMERIC NOT NULL
rho NUMERIC NOT NULL
```

---

# 49. PORTFOLIO SNAPSHOTS

Create:

## portfolio_snapshots

Fields:

```text
id BIGINT PRIMARY KEY
market_tick_id BIGINT NOT NULL
user_id UUID NOT NULL
timestamp TIMESTAMP NOT NULL
cash_balance NUMERIC NOT NULL
reserved_cash NUMERIC NOT NULL
available_cash NUMERIC NOT NULL
portfolio_value NUMERIC NOT NULL
total_equity NUMERIC NOT NULL
realized_pnl NUMERIC NOT NULL
unrealized_pnl NUMERIC NOT NULL
delta NUMERIC NOT NULL
gamma NUMERIC NOT NULL
theta NUMERIC NOT NULL
vega NUMERIC NOT NULL
rho NUMERIC NOT NULL
```

Portfolio equity:

$$
Equity = Cash + MarketValueOfPositions
$$

Use the appropriate sign/value treatment for long and short positions.

---

# 50. EXPIRATION

Options expire according to the market's configured expiration time.

At expiration:

1. Identify contracts expiring.
2. Determine expiration underlying price.
3. Determine ITM/OTM status.
4. Determine which contracts are exercised.
5. Determine assignment of exercised contracts.
6. Create cash/position effects.
7. Mark option contracts expired.
8. Close resulting expired option positions.
9. Record settlement events.
10. Ensure the entire operation is idempotent.

---

# 51. SETTLEMENT

Create:

## settlement_cycles

Fields:

```text
id UUID PRIMARY KEY
simulation_run_id UUID NOT NULL
market_session_id BIGINT NOT NULL
status VARCHAR NOT NULL
started_at TIMESTAMP NOT NULL
completed_at TIMESTAMP NULL
```

Statuses:

```text
STARTED
PROCESSING
COMPLETED
FAILED
```

Settlement must be restart-safe.

Running settlement twice must NOT produce duplicate cash or positions.

---

# 52. ASSIGNMENT

For exercised options, identify eligible short positions.

Assignment must be allocated according to a deterministic simulation rule.

The assignment process must:

* identify eligible shorts
* allocate contracts
* create assignment events
* update positions
* update cash
* preserve auditability

Do not assign contracts to users who do not have eligible short positions.

---

# 53. PHYSICAL SETTLEMENT

Version 1 uses physical settlement.

For a call assignment/exercise:

* underlying shares change hands
* cash changes accordingly

For a put assignment/exercise:

* underlying shares change hands
* cash changes accordingly

The contract multiplier is respected.

After settlement, the option position is closed.

---

# 54. WATCHLISTS

Create:

## watchlists

```text
id UUID
user_id UUID
name VARCHAR
created_at TIMESTAMP
```

Create:

## watchlist_items

```text
watchlist_id UUID
instrument_id BIGINT
position INTEGER
created_at TIMESTAMP
```

Primary key:

```text
watchlist_id + instrument_id
```

Users may only modify their own watchlists.

---

# 55. LEARNING — COURSES

Create:

## courses

Fields:

```text
id UUID PRIMARY KEY
title VARCHAR NOT NULL
slug VARCHAR UNIQUE NOT NULL
description TEXT
status VARCHAR NOT NULL
created_by UUID NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
published_at TIMESTAMP NULL
```

Statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

# 56. COURSE SECTIONS

Create:

## course_sections

Fields:

```text
id UUID PRIMARY KEY
course_id UUID NOT NULL
title VARCHAR NOT NULL
description TEXT
sort_order INTEGER NOT NULL
```

---

# 57. LESSONS

Create:

## lessons

Fields:

```text
id UUID PRIMARY KEY
section_id UUID NOT NULL
title VARCHAR NOT NULL
slug VARCHAR NOT NULL
content TEXT NOT NULL
sort_order INTEGER NOT NULL
status VARCHAR NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
published_at TIMESTAMP NULL
```

---

# 58. CONTENT SECURITY

Lesson content must be safely rendered.

Preferred approach:

```text
Markdown
→ controlled parser
→ sanitized output
```

If HTML is accepted, use a strict allowlist sanitizer.

Never render arbitrary HTML/JavaScript directly.

---

# 59. STRATEGIES

Create:

## strategies

Fields:

```text
id UUID PRIMARY KEY
name VARCHAR NOT NULL
slug VARCHAR UNIQUE NOT NULL
description TEXT
strategy_type VARCHAR NOT NULL
created_by UUID NOT NULL
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
published_at TIMESTAMP NULL
```

---

# 60. STRATEGY LEGS

Create:

## strategy_legs

Fields:

```text
id UUID PRIMARY KEY
strategy_id UUID NOT NULL
option_type VARCHAR NOT NULL
side VARCHAR NOT NULL
strike_offset NUMERIC NOT NULL
quantity_ratio INTEGER NOT NULL
sort_order INTEGER NOT NULL
```

A strategy is an educational template.

It is NOT a user's real portfolio position.

It is NOT a saved analysis.

It is NOT an order.

Keep these concepts separate.

---

# 61. USER LESSON PROGRESS

Create:

## user_lesson_progress

Fields:

```text
user_id UUID
lesson_id UUID
status VARCHAR
started_at TIMESTAMP
completed_at TIMESTAMP NULL
last_viewed_at TIMESTAMP
```

Statuses:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

Primary key:

```text
user_id + lesson_id
```

---

# 62. SAVED ANALYSES

Create:

## saved_analyses

Fields:

```text
id UUID PRIMARY KEY
user_id UUID NOT NULL
name VARCHAR NOT NULL
strategy_id UUID NULL
underlying_instrument_id BIGINT NOT NULL
underlying_price NUMERIC NOT NULL
volatility NUMERIC NOT NULL
risk_free_rate NUMERIC NOT NULL
days_to_expiration INTEGER NOT NULL
created_at TIMESTAMP NOT NULL
```

---

# 63. SAVED ANALYSIS LEGS

Create:

## saved_analysis_legs

Fields:

```text
id UUID PRIMARY KEY
saved_analysis_id UUID NOT NULL
option_type VARCHAR NOT NULL
side VARCHAR NOT NULL
strike NUMERIC NOT NULL
premium NUMERIC NOT NULL
quantity INTEGER NOT NULL
```

---

# 64. PAYOFF ENGINE

The payoff engine must work independently from live trading.

Long call:

$$
P/L=\max(S_T-K,0)-Premium
$$

Short call:

$$
P/L=Premium-\max(S_T-K,0)
$$

Long put:

$$
P/L=\max(K-S_T,0)-Premium
$$

Short put:

$$
P/L=Premium-\max(K-S_T,0)
$$

For multiple legs:

$$
TotalP/L=\sum LegP/L
$$

The engine must calculate:

* payoff curve
* maximum profit where mathematically bounded
* maximum loss where mathematically bounded
* breakeven points
* P&L at selected underlying prices

Do not incorrectly label unlimited-profit or unlimited-loss strategies as having finite maximum values.

---

# 65. RISK ENGINE

The risk engine calculates portfolio Greeks.

For each Greek:

$$
PortfolioGreek =
\sum PositionQuantity \times ContractMultiplier \times OptionGreek
$$

Use the appropriate rules for stocks, ETFs and options.

Portfolio risk must be calculated consistently across:

* dashboard
* portfolio
* analysis
* API
* WebSocket

There must be one authoritative calculation implementation.

---

# 66. SYSTEM EVENTS

Create:

## system_events

Fields:

```text
id UUID PRIMARY KEY
event_type VARCHAR NOT NULL
entity_type VARCHAR NOT NULL
entity_id VARCHAR NOT NULL
occurred_at TIMESTAMP NOT NULL
payload JSONB NULL
```

Examples:

```text
USER_REGISTERED
ORDER_SUBMITTED
ORDER_FILLED
ORDER_CANCELLED
OPTION_EXPIRED
OPTION_ASSIGNED
OPTION_EXERCISED
MARKET_SESSION_STARTED
MARKET_SESSION_CLOSED
SETTLEMENT_STARTED
SETTLEMENT_COMPLETED
CONFIGURATION_CHANGED
ADMIN_ACTION
```

Do not put secrets into event payloads.

---

# 67. DATABASE CONSTRAINTS

Implement database-level constraints wherever practical.

Examples:

```text
quantity != 0
price >= 0
strike > 0
contract_multiplier > 0
risk_free_rate >= 0
volume >= 0
open_interest >= 0
bid >= 0
ask >= 0
bid <= ask
```

Also enforce:

* unique usernames
* unique emails
* unique symbols
* unique idempotency keys per user
* valid foreign keys
* exactly one asset reference in orders
* exactly one asset reference in positions

---

# 68. CONCURRENCY

The application must be safe when multiple users trade simultaneously.

Critical operations must be transactional.

Pay special attention to:

* cash
* reserved cash
* positions
* orders
* trades
* settlement
* assignment

Use optimistic locking where appropriate.

Use pessimistic locking only where necessary for critical account/position mutations.

Never assume two requests cannot arrive simultaneously.

---

# 69. TRANSACTION BOUNDARIES

Trading operations should be atomic.

For example, a successful order execution must not produce:

```text
trade created
BUT
cash not updated
```

or:

```text
cash updated
BUT
position not updated
```

The relevant changes must succeed or fail together.

The exact transaction boundaries must be documented in the service layer.

---

# 70. FINANCIAL INVARIANTS

Implement automated tests for:

### Cash

Initial deposit plus cash transactions must reconcile with account balance.

### Positions

Buys, sells and settlement effects must reconcile with position quantity.

### Equity

```text
equity = cash + position market values
```

### Orders

```text
filled quantity <= ordered quantity
```

### Expiration

Expired options cannot remain active.

### Settlement

A settlement cycle cannot execute twice.

### Quotes

```text
bid <= ask
```

### Prices

```text
price >= 0
```

### Buying power

Available buying power cannot become negative because of accepted orders.

These are domain invariants, not merely unit-test examples.

---

# 71. AUTHENTICATION

Use Spring Security.

The authentication architecture must use secure server-managed authentication.

Prefer secure HTTP-only cookies/session authentication for the web application rather than introducing JWT merely because it is common.

Implement:

* password hashing
* login
* logout
* session invalidation
* session fixation protection
* secure cookie settings
* SameSite configuration
* CSRF protection
* CORS configuration

If the final architecture requires a different mechanism, document the reason before implementation.

---

# 72. AUTHORIZATION

Roles:

```text
USER
ADMIN
```

Users may access:

* their own portfolio
* their own orders
* their own trades
* their own analyses
* their own watchlists
* published learning content

Admins may additionally manage:

* users
* courses
* lessons
* strategies
* market configuration
* instruments
* simulation

Never authorize access based solely on a user ID supplied by the frontend.

---

# 73. PASSWORD SECURITY

Implement:

* strong password hashing
* password reset
* expiring reset tokens
* token invalidation after use
* password change
* session invalidation after password change
* login brute-force protection

---

# 74. RATE LIMITING

Protect at minimum:

* login
* registration
* password reset
* order submission
* analysis endpoints
* WebSocket connections

Use reasonable limits appropriate for a learning application.

---

# 75. WEBSOCKET SECURITY

Use separate conceptual channels:

```text
PUBLIC_MARKET
USER_PORTFOLIO
USER_ORDERS
```

Public market data may be shared.

User portfolio and order data must only be delivered to the authenticated owner.

A client must never be able to subscribe to another user's portfolio simply by changing an ID.

Authentication and authorization must happen server-side.

---

# 76. API DESIGN

Use REST.

The API layer should expose resources such as:

```text
/auth
/users
/instruments
/sectors
/market
/options
/orders
/trades
/positions
/portfolio
/watchlists
/courses
/lessons
/strategies
/analyses
/admin
```

Use DTOs rather than exposing JPA entities directly.

Validate incoming requests.

Do not put business logic into controllers.

---

# 77. API ERROR HANDLING

Use a consistent error format.

Spring's `ProblemDetail` may be used.

Errors should contain useful information such as:

* status
* title
* detail
* timestamp
* request/correlation ID where appropriate

Do not expose internal stack traces to clients.

---

# 78. FRONTEND PAGES

The main application pages are:

```text
/login
/register
/dashboard
/portfolio
/analyse
/learn
/options
/admin
```

Keep the interface professional and relatively compact.

Do not create unnecessary navigation tabs.

---

# 79. DASHBOARD

Display:

* total portfolio value
* cash
* P&L
* portfolio Greeks
* watchlist
* selected market information
* market status

Use charts where they improve understanding.

---

# 80. OPTIONS CHAIN

The options chain should contain:

### Left side

Watchlist:

* stocks
* ETFs

### Main area

Options chain with:

* expiration groups
* strikes
* calls
* puts
* bid
* ask
* IV
* Greeks
* volume
* open interest

Clicking a bid/ask should allow creation of an order.

The chain should update through WebSocket market data.

---

# 81. PORTFOLIO PAGE

Display:

* positions
* quantity
* average price
* current price
* market value
* unrealized P&L
* realized P&L
* Greeks
* cash
* buying power

---

# 82. ANALYSE PAGE

Allow users to:

* select an underlying
* construct option legs
* modify strikes
* modify premiums
* modify volatility
* modify DTE
* modify risk-free rate
* change quantities
* view payoff graph
* view breakeven points
* view P&L
* view Greeks
* save analysis

Changing analysis variables must not modify actual portfolio positions.

---

# 83. LEARN PAGE

Provide:

* course list
* search
* filters
* course sections
* lessons
* strategy content
* progress indicators

Only published content is visible to normal users.

---

# 84. ADMIN PAGE

Admins can manage:

### Users

* view
* enable/disable
* role management

### Learning

* courses
* sections
* lessons
* strategies
* publishing

### Market

* instruments
* simulation parameters
* market configuration

### Simulation

* start
* pause
* resume
* reset
* inspect state

Every important admin action must be auditable.

---

# 85. OBSERVABILITY

Use Spring Boot Actuator.

Provide:

* health
* readiness
* liveness
* useful application metrics

Logging should include useful correlation identifiers such as:

* request ID
* order ID
* trade ID
* market tick ID
* simulation run ID

Never log:

* passwords
* password reset tokens
* session secrets
* authentication credentials

---

# 86. HISTORICAL DATA SCALABILITY

High-volume tables include:

* market_price_snapshots
* option_market_snapshots
* position_snapshots
* portfolio_snapshots
* market_ticks

Design these tables with scalability in mind.

Use appropriate:

* indexes
* composite indexes
* time-based PostgreSQL partitioning where justified
* BRIN indexes for large time-series tables where appropriate

Do not create indexes blindly.

Measure query patterns.

The architecture must support large historical datasets without assuming unlimited storage.

---

# 87. MARKET TICK PROCESSING

A market tick conceptually follows:

```text
1. Advance simulation clock.
2. Determine market/session state.
3. Generate overall market factor.
4. Generate sector factors.
5. Generate stock/ETF movements.
6. Update instrument market state.
7. Calculate option volatility.
8. Calculate option theoretical values.
9. Generate option bid/ask.
10. Calculate option Greeks.
11. Calculate implied volatility where possible.
12. Process executable orders.
13. Update trades.
14. Update cash.
15. Update positions.
16. Calculate affected portfolio state.
17. Publish live market updates.
18. Persist historical snapshots when persistence interval is reached.
```

Do not necessarily execute all of these steps in one giant database transaction.

Define transaction boundaries carefully.

---

# 88. CRASH RECOVERY

The application must recover safely after restart.

Persist enough information to know:

* active simulation run
* current simulation timestamp
* active market session
* last completed tick
* current market state
* settlement state

A restart must not:

* duplicate trades
* duplicate cash movements
* duplicate assignment
* duplicate settlement
* reset the market unexpectedly

---

# 89. SIMULATION RESET

Resetting the simulation must be an explicit operation.

Do not simply delete random tables.

A simulation run should provide isolation between different simulated histories.

The system should support:

```text
start new simulation run
pause
resume
complete
reset/create new run
```

Historical runs should remain distinguishable.

---

# 90. DOCKER

Provide Docker configuration for local development.

At minimum:

```text
PostgreSQL
Backend
Frontend
```

Use Docker Compose.

The application should use environment variables for configuration.

Do not hard-code passwords or secrets.

---

# 91. CI/CD

Create GitHub Actions workflows.

At minimum:

```text
checkout
↓
setup Java
↓
build
↓
unit tests
↓
integration tests
↓
Testcontainers
↓
quality checks
↓
package
```

Frontend should have its own:

```text
install
↓
lint
↓
test/build
```

workflow as appropriate.

---

# 92. LIQUIBASE

Every schema change must use Liquibase.

Migrations should be logically organized.

Do not edit already-applied migrations.

Create new migrations for changes.

Include:

* tables
* indexes
* foreign keys
* constraints
* seed/reference data where appropriate

---

# 93. TESTING PYRAMID

## Unit tests

Test pure business logic:

* Black-Scholes
* Greeks
* IV solver
* payoff calculations
* P&L
* buying power
* market simulation
* spread calculation
* regime transitions
* settlement calculations

## Integration tests

Test:

* repositories
* services
* transactions
* REST APIs
* authentication
* trading workflows
* settlement

## Testcontainers

Use PostgreSQL Testcontainers for database integration tests.

Do not replace every test with an integration test.

---

# 94. FRONTEND TESTING

Test important frontend behaviour such as:

* login forms
* options chain rendering
* order forms
* payoff graph inputs
* portfolio calculations/display
* learning navigation

Do not duplicate authoritative financial calculations in the frontend.

The backend remains authoritative.

---

# 95. FINANCIAL CALCULATION OWNERSHIP

Financial calculations must have one authoritative implementation.

The frontend may visualize results.

It must not independently invent different:

* P&L
* Greeks
* option prices
* payoff
* buying power

If a calculation is duplicated for UI responsiveness, its rules must be identical and tested against backend results.

---

# 96. SEED DATA

Create stable initial data for:

* four sectors
* 100 stocks
* sector ETFs
* overall market ETF
* simulation parameters
* initial market configuration
* optional initial admin account through secure configuration

Instrument identifiers and symbols must remain stable between application restarts.

Do not randomly regenerate the instrument universe every startup.

---

# 97. CODE QUALITY

Follow professional Java practices.

Use:

* clear naming
* small focused classes
* meaningful interfaces
* immutable value objects where appropriate
* records where appropriate
* constructor injection
* package-private implementation details where useful
* clear domain boundaries

Avoid:

* giant service classes
* giant controllers
* static global state
* unnecessary inheritance
* primitive obsession where domain value objects provide real value
* magic numbers
* duplicated financial formulas

---

# 98. MONEY AND PRECISION

Never use:

```java
double
```

for monetary values.

Use:

```java
BigDecimal
```

Define consistent:

* scale
* rounding mode
* comparison rules

Do not perform careless `BigDecimal` arithmetic that silently produces inconsistent rounding.

Financial rounding rules must be explicit.

---

# 99. TIME HANDLING

Use timezone-aware date/time types appropriately.

The simulation uses:

```text
Europe/Berlin
```

as its configured market timezone.

Be careful with:

* daylight-saving transitions
* expiration timestamps
* session boundaries
* settlement boundaries
* database timestamps

Do not assume Germany is always UTC+1.

---

# 100. NO HIDDEN FINANCIAL RULES

The following must never be silently invented:

* margin methodology beyond the specified simplified collateral model
* dividends
* American early exercise
* complex tax rules
* regulatory margin
* fractional shares
* partial order fills
* hidden commissions
* hidden slippage
* hidden market holidays
* hidden corporate actions

If a future feature is required, add it explicitly.

---

# 101. INITIAL VERSION BOUNDARIES

Version 1 explicitly does NOT include:

* American early exercise
* complex broker margin
* real market data
* real-money trading
* real brokerage integration
* dividends
* corporate actions
* fractional shares
* partial order fills
* microservices
* Kafka
* Redis
* Kubernetes
* GraphQL
* Elasticsearch

The architecture should allow future additions without requiring a complete rewrite.

---

# 102. DATABASE TABLE INVENTORY

The initial logical database model consists of:

## User

```text
users
user_preferences
password_reset_tokens
```

## Market

```text
sectors
instruments
instrument_simulation_parameters
market_configurations
market_configuration_versions
simulation_runs
simulation_state
market_sessions
market_ticks
market_price_snapshots
instrument_market_states
```

## Options

```text
option_contracts
option_market_snapshots
```

## Trading

```text
orders
trades
cash_accounts
cash_transactions
positions
position_snapshots
portfolio_snapshots
```

## Settlement

```text
settlement_cycles
```

A settlement detail table may be added only if the implementation requires it and its purpose is clearly defined.

## Watchlists

```text
watchlists
watchlist_items
```

## Learning

```text
courses
course_sections
lessons
strategies
strategy_legs
user_lesson_progress
```

## Analysis

```text
saved_analyses
saved_analysis_legs
```

## Audit

```text
system_events
```

---

# 103. IMPLEMENTATION PHASES

Implement in this order.

## PHASE 0 — Repository and architecture inspection (COMPLETED)

Before changing code:

* inspect repository
* inspect existing files
* inspect Git status
* inspect existing Maven configuration
* inspect existing frontend
* identify reusable code
* identify conflicts

Do not overwrite existing code blindly.

---

## PHASE 1 — Project foundation (COMPLETED)

Implement:

* Maven multi-module structure
* Java 21
* Spring Boot
* configuration
* logging
* basic application startup
* frontend Next.js application
* Docker Compose foundation
* GitHub Actions foundation

Result:

The empty application builds and starts correctly.

---

## PHASE 2 — Database foundation (COMPLETED)

Implement:

* PostgreSQL connection
* Liquibase
* base schema
* naming conventions
* common audit timestamps
* constraints
* indexes

Result:

Database starts from an empty environment using Liquibase only.

---

## PHASE 3 — Authentication and users (COMPLETED)

Implement:

* users
* preferences
* registration
* login
* logout
* Spring Security
* password hashing
* roles
* password reset foundation

Result:

A secure user can register and authenticate.

---

## PHASE 4 — Market universe (COMPLETED)

Implement:

* sectors
* instruments
* simulation parameters
* stable seed data

Result:

The application contains the fixed simulated universe.

---

## PHASE 5 — Simulation infrastructure (COMPLETED)

Implement:

* simulation runs
* simulation state
* market sessions
* market ticks
* backend simulation clock
* configuration
* configuration versioning

Result:

The system can start and track a reproducible simulated market.

---

## PHASE 6 — Market simulation (COMPLETED)

Implement:

* market factor
* sector factors
* stock-specific factors
* GBM-based price movement
* volatility
* regimes
* jumps
* volume
* deterministic seed handling

Result:

The market produces realistic correlated synthetic price behaviour.

---

## PHASE 7 — Historical market data (COMPLETED)

Implement:

* current market state
* price snapshots
* persistence interval
* partitioning/index strategy
* historical queries

Result:

Market history is stored without coupling calculation frequency to persistence frequency.

---

## PHASE 8 — Options contracts (COMPLETED)

Implement:

* contract generation
* strike generation
* daily expirations
* contract lifecycle

Result:

The system contains an active options universe.

---

## PHASE 9 — Options mathematics (COMPLETED)

Implement:

* Black-Scholes
* normal distribution functions
* Greeks
* volatility handling
* IV solver
* numerical validation

Result:

The application can correctly price and analyse options.

---

## PHASE 10 — Option market simulation (COMPLETED)

Implement:

* theoretical price
* bid/ask
* spread model
* liquidity
* volume
* open interest
* option snapshots
* no-arbitrage validation

Result:

The options chain behaves like a simulated market rather than a static calculator.

---

## PHASE 11 — Trading (COMPLETED)

Implement:

* orders
* idempotency
* market orders
* limit orders
* execution
* trades
* fees

Result:

Users can execute simulated trades.

---

## PHASE 12 — Cash and buying power (COMPLETED)

Implement:

* cash accounts
* cash ledger
* reservations
* collateral
* transactional accounting

Result:

Users cannot spend unavailable simulated funds.

---

## PHASE 13 — Positions and portfolio (COMPLETED)

Implement:

* positions
* average cost
* realized P&L
* unrealized P&L
* position snapshots
* portfolio snapshots
* portfolio Greeks

Result:

Users have complete portfolio accounting.

---

## PHASE 14 — Expiration and settlement (COMPLETED)

Implement:

* expiration
* ITM determination
* exercise
* assignment
* physical settlement
* settlement cycles
* idempotency
* restart recovery

Result:

Daily option expiration works correctly.

---

## PHASE 15 — Watchlists (COMPLETED)

Implement:

* watchlists
* watchlist items
* user authorization

Result:

Users can maintain their own market watchlists.

---

## PHASE 16 — Learning/CMS (COMPLETED)

Implement:

* courses
* sections
* lessons
* strategies
* strategy legs
* publishing
* sanitization

Result:

Admins can create educational content.

---

## PHASE 17 — Learning progress (COMPLETED)

Implement:

* lesson progress
* completion
* user progress UI

Result:

Users can track their learning.

---

## PHASE 18 — Analysis/payoff engine (COMPLETED)

Implement:

* saved analyses
* strategy legs
* payoff calculations
* breakeven calculations
* scenario analysis

Result:

Users can analyse hypothetical strategies independently of actual trading.

---

## PHASE 19 — Risk analysis

Implement:

* portfolio Greeks
* scenario analysis
* risk aggregation
* risk visualizations

Result:

Users can understand portfolio-level exposure.

---

## PHASE 20 — REST API completion

Implement and standardize:

* DTOs
* validation
* authorization
* API errors
* OpenAPI
* pagination where appropriate

Result:

A complete documented backend API.

---

## PHASE 21 — WebSockets

Implement:

* authenticated connections
* market channels
* portfolio channels
* order channels
* authorization
* live market updates
* reconnect handling

Result:

The frontend receives real-time simulated market data.

---

## PHASE 22 — Frontend

Implement:

* login
* registration
* dashboard
* options chain
* portfolio
* analysis
* learning
* admin

Result:

A complete usable web application.

---

## PHASE 23 — Admin

Implement:

* user management
* learning management
* instrument management
* market configuration
* simulation management
* audit visibility

Result:

Administrators can control the platform.

---

## PHASE 24 — Security hardening

Review:

* authentication
* authorization
* CSRF
* CORS
* cookies
* sessions
* rate limiting
* XSS
* validation
* WebSocket authorization
* IDOR protection
* secret handling

Result:

Security is reviewed across the complete system.

---

## PHASE 25 — Financial invariant testing

Implement comprehensive tests for:

* cash reconciliation
* position reconciliation
* P&L
* buying power
* settlement
* expiration
* Greeks
* pricing
* option bounds
* quote validity
* order idempotency

Result:

Financial correctness is protected by automated tests.

---

## PHASE 26 — Integration testing

Use Testcontainers.

Test complete workflows:

```text
register
→ login
→ deposit
→ view market
→ submit order
→ execute
→ update cash
→ update position
→ calculate portfolio
→ expire option
→ settle
```

Result:

End-to-end backend workflows are verified.

---

## PHASE 27 — Crash recovery

Test:

* restart during market simulation
* restart after market tick
* restart during settlement
* duplicate settlement attempt
* duplicate order request

Result:

The system is restart-safe.

---

## PHASE 28 — Observability

Implement:

* Actuator
* health
* readiness
* liveness
* metrics
* structured/useful logging
* correlation identifiers

Result:

The system can be diagnosed professionally.

---

## PHASE 29 — Docker and local deployment

Complete:

* backend Dockerfile
* frontend Dockerfile
* PostgreSQL Compose setup
* environment configuration
* local startup documentation

Result:

The entire platform can be started consistently.

---

## PHASE 30 — CI/CD

Complete:

* backend build
* backend tests
* integration tests
* frontend build
* quality checks
* packaging

Result:

Every GitHub change is automatically verified.

---

# 104. FINAL ACCEPTANCE CRITERIA

The application is complete only when a normal user can:

1. Register.
2. Log in.
3. View the simulated market.
4. Search/select instruments.
5. Maintain a watchlist.
6. Open an options chain.
7. View expirations.
8. View strikes.
9. View bid/ask.
10. View IV.
11. View Greeks.
12. Submit orders.
13. Execute trades.
14. View positions.
15. View cash.
16. View buying power.
17. View realized/unrealized P&L.
18. View portfolio Greeks.
19. Build a hypothetical strategy.
20. View its payoff graph.
21. Save the analysis.
22. Read educational courses.
23. Track lesson progress.

An administrator must be able to:

1. Manage users.
2. Create courses.
3. Create sections.
4. Create lessons.
5. Create strategies.
6. Publish/archive content.
7. Configure the market.
8. Manage instruments.
9. Manage simulation parameters.
10. Start/pause/resume/reset simulation.
11. Inspect important system events.

The market engine must:

1. Generate reproducible synthetic prices.
2. Generate correlated market behaviour.
3. Generate sector behaviour.
4. Generate volatility.
5. Generate option prices.
6. Generate bid/ask.
7. Calculate Greeks.
8. Calculate IV.
9. Generate volume/open interest.
10. Persist historical state.
11. Process trades.
12. Handle expiration.
13. Handle assignment.
14. Handle settlement.
15. Recover safely after restart.

---

# 105. FINAL ARCHITECTURAL RULE

Do not optimize for the smallest amount of code.

Optimize for:

* correctness
* clear domain boundaries
* maintainability
* testability
* financial consistency
* security
* database integrity
* reproducibility
* understandable Java/Spring architecture

At the same time, do not over-engineer.

The target is a professional **modular monolith**, not a distributed enterprise platform.

Do not introduce infrastructure merely because it is popular.

Every dependency and architectural component must have a clear purpose.

---

# 106. CURSOR EXECUTION RULE

Before beginning implementation, inspect the repository and compare it with this specification.

Then:

1. Identify the current project state.
2. Identify what already exists.
3. Identify conflicts with this specification.
4. Propose the Phase 0 changes.
5. Do not implement later phases prematurely.

After each phase, verify the project before continuing.

If a requirement in this specification conflicts with existing code, do not silently choose one.

Explain the conflict and ask for a decision.

This specification is the authoritative design document for Deriva.
