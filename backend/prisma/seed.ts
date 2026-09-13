import { PrismaClient, RoleName, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de la base de datos...');

  // 1. Crear / Asegurar Roles
  const roles = [
    { name: RoleName.SUPERADMIN, description: 'Super Administrador con control total del sistema' },
    { name: RoleName.ADMIN, description: 'Administrador del sistema y gestión de operaciones' },
    { name: RoleName.USER, description: 'Usuario estándar / Cliente del servicio' },
    { name: RoleName.MODERATOR, description: 'Moderador de contenido y publicaciones' },
    { name: RoleName.SUPPORT, description: 'Personal de soporte al cliente' },
    { name: RoleName.PROVIDER, description: 'Prestador de servicios verificado' },
    { name: RoleName.COMPANY, description: 'Cuenta corporativa / Empresa de servicios' },
  ];

  const roleMap = new Map<RoleName, number>();

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
    roleMap.set(role.name, role.id);
    console.log(`✓ Rol verificado/creado: ${role.name}`);
  }

  // Credenciales desde variables de entorno
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@conecta360.com.co';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Superadmin123';

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@conecta360.com.co';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';

  // Salt de hash bcrypt
  const saltRounds = 10;

  // 2. Crear SuperAdmin
  const hashedSuperPassword = await bcrypt.hash(superadminPassword, saltRounds);
  const superAdminRole = roleMap.get(RoleName.SUPERADMIN)!;

  const superAdmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      password: hashedSuperPassword,
      roleId: superAdminRole,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: superadminEmail,
      password: hashedSuperPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+573000000001',
      roleId: superAdminRole,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
      profile: {
        create: {
          bio: 'Perfil Administrativo Principal de CONECTA 360',
          city: 'Bogotá',
          department: 'Cundinamarca',
          country: 'Colombia',
        },
      },
    },
    include: { profile: true },
  });

  console.log(`✓ SuperAdmin verificado/creado: ${superAdmin.email}`);

  // 3. Crear Admin
  const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
  const adminRole = roleMap.get(RoleName.ADMIN)!;

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
      roleId: adminRole,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'Operaciones',
      phone: '+573000000002',
      roleId: adminRole,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
      profile: {
        create: {
          bio: 'Perfil de Gestión Operativa de CONECTA 360',
          city: 'Medellín',
          department: 'Antioquia',
          country: 'Colombia',
        },
      },
    },
    include: { profile: true },
  });

  console.log(`✓ Admin verificado/creado: ${admin.email}`);

  // 3.1. Crear Servidor/Proveedor (David Cuero)
  const servidorRoleId = roleMap.get(RoleName.PROVIDER) || 6;
  const hashedServidorPassword = await bcrypt.hash('Servidor123', saltRounds);
  const providerUser = await prisma.user.upsert({
    where: { email: 'david.cuero@conecta360.com.co' },
    update: {
      password: hashedServidorPassword,
      roleId: servidorRoleId,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: 'david.cuero@conecta360.com.co',
      password: hashedServidorPassword,
      firstName: 'David',
      lastName: 'Cuero',
      phone: '+573157894521',
      roleId: servidorRoleId,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
      profile: {
        create: {
          bio: 'Especialista en instalaciones eléctricas residenciales y comerciales en Cali.',
          city: 'Cali',
          department: 'Valle del Cauca',
          country: 'Colombia',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✓ Servidor verificado/creado: ${providerUser.email}`);

  // 3.2. Crear Cliente (Andrea Cuero)
  const clienteRoleId = roleMap.get(RoleName.USER) || 3;
  const hashedClientePassword = await bcrypt.hash('Cliente123', saltRounds);
  const clientUser = await prisma.user.upsert({
    where: { email: 'andrea.cuero@conecta360.com.co' },
    update: {
      password: hashedClientePassword,
      roleId: clienteRoleId,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: 'andrea.cuero@conecta360.com.co',
      password: hashedClientePassword,
      firstName: 'Andrea',
      lastName: 'Cuero',
      phone: '+573124567890',
      roleId: clienteRoleId,
      status: UserStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
      profile: {
        create: {
          bio: 'Cliente de servicios profesionales para el hogar y proyectos en Cali.',
          city: 'Cali',
          department: 'Valle del Cauca',
          country: 'Colombia',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✓ Cliente verificado/creado: ${clientUser.email}`);

  // 4. Categorías de la maqueta y sus servicios
  const categoriesData = [
    {
      name: 'Cerrajería',
      slug: 'cerrajeria',
      description: 'Servicios de apertura de puertas, cambio e instalación de cerraduras.',
      icon: 'wrench',
      requirements: [
        { title: 'Certificación en Cerrajería', type: 'CERTIFICATION', isRequired: true },
      ],
      services: ['Apertura de puertas', 'Cambio de cerraduras', 'Instalación de cerraduras de seguridad'],
    },
    {
      name: 'Electricidad',
      slug: 'electricidad',
      description: 'Instalaciones eléctricas, reparaciones de cortocircuitos y tableros.',
      icon: 'zap',
      requirements: [
        { title: 'Matrícula o Tarjeta Profesional Conte/Copnia', type: 'PROFESSIONAL_CARD', isRequired: true },
      ],
      services: ['Reparación de cortocircuitos', 'Instalación de iluminación LED', 'Mantenimiento de tableros eléctricos'],
    },
    {
      name: 'Tecnología',
      slug: 'tecnologia',
      description: 'Desarrollo web, soporte técnico, redes y bases de datos.',
      icon: 'monitor',
      requirements: [],
      services: ['Desarrollo web y aplicaciones', 'Soporte técnico y mantenimiento', 'Diseño e implementación de bases de datos'],
    },
    {
      name: 'Reparaciones',
      slug: 'reparaciones',
      description: 'Mantenimiento y arreglo de electrodomésticos, estructuras y hogar.',
      icon: 'hammer',
      requirements: [],
      services: ['Reparación de electrodomésticos', 'Carpintería básica', 'Mantenimiento de persianas y puertas'],
    },
    {
      name: 'Educación',
      slug: 'educacion',
      description: 'Clases particulares, tutorías académicas y enseñanza de idiomas.',
      icon: 'graduation-cap',
      requirements: [
        { title: 'Título Profesional o Certificado Docente', type: 'PROFESSIONAL_TITLE', isRequired: true },
      ],
      services: ['Clases de matemáticas y física', 'Tutorías de inglés', 'Refuerzo escolar general'],
    },
    {
      name: 'Diseño',
      slug: 'diseno',
      description: 'Diseño gráfico, branding, diseño editorial y diseño UI/UX.',
      icon: 'palette',
      requirements: [],
      services: ['Diseño de logos e identidad de marca', 'Diseño de interfaces web y móvil', 'Material publicitario y flyers'],
    },
    {
      name: 'Salud',
      slug: 'salud',
      description: 'Atención domiciliaria, fisioterapia, enfermería y cuidado personal.',
      icon: 'heart-pulse',
      requirements: [
        { title: 'Registro Profesional de Salud / RETHUS', type: 'PROFESSIONAL_CARD', isRequired: true },
        { title: 'Documento de Identidad Vigente', type: 'IDENTITY_DOCUMENT', isRequired: true },
      ],
      services: ['Terapia física y rehabilitación', 'Acompañamiento de enfermería', 'Evaluación nutricional'],
    },
    {
      name: 'Otros',
      slug: 'otros',
      description: 'Otros oficios, servicios para eventos, mudanzas y asesorías.',
      icon: 'grid',
      requirements: [],
      services: ['Mudanzas y acarreos', 'Organización de eventos', 'Limpieza profunda de espacios'],
    },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description, icon: cat.icon },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
    });

    for (const req of cat.requirements) {
      const existingReq = await prisma.categoryRequirement.findFirst({
        where: { categoryId: category.id, title: req.title },
      });
      if (!existingReq) {
        await prisma.categoryRequirement.create({
          data: {
            categoryId: category.id,
            title: req.title,
            type: req.type as any,
            isRequired: req.isRequired,
          },
        });
      }
    }

    for (const srvName of cat.services) {
      const srvSlug = srvName.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      await prisma.service.upsert({
        where: { slug: srvSlug },
        update: { name: srvName },
        create: {
          categoryId: category.id,
          name: srvName,
          slug: srvSlug,
        },
      });
    }

    console.log(`✓ Categoría y servicios cargados: ${category.name}`);
  }

  // 5. Crear Prestadores de Servicios Destacados (Modelo Prisma real en MySQL)
  const providerRole = roleMap.get(RoleName.PROVIDER) || roleMap.get(RoleName.USER)!;
  const commonPassword = await bcrypt.hash('Provider123!', saltRounds);

  const providersToSeed = [
    {
      email: 'juan.perez@conecta360.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+593981234567',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Cerrajería',
      hourlyRate: 15.00,
      rating: 4.8,
      totalReviews: 124,
      serviceSlug: 'apertura-de-puertas',
    },
    {
      email: 'carlos.mendoza@conecta360.com',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      phone: '+593982345678',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Electricidad',
      hourlyRate: 20.00,
      rating: 4.7,
      totalReviews: 98,
      serviceSlug: 'reparacion-de-cortocircuitos',
    },
    {
      email: 'ana.torres@conecta360.com',
      firstName: 'Ana',
      lastName: 'Torres',
      phone: '+593983456789',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Tecnología',
      hourlyRate: 25.00,
      rating: 4.9,
      totalReviews: 156,
      serviceSlug: 'desarrollo-web-y-aplicaciones',
    },
    {
      email: 'luis.garcia@conecta360.com',
      firstName: 'Luis',
      lastName: 'García',
      phone: '+593984567890',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Plomería',
      hourlyRate: 18.00,
      rating: 4.6,
      totalReviews: 87,
      serviceSlug: 'mantenimiento-de-persianas-y-puertas',
    },
    {
      email: 'roberto.vaca@conecta360.com',
      firstName: 'Roberto',
      lastName: 'Vaca',
      phone: '+593985678901',
      city: 'Guayaquil',
      department: 'Guayas',
      title: 'Reparaciones',
      hourlyRate: 22.00,
      rating: 4.8,
      totalReviews: 110,
      serviceSlug: 'reparacion-de-electrodomesticos',
    },
    {
      email: 'diana.salazar@conecta360.com',
      firstName: 'Diana',
      lastName: 'Salazar',
      phone: '+593986789012',
      city: 'Cuenca',
      department: 'Azuay',
      title: 'Diseño',
      hourlyRate: 24.00,
      rating: 4.9,
      totalReviews: 142,
      serviceSlug: 'diseno-de-logos-e-identidad-de-marca',
    },
    {
      email: 'esteban.morales@conecta360.com',
      firstName: 'Esteban',
      lastName: 'Morales',
      phone: '+593987890123',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Pintura',
      hourlyRate: 16.00,
      rating: 4.7,
      totalReviews: 79,
      serviceSlug: 'material-publicitario-y-flyers',
    },
    {
      email: 'sofia.cardenas@conecta360.com',
      firstName: 'Sofía',
      lastName: 'Cárdenas',
      phone: '+593988901234',
      city: 'Ambato',
      department: 'Tungurahua',
      title: 'Educación',
      hourlyRate: 18.00,
      rating: 5.0,
      totalReviews: 94,
      serviceSlug: 'clases-de-matematicas-y-fisica',
    },
    {
      email: 'fernando.rios@conecta360.com',
      firstName: 'Fernando',
      lastName: 'Ríos',
      phone: '+593989012345',
      city: 'Guayaquil',
      department: 'Guayas',
      title: 'Carpintería',
      hourlyRate: 20.00,
      rating: 4.8,
      totalReviews: 83,
      serviceSlug: 'carpinteria-basica',
    },
    {
      email: 'valeria.paz@conecta360.com',
      firstName: 'Valeria',
      lastName: 'Paz',
      phone: '+593990123456',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Salud y Bienestar',
      hourlyRate: 30.00,
      rating: 4.9,
      totalReviews: 135,
      serviceSlug: 'refuerzo-escolar-general',
    },
    {
      email: 'gabriel.ortiz@conecta360.com',
      firstName: 'Gabriel',
      lastName: 'Ortiz',
      phone: '+593991234567',
      city: 'Manta',
      department: 'Manabí',
      title: 'Cerrajería Automotriz',
      hourlyRate: 25.00,
      rating: 4.8,
      totalReviews: 67,
      serviceSlug: 'instalacion-de-cerraduras-de-seguridad',
    },
    {
      email: 'camila.benitez@conecta360.com',
      firstName: 'Camila',
      lastName: 'Benítez',
      phone: '+593992345678',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Marketing Digital',
      hourlyRate: 28.00,
      rating: 4.9,
      totalReviews: 118,
      serviceSlug: 'diseno-de-interfaces-web-y-movil',
    },
    {
      email: 'diego.andrade@conecta360.com',
      firstName: 'Diego',
      lastName: 'Andrade',
      phone: '+593993456789',
      city: 'Loja',
      department: 'Loja',
      title: 'Construcción',
      hourlyRate: 17.00,
      rating: 4.6,
      totalReviews: 92,
      serviceSlug: 'mantenimiento-de-persianas-y-puertas',
    },
    {
      email: 'patricia.vega@conecta360.com',
      firstName: 'Patricia',
      lastName: 'Vega',
      phone: '+593994567890',
      city: 'Guayaquil',
      department: 'Guayas',
      title: 'Limpieza Profesional',
      hourlyRate: 14.00,
      rating: 4.8,
      totalReviews: 160,
      serviceSlug: 'soporte-tecnico-y-mantenimiento',
    },
    {
      email: 'javier.paredes@conecta360.com',
      firstName: 'Javier',
      lastName: 'Paredes',
      phone: '+593995678901',
      city: 'Quito',
      department: 'Pichincha',
      title: 'Mecánica Automotriz',
      hourlyRate: 22.00,
      rating: 4.7,
      totalReviews: 74,
      serviceSlug: 'mantenimiento-de-tableros-electricos',
    },
    {
      email: 'lucia.zambrano@conecta360.com',
      firstName: 'Lucía',
      lastName: 'Zambrano',
      phone: '+593996789012',
      city: 'Machala',
      department: 'El Oro',
      title: 'Climatización',
      hourlyRate: 26.00,
      rating: 4.9,
      totalReviews: 105,
      serviceSlug: 'instalacion-de-iluminacion-led',
    },
  ];

  for (const prov of providersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: prov.email },
      update: {
        firstName: prov.firstName,
        lastName: prov.lastName,
        phone: prov.phone,
        status: UserStatus.ACTIVE,
        isActive: true,
      },
      create: {
        email: prov.email,
        password: commonPassword,
        firstName: prov.firstName,
        lastName: prov.lastName,
        phone: prov.phone,
        roleId: providerRole,
        status: UserStatus.ACTIVE,
        isActive: true,
        emailVerified: true,
        profile: {
          create: {
            city: prov.city,
            department: prov.department,
            country: 'Ecuador',
            bio: `Profesional calificado en ${prov.title} con amplia experiencia.`,
          },
        },
      },
    });

    const providerProfile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {
        title: prov.title,
        hourlyRate: prov.hourlyRate,
        isVerified: true,
        rating: prov.rating,
        totalReviews: prov.totalReviews,
      },
      create: {
        userId: user.id,
        title: prov.title,
        hourlyRate: prov.hourlyRate,
        isVerified: true,
        rating: prov.rating,
        totalReviews: prov.totalReviews,
      },
    });

    const targetService = await prisma.service.findFirst({
      where: { slug: prov.serviceSlug },
    });

    if (targetService) {
      await prisma.providerService.upsert({
        where: {
          providerProfileId_serviceId: {
            providerProfileId: providerProfile.id,
            serviceId: targetService.id,
          },
        },
        update: {},
        create: {
          providerProfileId: providerProfile.id,
          serviceId: targetService.id,
        },
      });
    }

    console.log(`✓ Prestador creado/actualizado: ${prov.firstName} ${prov.lastName} (${prov.title})`);
  }

  // 6. Seed de Cuadrillas y Equipos de Trabajo en Cali
  console.log('👷 Sembrando Cuadrillas y Equipos de Trabajo...');
  const cuadrillasSeed = [
    {
      slug: 'cuadrilla-albanileria-obra-blanca-cali',
      name: 'Cuadrilla Especializada en Albañilería, Obra Blanca y Estructuras',
      category: 'Albañilería y Construcción',
      leaderName: 'Don Fernando Valencia',
      leaderPhone: '+57 315 789 4521',
      city: 'Cali',
      department: 'Valle del Cauca',
      rating: 4.9,
      reviewsCount: 38,
      isVerified: true,
      badge: 'Equipo Certificado &bull; 10 Años en Cali',
      image: '/images/service-reparaciones.jpg',
      description: 'Cuadrilla consolidada con más de 10 años en obras residenciales y comerciales en el sur y norte de Cali. Expertos en drywall, mampostería, pañete, enchape y remodelaciones integrales.',
      hourlyRate: 90000,
      dailyRate: 580000,
      fulfillmentRate: 2400000,
      preferredPricingModel: 'POR_DIA',
      activities: JSON.stringify(['Levantamiento de muros', 'Drywall y cielo raso', 'Pintura y estuco profesional', 'Enchape porcelanato']),
      coverage: 'Cali (Norte, Sur, Oeste), Jamundí y Yumbo',
      experienceYears: 10,
      completedJobs: 87,
      members: [
        { name: 'Fernando Valencia', role: 'Maestro Mayor de Obra', experience: '15 años', specialty: 'Planos, replanteo y dirección' },
        { name: 'Jairo Domínguez', role: 'Oficial de Enchape', experience: '8 años', specialty: 'Porcelanatos y baños de lujo' },
        { name: 'Miller Ocampo', role: 'Oficial Drywall y Pintura', experience: '6 años', specialty: 'Acabados finos y estuco veneciano' },
        { name: 'Brayan Caicedo', role: 'Auxiliar de Construcción', experience: '3 años', specialty: 'Mezclas, demolición limpia y acarreo' },
      ],
    },
    {
      slug: 'equipo-electrico-retie-cali',
      name: 'Equipo Integral de Instalaciones Eléctricas y Certificación RETIE',
      category: 'Electricidad',
      leaderName: 'Ing. Mauricio Quintero',
      leaderPhone: '+57 318 456 1234',
      city: 'Cali',
      department: 'Valle del Cauca',
      rating: 5.0,
      reviewsCount: 42,
      isVerified: true,
      badge: 'Técnicos CONTE & RETIE',
      image: '/images/service-electricista.jpg',
      description: 'Cuadrilla eléctrica calificada para montajes trifásicos, cableado estructurado, subestaciones, acometidas industriales y residenciales con firma de ingeniero.',
      hourlyRate: 110000,
      dailyRate: 720000,
      fulfillmentRate: 3100000,
      preferredPricingModel: 'POR_CUMPLIMIENTO',
      activities: JSON.stringify(['Acometidas bifásicas y trifásicas', 'Certificación RETIE', 'Paneles solares fotovoltaicos', 'Cuadros de distribución']),
      coverage: 'Cali metropolitana, Zona Industrial Yumbo y Acopi',
      experienceYears: 12,
      completedJobs: 115,
      members: [
        { name: 'Ing. Mauricio Quintero', role: 'Ingeniero Electricista', experience: '12 años', specialty: 'Diseño RETIE y supervisión' },
        { name: 'Cristian Rivas', role: 'Técnico Liniero CONTE', experience: '9 años', specialty: 'Cableado pesado y acometidas' },
        { name: 'Andrés Barona', role: 'Técnico Instrumentista', experience: '5 años', specialty: 'Automatización y protecciones' },
      ],
    },
    {
      slug: 'cuadrilla-pintura-alturas-cali',
      name: 'Cuadrilla de Pintura de Alturas, Fachadas y Acabados Arquitectónicos',
      category: 'Pintura y Acabados',
      leaderName: 'Héctor Fabio Restrepo',
      leaderPhone: '+57 311 234 9876',
      city: 'Cali',
      department: 'Valle del Cauca',
      rating: 4.8,
      reviewsCount: 29,
      isVerified: true,
      badge: 'Certificación Trabajo en Alturas',
      image: '/images/service-pintura.jpg',
      description: 'Especialistas en impermeabilización de terrazas, pintura de edificios, conjuntos residenciales y bodegas con andamiaje certificado y póliza de seguridad.',
      hourlyRate: 85000,
      dailyRate: 520000,
      fulfillmentRate: 1950000,
      preferredPricingModel: 'POR_DIA',
      activities: JSON.stringify(['Pintura de fachadas en altura', 'Impermeabilización manto asfáltico', 'Acabados anticorrosivos', 'Pintura epóxica para pisos']),
      coverage: 'Cali y Palmira',
      experienceYears: 8,
      completedJobs: 64,
      members: [
        { name: 'Héctor Fabio Restrepo', role: 'Coordinador de Alturas', experience: '10 años', specialty: 'Seguridad y andamios certificados' },
        { name: 'Diego Arboleda', role: 'Pintor Especialista', experience: '7 años', specialty: 'Pintura airless e hidrófuga' },
        { name: 'Jefferson Murillo', role: 'Pintor Oficial', experience: '5 años', specialty: 'Estucos exteriores e impermeabilizantes' },
        { name: 'Wilson Mera', role: 'Auxiliar de Seguridad', experience: '4 años', specialty: 'Líneas de vida y control perimetral' },
      ],
    },
    {
      slug: 'cuadrilla-climatizacion-aires-cali',
      name: 'Equipo Técnico de Climatización, Extracción y Cuartos Fríos',
      category: 'Climatización',
      leaderName: 'Carlos Arturo Caicedo',
      leaderPhone: '+57 316 789 0123',
      city: 'Cali',
      department: 'Valle del Cauca',
      rating: 4.9,
      reviewsCount: 34,
      isVerified: true,
      badge: 'Especialistas Inverter & VRF',
      image: '/images/service-climatizacion.jpg',
      description: 'Instalación, ductería y mantenimiento preventivo y correctivo de sistemas de aire acondicionado mini-split, multi-split y chillers centrales en Cali.',
      hourlyRate: 120000,
      dailyRate: 780000,
      fulfillmentRate: 3800000,
      preferredPricingModel: 'POR_HORA',
      activities: JSON.stringify(['Mantenimiento de Chillers', 'Instalación Mini-Split Inverter', 'Ductería en lámina galvanizada', 'Carga de gas refrigerante R410']),
      coverage: 'Cali, Jamundí, Yumbo y Palmira',
      experienceYears: 11,
      completedJobs: 92,
      members: [
        { name: 'Carlos Arturo Caicedo', role: 'Jefe Técnico Refrigeración', experience: '14 años', specialty: 'VRF, centrales y chillers' },
        { name: 'Samuel Palacios', role: 'Técnico Electromecánico', experience: '6 años', specialty: 'Soldadura cobre y detección de fugas' },
        { name: 'Jorge H. Loaiza', role: 'Técnico Instalador', experience: '5 años', specialty: 'Ductos, aislamiento y cableado' },
      ],
    },
    {
      slug: 'cuadrilla-plomeria-vactor-cali',
      name: 'Cuadrilla de Plomería Hidrosanitaria, Redes Contra Incendio y Vactor',
      category: 'Plomería',
      leaderName: 'Gustavo Adolfo Mina',
      leaderPhone: '+57 317 890 2345',
      city: 'Cali',
      department: 'Valle del Cauca',
      rating: 4.9,
      reviewsCount: 51,
      isVerified: true,
      badge: 'Atención Emergencias 24/7',
      image: '/images/service-plomero.jpg',
      description: 'Equipo dotado con sonda eléctrica, geófono para detección de fugas invisibles, hidrojet y personal calificado para redes de acueducto y alcantarillado.',
      hourlyRate: 95000,
      dailyRate: 640000,
      fulfillmentRate: 2800000,
      preferredPricingModel: 'POR_CUMPLIMIENTO',
      activities: JSON.stringify(['Geófono detección de fugas', 'Destape de bajantes y alcantarillas', 'Instalación tanques de reserva', 'Motobombas e hidropresores']),
      coverage: 'Todo Cali y Corregimientos',
      experienceYears: 9,
      completedJobs: 130,
      members: [
        { name: 'Gustavo Adolfo Mina', role: 'Maestro Plomero', experience: '12 años', specialty: 'Geófono y termografía' },
        { name: 'Nelson Prado', role: 'Operador de Sonda Eléctrica', experience: '7 años', specialty: 'Destapes complejos sin romper' },
        { name: 'Óscar Viveros', role: 'Técnico de Presurización', experience: '5 años', specialty: 'Bombas sumergibles y tanques' },
        { name: 'Daniel Rengifo', role: 'Auxiliar Fontanero', experience: '3 años', specialty: 'Termofusión y PVC RDE' },
      ],
    },
    {
      slug: 'cuadrilla-cerrajeria-blindada-cali',
      name: 'Equipo de Cerrajería Blindada, Portones Automáticos y Control de Acceso',
      category: 'Cerrajería y Seguridad',
      leaderName: 'Alonso Bermúdez',
      leaderPhone: '+57 314 567 8901',
      city: 'Cali',
      department: 'Valle del Cauca',
      rating: 5.0,
      reviewsCount: 46,
      isVerified: true,
      badge: 'Seguridad Perimetral & Automatización',
      image: '/images/service-cerrajero.jpg',
      description: 'Expertos en blindaje arquitectónico, instalación de cerraduras electromagnéticas, talanqueras de condominio, motores para portones y cajas fuertes.',
      hourlyRate: 105000,
      dailyRate: 690000,
      fulfillmentRate: 2600000,
      preferredPricingModel: 'POR_HORA',
      activities: JSON.stringify(['Automatización de portones', 'Cerraduras biométricas y digitales', 'Cajas fuertes de alta seguridad', 'Cerraduras multipunto']),
      coverage: 'Cali (Norte y Sur residencial)',
      experienceYears: 13,
      completedJobs: 104,
      members: [
        { name: 'Alonso Bermúdez', role: 'Maestro Cerrajero Forense', experience: '16 años', specialty: 'Aperturas técnicas y cajas fuertes' },
        { name: 'Edison Cardona', role: 'Técnico en Automatización', experience: '8 años', specialty: 'Motores corredizos y brazos hidráulicos' },
        { name: 'Kevin Bermúdez', role: 'Técnico Control de Acceso', experience: '4 años', specialty: 'Biometría, electroimanes y tarjetas RFID' },
      ],
    },
  ];

  for (const cData of cuadrillasSeed) {
    const { members, ...cuadrillaInfo } = cData;
    const cuadrilla = await prisma.cuadrilla.upsert({
      where: { slug: cuadrillaInfo.slug },
      update: cuadrillaInfo,
      create: cuadrillaInfo,
    });

    // Crear/actualizar miembros de la cuadrilla
    await prisma.cuadrillaMember.deleteMany({
      where: { cuadrillaId: cuadrilla.id },
    });

    for (const member of members) {
      await prisma.cuadrillaMember.create({
        data: {
          cuadrillaId: cuadrilla.id,
          ...member,
        },
      });
    }

    console.log(`✓ Cuadrilla creada/actualizada: ${cuadrilla.name} (${members.length} integrantes)`);
  }

  console.log('🌱 Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
