import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjects = [
  // Academic subjects
  { slug: "mathematics", name: "Mathematics", category: "ACADEMIC" },
  { slug: "science", name: "Science", category: "ACADEMIC" },
  { slug: "physics", name: "Physics", category: "ACADEMIC", parentSlug: "science" },
  { slug: "chemistry", name: "Chemistry", category: "ACADEMIC", parentSlug: "science" },
  { slug: "biology", name: "Biology", category: "ACADEMIC", parentSlug: "science" },
  { slug: "english", name: "English", category: "ACADEMIC" },
  { slug: "hindi", name: "Hindi", category: "ACADEMIC" },
  { slug: "kannada", name: "Kannada", category: "ACADEMIC" },
  { slug: "social-studies", name: "Social Studies", category: "ACADEMIC" },
  { slug: "history", name: "History", category: "ACADEMIC", parentSlug: "social-studies" },
  { slug: "geography", name: "Geography", category: "ACADEMIC", parentSlug: "social-studies" },

  // Competitive subjects
  { slug: "mental-ability", name: "Mental Ability", category: "COMPETITIVE" },
  { slug: "reasoning", name: "Reasoning", category: "COMPETITIVE" },
  { slug: "general-knowledge", name: "General Knowledge", category: "COMPETITIVE" },

  // Skills
  { slug: "coding", name: "Coding & Programming", category: "SKILLS" },
  { slug: "public-speaking", name: "Public Speaking", category: "SKILLS" },
  { slug: "english-communication", name: "English Communication", category: "SKILLS" },

  // Creative
  { slug: "music", name: "Music", category: "CREATIVE" },
  { slug: "dance", name: "Dance", category: "CREATIVE" },
  { slug: "drawing", name: "Drawing & Painting", category: "CREATIVE" },
  { slug: "chess", name: "Chess", category: "CREATIVE" },

  // Languages
  { slug: "sanskrit", name: "Sanskrit", category: "LANGUAGES" },
  { slug: "french", name: "French", category: "LANGUAGES" },
  { slug: "german", name: "German", category: "LANGUAGES" },

  // Sports
  { slug: "yoga", name: "Yoga", category: "SPORTS" },
];

async function main() {
  console.log("Seeding subjects...");

  // Create parent subjects first, then children
  const parentMap = new Map<string, string>();

  for (const s of subjects) {
    if (!s.parentSlug) {
      const existing = await prisma.subject.findUnique({ where: { slug: s.slug } });
      if (existing) {
        parentMap.set(s.slug, existing.id);
        console.log(`  Subject '${s.slug}' already exists, skipping.`);
        continue;
      }
      const created = await prisma.subject.create({
        data: {
          slug: s.slug,
          name: s.name,
          category: s.category as any,
          isActive: true,
        },
      });
      parentMap.set(s.slug, created.id);
      console.log(`  Created subject: ${s.slug}`);
    }
  }

  // Create child subjects
  for (const s of subjects) {
    if (s.parentSlug) {
      const parentId = parentMap.get(s.parentSlug);
      if (!parentId) {
        console.warn(`  Parent '${s.parentSlug}' not found for '${s.slug}', skipping.`);
        continue;
      }
      const existing = await prisma.subject.findUnique({ where: { slug: s.slug } });
      if (existing) {
        console.log(`  Subject '${s.slug}' already exists, skipping.`);
        continue;
      }
      await prisma.subject.create({
        data: {
          slug: s.slug,
          name: s.name,
          category: s.category as any,
          parentSubjectId: parentId,
          isActive: true,
        },
      });
      console.log(`  Created child subject: ${s.slug}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });