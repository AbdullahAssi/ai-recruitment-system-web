const fs = require("fs");
const path = require("path");

/**
 * Extract data-only SQL from a pg_dump backup file
 * This script removes all schema creation statements and keeps only data insertions
 */

const backupFile = path.join(__dirname, "backup.sql");
const outputFile = path.join(__dirname, "data_only.sql");

console.log("Reading backup file...");
const content = fs.readFileSync(backupFile, "utf-8");

const lines = content.split("\n");
let dataOnlyLines = [];
let inDataSection = false;
let inCopyCommand = false;
let skipCurrentSection = false;

dataOnlyLines.push("-- Data-only restore script");
dataOnlyLines.push("-- Run this AFTER: npx prisma migrate deploy");
dataOnlyLines.push("");
dataOnlyLines.push("-- Disable triggers for faster import");
dataOnlyLines.push("SET session_replication_role = replica;");
dataOnlyLines.push("");
dataOnlyLines.push("BEGIN;");
dataOnlyLines.push("");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip empty lines and most comments
  if (trimmed === "") continue;

  // Skip schema creation statements
  if (
    trimmed.startsWith("CREATE TABLE") ||
    trimmed.startsWith("CREATE TYPE") ||
    trimmed.startsWith("CREATE SEQUENCE") ||
    trimmed.startsWith("ALTER TABLE") ||
    trimmed.startsWith("ALTER TYPE") ||
    trimmed.startsWith("ALTER SEQUENCE") ||
    trimmed.startsWith("CREATE INDEX") ||
    trimmed.startsWith("ALTER DEFAULT") ||
    trimmed.startsWith("ALTER SCHEMA") ||
    trimmed.startsWith("SET ") ||
    trimmed.startsWith("SELECT pg_catalog") ||
    trimmed.startsWith("REVOKE") ||
    trimmed.startsWith("COMMENT ON")
  ) {
    skipCurrentSection = true;
    continue;
  }

  // Detect data sections
  if (trimmed.includes("Data for Name:")) {
    // Skip _prisma_migrations table
    if (trimmed.includes("_prisma_migrations")) {
      skipCurrentSection = true;
      console.log("Skipping _prisma_migrations table data");
      continue;
    }

    skipCurrentSection = false;
    inDataSection = true;
    dataOnlyLines.push("");
    dataOnlyLines.push(line);
    console.log("Found data section:", trimmed);
    continue;
  }

  // Detect COPY commands
  if (trimmed.startsWith("COPY public.") && trimmed.includes("FROM stdin")) {
    if (!skipCurrentSection) {
      inCopyCommand = true;
      dataOnlyLines.push(line);
      console.log("Starting COPY command:", trimmed.substring(0, 50) + "...");
    }
    continue;
  }

  // End of COPY data
  if (trimmed === "\\." && inCopyCommand) {
    if (!skipCurrentSection) {
      dataOnlyLines.push(line);
      console.log("Ending COPY command");
    }
    inCopyCommand = false;
    inDataSection = false;
    skipCurrentSection = false;
    continue;
  }

  // Include data lines during COPY
  if (inCopyCommand && !skipCurrentSection) {
    dataOnlyLines.push(line);
  }

  // Include comment lines in data sections
  if (inDataSection && !inCopyCommand && trimmed.startsWith("--")) {
    if (!skipCurrentSection) {
      dataOnlyLines.push(line);
    }
  }
}

dataOnlyLines.push("");
dataOnlyLines.push("COMMIT;");
dataOnlyLines.push("");
dataOnlyLines.push("-- Re-enable triggers");
dataOnlyLines.push("SET session_replication_role = DEFAULT;");
dataOnlyLines.push("");
dataOnlyLines.push("-- Analyze tables for optimal query performance");
dataOnlyLines.push("ANALYZE;");
dataOnlyLines.push("");
dataOnlyLines.push("-- Update sequence values to avoid conflicts");
dataOnlyLines.push(
  "SELECT setval(pg_get_serial_sequence('public.email_templates', 'id'), COALESCE(MAX(id), 1)) FROM public.email_templates;"
);

const output = dataOnlyLines.join("\n");

fs.writeFileSync(outputFile, output, "utf-8");

console.log(`\n✅ Data-only SQL file created: ${outputFile}`);
console.log(`\nTo restore your database:`);
console.log(`1. Run: npx prisma migrate deploy`);
console.log(`2. Then run data_only.sql in pgAdmin or:`);
console.log(`   psql -d your_database -U your_user -f data_only.sql`);
