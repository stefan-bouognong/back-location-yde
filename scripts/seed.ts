import "dotenv/config";
import bcrypt from "bcryptjs";
import mysql, { type ResultSetHeader } from "mysql2/promise";

const SEED_PASSWORD = "password123";

const img = (n: number) => `https://picsum.photos/seed/yaoundeloc${n}/800/600`;

const seedProperties = [
  {
    title: "Appartement meublé moderne à Bastos",
    type: "apartment" as const,
    style: "modern" as const,
    furnished: "furnished" as const,
    price: 350000,
    neighborhood: "Bastos",
    description:
      "Magnifique appartement meublé de 3 chambres avec salon spacieux, cuisine équipée et balcon avec vue panoramique. Situé dans un quartier résidentiel calme et sécurisé.",
    images: [img(1), img(2)],
    features: [1, 1, 1, 1, 1, 1],
    views: 245,
    contacts: 18,
    is_featured: 1,
    created_at: "2025-03-15",
  },
  {
    title: "Chambre simple à Biyem-Assi",
    type: "room" as const,
    style: "simple" as const,
    furnished: "unfurnished" as const,
    price: 35000,
    neighborhood: "Biyem-Assi",
    description:
      "Chambre propre et bien aérée, idéale pour étudiant ou jeune travailleur. Proche des transports et du marché.",
    images: [img(3), img(4)],
    features: [1, 1, 0, 0, 0, 0],
    views: 89,
    contacts: 7,
    is_featured: 0,
    created_at: "2025-04-01",
  },
  {
    title: "Studio moderne à Mendong",
    type: "studio" as const,
    style: "modern" as const,
    furnished: "furnished" as const,
    price: 120000,
    neighborhood: "Mendong",
    description:
      "Studio moderne entièrement meublé avec coin cuisine et salle de bain privée. Parfait pour un couple ou un professionnel.",
    images: [img(5), img(6)],
    features: [1, 1, 1, 0, 1, 1],
    views: 156,
    contacts: 12,
    is_featured: 1,
    created_at: "2025-03-28",
  },
  {
    title: "Appartement non meublé à Nsimeyong",
    type: "apartment" as const,
    style: "simple" as const,
    furnished: "unfurnished" as const,
    price: 150000,
    neighborhood: "Nsimeyong",
    description:
      "Grand appartement de 2 chambres, salon, cuisine et 2 salles de bain. Carrelage neuf, peinture fraîche.",
    images: [img(7), img(8)],
    features: [1, 1, 0, 1, 0, 1],
    views: 198,
    contacts: 15,
    is_featured: 1,
    created_at: "2025-03-20",
  },
  {
    title: "Chambre moderne meublée à Essos",
    type: "room" as const,
    style: "modern" as const,
    furnished: "furnished" as const,
    price: 55000,
    neighborhood: "Essos",
    description:
      "Chambre moderne meublée avec lit, armoire et table de travail. Salle de bain intérieure. Quartier animé et accessible.",
    images: [img(9), img(10)],
    features: [1, 1, 1, 0, 1, 0],
    views: 112,
    contacts: 9,
    is_featured: 0,
    created_at: "2025-04-03",
  },
  {
    title: "Studio simple à Mvan",
    type: "studio" as const,
    style: "simple" as const,
    furnished: "unfurnished" as const,
    price: 65000,
    neighborhood: "Mvan",
    description:
      "Studio simple et spacieux, bien situé à proximité du carrefour Mvan. Eau et électricité disponibles en permanence.",
    images: [img(11), img(12)],
    features: [1, 1, 0, 0, 0, 1],
    views: 67,
    contacts: 4,
    is_featured: 0,
    created_at: "2025-04-05",
  },
  {
    title: "Appartement meublé standing à Omnisport",
    type: "apartment" as const,
    style: "modern" as const,
    furnished: "furnished" as const,
    price: 500000,
    neighborhood: "Omnisport",
    description:
      "Luxueux appartement de 3 chambres, entièrement meublé et équipé. Résidence avec gardien 24h/24, parking privé, groupe électrogène.",
    images: [img(13), img(14)],
    features: [1, 1, 1, 1, 1, 1],
    views: 320,
    contacts: 25,
    is_featured: 1,
    created_at: "2025-03-10",
  },
  {
    title: "Chambre simple à Nkolbisson",
    type: "room" as const,
    style: "simple" as const,
    furnished: "unfurnished" as const,
    price: 25000,
    neighborhood: "Nkolbisson",
    description:
      "Petite chambre abordable proche de l'Université de Yaoundé I. Idéale pour les étudiants avec un petit budget.",
    images: [img(15), img(16)],
    features: [1, 1, 0, 0, 0, 0],
    views: 45,
    contacts: 3,
    is_featured: 0,
    created_at: "2025-04-06",
  },
];

async function main() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined || !DB_NAME) {
    console.error("Missing DB_* in .env");
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  await conn.query("TRUNCATE TABLE favorites");
  await conn.query("TRUNCATE TABLE property_images");
  await conn.query("TRUNCATE TABLE properties");
  await conn.query("TRUNCATE TABLE users");
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  const [ownerRes] = await conn.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, name, phone, whatsapp, role)
     VALUES (?, ?, ?, ?, ?, 'owner')`,
    [
      "owner@test.cm",
      hash,
      "Jean-Pierre Mbarga",
      "+237 699 123 456",
      "+237699123456",
    ],
  );
  const ownerId = ownerRes.insertId;

  await conn.execute(
    `INSERT INTO users (email, password_hash, name, phone, whatsapp, role)
     VALUES (?, ?, ?, ?, ?, 'user')`,
    ["user@test.cm", hash, "Utilisateur Test", "+237 699 000 000", "+237699000000"],
  );

  for (const p of seedProperties) {
    const [f, e, w, pk, s, k] = p.features;
    const [propRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO properties (
        owner_id, title, type, style, furnished, price, location, neighborhood, description,
        feat_water, feat_electricity, feat_wifi, feat_parking, feat_security, feat_kitchen,
        views, contacts, is_featured, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Yaoundé', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        p.title,
        p.type,
        p.style,
        p.furnished,
        p.price,
        p.neighborhood,
        p.description,
        f,
        e,
        w,
        pk,
        s,
        k,
        p.views,
        p.contacts,
        p.is_featured,
        p.created_at,
      ],
    );
    const pid = propRes.insertId;
    let order = 0;
    for (const url of p.images) {
      await conn.execute(
        "INSERT INTO property_images (property_id, url, sort_order) VALUES (?, ?, ?)",
        [pid, url, order++],
      );
    }
  }

  await conn.end();
  console.log("Seed OK. Comptes de test (mot de passe: password123):");
  console.log("  owner@test.cm (propriétaire)");
  console.log("  user@test.cm (locataire)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
