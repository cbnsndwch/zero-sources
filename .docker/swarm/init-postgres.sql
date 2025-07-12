-- Initialize databases for Zero CDC and CVR
CREATE DATABASE zero_cdc;
CREATE DATABASE zero_cvr;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE zero_cdc TO zero_user;
GRANT ALL PRIVILEGES ON DATABASE zero_cvr TO zero_user;

-- Connect to CDC database and create necessary tables/extensions
\c zero_cdc;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to CVR database and create necessary tables/extensions  
\c zero_cvr;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";