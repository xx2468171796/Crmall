-- Initialize Multi-Schema for Source Code Fusion
-- Run this script to create all required schemas

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS plane;
CREATE SCHEMA IF NOT EXISTS nocodb;
CREATE SCHEMA IF NOT EXISTS midday;
CREATE SCHEMA IF NOT EXISTS medusa;
CREATE SCHEMA IF NOT EXISTS classroomio;
CREATE SCHEMA IF NOT EXISTS appflowy;

-- Grant permissions to the crmall0125 user
GRANT ALL ON SCHEMA auth TO crmall0125;
GRANT ALL ON SCHEMA plane TO crmall0125;
GRANT ALL ON SCHEMA nocodb TO crmall0125;
GRANT ALL ON SCHEMA midday TO crmall0125;
GRANT ALL ON SCHEMA medusa TO crmall0125;
GRANT ALL ON SCHEMA classroomio TO crmall0125;
GRANT ALL ON SCHEMA appflowy TO crmall0125;

-- Set default search path
ALTER DATABASE crmall0125 SET search_path TO auth, public, plane, nocodb, midday, medusa, classroomio, appflowy;
