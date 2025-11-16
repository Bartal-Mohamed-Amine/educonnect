const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@educonnect.com' },
    update: {},
    create: {
      email: 'admin@educonnect.com',
      password: adminPassword,
      name: 'Administrateur EduConnect',
      isStudent: false,
    },
  });

  // Create sample student users
  const studentPassword = await bcrypt.hash('student123', 12);
  const student1 = await prisma.user.upsert({
    where: { email: 'marie.dupont@etudiant.fr' },
    update: {},
    create: {
      email: 'marie.dupont@etudiant.fr',
      password: studentPassword,
      name: 'Marie Dupont',
      university: 'Sorbonne Université',
      fieldOfStudy: 'Informatique',
      yearOfStudy: 2,
      studentId: 'ETU2023001',
      preferredCategories: ['Technology', 'AI', 'Software'],
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'pierre.martin@etudiant.fr' },
    update: {},
    create: {
      email: 'pierre.martin@etudiant.fr',
      password: studentPassword,
      name: 'Pierre Martin',
      university: 'Université Paris Cité',
      fieldOfStudy: 'Économie',
      yearOfStudy: 3,
      studentId: 'ETU2023002',
      preferredCategories: ['Business', 'Grants'],
    },
  });

  // Create sample resources
  const resources = [
    {
      title: 'Certification Google Data Analytics',
      description: 'Cours gratuit de Google pour maîtriser l\'analyse de données avec des outils professionnels. Apprenez SQL, R, Tableau et plus encore.',
      type: 'CERTIFICATE',
      category: 'Technology',
      provider: 'Google',
      url: 'https://coursera.org/learn/google-data-analytics',
      isFree: true,
      deadline: new Date('2024-12-31'),
      duration: '6 mois',
      difficulty: 'BEGINNER',
      rating: 4.8,
    },
    {
      title: 'Bourse d\'Excellence Eiffel 2024',
      description: 'Bourse du gouvernement français pour étudiants internationaux en master et doctorat. Couvre les frais de scolarité et d\'hébergement.',
      type: 'GRANT',
      category: 'Grants',
      provider: 'Campus France',
      url: 'https://campusfrance.org/bourse-eiffel',
      isFree: true,
      deadline: new Date('2024-01-15'),
      location: 'France',
    },
    {
      title: 'Adobe Creative Suite Étudiant',
      description: 'Licence étudiante gratuite pour tous les logiciels Adobe pendant 6 mois. Inclut Photoshop, Illustrator, Premiere Pro et plus.',
      type: 'SOFTWARE',
      category: 'Design',
      provider: 'Adobe',
      url: 'https://adobe.com/education',
      isFree: true,
      deadline: new Date('2024-06-30'),
      duration: '6 mois',
    },
    {
      title: 'Introduction à l\'IA par Microsoft',
      description: 'Cours en ligne gratuit sur les fondamentaux de l\'intelligence artificielle. Apprenez le machine learning, le deep learning et les concepts éthiques.',
      type: 'COURSE',
      category: 'AI',
      provider: 'Microsoft',
      url: 'https://microsoft.com/learn/ai',
      isFree: true,
      duration: '8 semaines',
      difficulty: 'INTERMEDIATE',
      rating: 4.6,
    },
    {
      title: 'Erasmus+ Mobilité Étudiante',
      description: 'Programme d\'échange européen avec bourse complète pour étudier dans une université partenaire.',
      type: 'GRANT',
      category: 'Grants',
      provider: 'Union Européenne',
      url: 'https://erasmus-plus.ec.europa.eu',
      isFree: true,
      deadline: new Date('2024-03-15'),
      location: 'Europe',
    },
    {
      title: 'Visual Studio Code',
      description: 'Éditeur de code gratuit et open-source avec support pour de nombreux langages de programmation et extensions.',
      type: 'SOFTWARE',
      category: 'Technology',
      provider: 'Microsoft',
      url: 'https://code.visualstudio.com',
      isFree: true,
    },
  ];

  for (const resourceData of resources) {
    await prisma.resource.upsert({
      where: { url: resourceData.url },
      update: {},
      create: resourceData,
    });
  }

  // Create sample deals
  const deals = [
    {
      title: 'MacBook Air M2 Étudiant -30%',
      description: 'Réduction exclusive pour étudiants sur le nouvel MacBook Air M2. Preuve d\'inscription requise.',
      company: 'Apple',
      category: 'Technology',
      discount: '30%',
      originalPrice: 1299,
      discountedPrice: 909,
      validUntil: new Date('2024-12-31'),
      requirements: ['Carte étudiante valide', '18-25 ans'],
      verified: true,
    },
    {
      title: 'Forfait Étudiant Free Mobile',
      description: 'Forfait mobile 100Go pour étudiants avec roaming international inclus.',
      company: 'Free Mobile',
      category: 'Telecom',
      discount: '50%',
      originalPrice: 19.99,
      discountedPrice: 9.99,
      validUntil: new Date('2024-06-30'),
      requirements: ['Justificatif étudiant', 'RIB'],
      verified: true,
    },
    {
      title: 'Repas Étudiant -50%',
      description: 'Menu étudiant complet avec entrée, plat, dessert à prix réduit dans les restaurants CROUS.',
      company: 'CROUS',
      category: 'Food',
      discount: '50%',
      originalPrice: 8.50,
      discountedPrice: 4.25,
      validUntil: new Date('2024-12-31'),
      requirements: ['Carte étudiante'],
      verified: true,
    },
    {
      title: 'Suite Adobe Creative Cloud',
      description: 'Suite Creative Cloud complète à tarif étudiant réduit. Inclut tous les logiciels Adobe.',
      company: 'Adobe',
      category: 'Software',
      discount: '60%',
      originalPrice: 60.49,
      discountedPrice: 23.99,
      validUntil: new Date('2024-08-31'),
      requirements: ['Email universitaire', 'Justificatif inscription'],
      verified: true,
    },
  ];

  for (const dealData of deals) {
    await prisma.deal.upsert({
      where: { 
        title_company: {
          title: dealData.title,
          company: dealData.company,
        }
      },
      update: {},
      create: dealData,
    });
  }

  // Create sample community posts
  const posts = [
    {
      content: 'Quelqu\'un a déjà utilisé la bourse d\'excellence Eiffel ? Je cherche des conseils pour ma candidature en master. Merci !',
      category: 'Bourses',
      authorId: student1.id,
    },
    {
      content: 'À partager : Free Mobile fait 50% de réduction sur leurs forfaits pour les étudiants jusqu\'à fin juin !',
      category: 'Deals',
      authorId: student2.id,
    },
    {
      content: 'Conseil pour les étudiants en informatique : la certification Google Data Analytics est gratuite et super bien reconnue dans le milieu pro.',
      category: 'Cours',
      authorId: student1.id,
    },
  ];

  for (const postData of posts) {
    await prisma.post.create({
      data: postData,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@educonnect.com / admin123');
  console.log('Student users: marie.dupont@etudiant.fr / student123');
  console.log('Student users: pierre.martin@etudiant.fr / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });