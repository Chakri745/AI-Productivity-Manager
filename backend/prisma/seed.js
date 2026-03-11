import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dataPath = path.join(__dirname, "mockEvents.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const events = JSON.parse(raw);

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        id: event.id,
        userId: event.userId,
        type: event.type, // string is fine (enum in DB)
        title: event.title,
        timestamp: new Date(event.timestamp),
        metadata: event.metadata ?? {},
      },
    });
  }

  console.log(`Seeded ${events.length} activity events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
