import { db } from "../src/lib/db";
import { seed } from "../src/lib/seed";
seed()
  .then(() =>
    console.log(
      "Demo catalog ready: 9 resources, 27 lessons, 36 sample reviews.",
    ),
  )
  .finally(() => db.$disconnect());
