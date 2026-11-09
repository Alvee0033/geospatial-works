"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
const hero_slide_entity_1 = require("../../entities/hero-slide.entity");
const page_section_entity_1 = require("../../entities/page-section.entity");
const service_entity_1 = require("../../entities/service.entity");
const project_entity_1 = require("../../entities/project.entity");
const equipment_entity_1 = require("../../entities/equipment.entity");
const partner_entity_1 = require("../../entities/partner.entity");
const job_post_entity_1 = require("../../entities/job-post.entity");
const job_application_entity_1 = require("../../entities/job-application.entity");
let SeedService = SeedService_1 = class SeedService {
    constructor(userRepository, heroSlideRepository, pageSectionRepository, serviceRepository, projectRepository, equipmentRepository, partnerRepository, jobPostRepository, applicationRepository) {
        this.userRepository = userRepository;
        this.heroSlideRepository = heroSlideRepository;
        this.pageSectionRepository = pageSectionRepository;
        this.serviceRepository = serviceRepository;
        this.projectRepository = projectRepository;
        this.equipmentRepository = equipmentRepository;
        this.partnerRepository = partnerRepository;
        this.jobPostRepository = jobPostRepository;
        this.applicationRepository = applicationRepository;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onApplicationBootstrap() {
        this.logger.log('Checking database seed state...');
        await this.seedAdminUser();
        await this.seedHeroSlides();
        await this.seedPageSections();
        await this.seedServices();
        await this.seedProjects();
        await this.seedEquipment();
        await this.seedPartners();
        await this.seedJobPosts();
        this.logger.log('Database verification and seed check complete.');
    }
    async seedAdminUser() {
        const existing = await this.userRepository.findOne({ where: { email: 'admin@geospatialworks.com.bd' } });
        if (!existing) {
            const passwordHash = await bcrypt.hash('Admin@2026!GW', 12);
            await this.userRepository.save({
                email: 'admin@geospatialworks.com.bd',
                name: 'GW System Administrator',
                passwordHash,
                role: user_entity_1.UserRole.ADMIN,
            });
            this.logger.log('Default Admin user created: admin@geospatialworks.com.bd');
        }
    }
    async seedHeroSlides() {
        const count = await this.heroSlideRepository.count();
        if (count === 0) {
            await this.heroSlideRepository.save([
                {
                    eyebrow: 'PEOPLE • DATA • RESILIENT BANGLADESH',
                    heading: 'Know the Ground. Shape the Future.',
                    description: 'Precision geospatial surveying, drone photogrammetry, and spatial intelligence supporting major infrastructure and development across Bangladesh.',
                    imageUrl: '/delta-hero-v2.webp',
                    primaryActionText: 'Explore Our Services',
                    primaryActionHref: '/services',
                    secondaryActionText: 'Get in Touch',
                    secondaryActionHref: '/contact',
                    sortOrder: 1,
                    isActive: true,
                },
                {
                    eyebrow: 'PRECISION • PERSPECTIVE • PROGRESS',
                    heading: 'Understand Every Place. Plan with Clarity.',
                    description: 'From sub-centimeter field measurements to GIS modeling, providing engineering teams and institutions with actionable spatial insights.',
                    imageUrl: '/geospatial-river-hero.webp',
                    primaryActionText: 'View Our Projects',
                    primaryActionHref: '/projects',
                    secondaryActionText: 'Get in Touch',
                    secondaryActionHref: '/contact',
                    sortOrder: 2,
                    isActive: true,
                },
                {
                    eyebrow: 'FROM THE GROUND TO THE SKY',
                    heading: 'Better Data. Better Maps. Better Decisions.',
                    description: 'Advanced aerial surveying and terrain analytics bringing complex river basins, urban corridors, and remote landscapes into sharp focus.',
                    imageUrl: '/hero-poster.jpg',
                    primaryActionText: 'Start a Conversation',
                    primaryActionHref: '/contact',
                    secondaryActionText: 'Get in Touch',
                    secondaryActionHref: '/contact',
                    sortOrder: 3,
                    isActive: true,
                },
            ]);
            this.logger.log('Hero slides seeded.');
        }
    }
    async seedPageSections() {
        const sections = [
            {
                pageKey: 'home',
                sectionKey: 'about_summary',
                title: 'Turning spatial data into real-world impact.',
                subtitle: '/ ABOUT',
                content: {
                    kicker: 'FIELD TO A BRIGHTER BANGLADESH',
                    description: 'We deliver geospatial data, modern mapping solutions and practical insights to support better decisions for a stronger, more resilient Bangladesh.',
                    image: '/field-surveyor-v2.webp',
                    points: [
                        { number: '01', title: 'LOCAL EXPERTISE', desc: 'Deep understanding of Bangladesh’s unique riverine and urban landscape.' },
                        { number: '02', title: 'INTEGRATED SOLUTIONS', desc: 'Survey, drone photogrammetry, GIS and civil engineering under one roof.' },
                        { number: '03', title: 'IMPACT DRIVEN', desc: 'Actionable data for national infrastructure, environment, and community resilience.' },
                    ],
                },
            },
            {
                pageKey: 'home',
                sectionKey: 'services_intro',
                title: 'Geospatial solutions for a changing Bangladesh.',
                subtitle: '/ SERVICES',
                content: {
                    description: 'From the ground to the sky, we capture, map and analyse the world around you.',
                    actionText: 'View all services',
                    actionHref: '/services',
                },
            },
            {
                pageKey: 'home',
                sectionKey: 'projects_intro',
                title: 'Real landscapes. Real impact.',
                subtitle: '/ PROJECTS',
                content: {
                    description: 'A verified track record of high-precision work across surveying, corridor mapping, and engineering design.',
                    actionText: 'View all projects',
                    actionHref: '/projects',
                },
            },
            {
                pageKey: 'home',
                sectionKey: 'partners_intro',
                title: 'Our partners.',
                subtitle: 'WORKING TOGETHER',
                content: {
                    description: 'Government ministries, international consulting firms, and public corporations we work with across Bangladesh.',
                },
            },
        ];
        for (const s of sections) {
            const existing = await this.pageSectionRepository.findOne({
                where: { pageKey: s.pageKey, sectionKey: s.sectionKey },
            });
            if (!existing) {
                await this.pageSectionRepository.save(s);
            }
        }
        this.logger.log('Page sections seeded.');
    }
    async seedServices() {
        const count = await this.serviceRepository.count();
        if (count === 0) {
            await this.serviceRepository.save([
                {
                    slug: 'topographic-survey',
                    title: 'Topographic & Land Survey',
                    category: 'SURVEY & GEODATA',
                    description: 'Site, cadastral and boundary surveys with GNSS control, DSM/DEM terrain modeling, and GIS-ready contour mapping.',
                    features: ['Cadastral and boundary demarcation', 'DSM/DEM/DTM elevation profiles', 'RTK GNSS sub-centimeter control'],
                    imageUrl: '/real-media/service-topographic-uav.png',
                    sortOrder: 1,
                },
                {
                    slug: 'uav-mapping',
                    title: 'Airborne UAV (Drone) Survey',
                    category: 'SURVEY & GEODATA',
                    description: 'High-resolution aerial photogrammetry, multispectral NDVI vegetation mapping, and 3D surface modeling using DJI Enterprise drones.',
                    features: ['High-resolution orthomosaics', 'Multi-band multispectral imaging', 'Volumetric calculation & 3D mesh'],
                    imageUrl: '/real-media/service-uav-drone-lidar.png',
                    sortOrder: 2,
                },
                {
                    slug: 'hydrographic-survey',
                    title: 'Hydrographic & Bathymetric Survey',
                    category: 'SURVEY & GEODATA',
                    description: 'GNSS-integrated echo sounding, river and canal bed profiling, and river water level gauge station installation.',
                    features: ['Single & dual-frequency depth sounding', 'River cross-section bed profiling', 'Water level gauge reader calibration'],
                    imageUrl: '/real-media/project-badc-jhopjhopia-river.jpg',
                    sortOrder: 3,
                },
                {
                    slug: 'engineering-design',
                    title: 'Feasibility, BOQ & Civil Design',
                    category: 'ENGINEERING & APPROACH',
                    description: 'Preparation of Bills of Quantities (BOQ), Bills of Materials (BOM), structural analysis, and road/bridge feasibility studies.',
                    features: ['Measured BOQ & BOM schedules', 'Road corridor & junction design', 'Project cost estimation & budgeting'],
                    imageUrl: '/real-media/service-road-bridge-engineering.jpg',
                    sortOrder: 4,
                },
                {
                    slug: 'gis-solutions',
                    title: 'Geographic Information Systems (GIS)',
                    category: 'SPATIAL INTELLIGENCE',
                    description: 'Enterprise spatial database architecture, digital land zoning, remote sensing classification, and geospatial decision support.',
                    features: ['National land zoning GIS databases', 'Satellite image change detection', 'Spatial multi-criteria decision analysis'],
                    imageUrl: '/real-media/service-gis-remote-sensing.png',
                    sortOrder: 5,
                },
                {
                    slug: 'environmental-monitoring',
                    title: 'Environmental & Coastal Assessment',
                    category: 'SPATIAL INTELLIGENCE',
                    description: 'Drone-enabled assessment of newly accreted coastal lands, mangrove forest monitoring, and climate-smart rural infrastructure.',
                    features: ['Coastal accretion mapping', 'Mangrove forest canopy density', 'Climate-smart rural transport mapping'],
                    imageUrl: '/real-media/insight-coastal-mangrove-uav.jpg',
                    sortOrder: 6,
                },
            ]);
            this.logger.log('Services seeded.');
        }
    }
    async seedProjects() {
        const count = await this.projectRepository.count();
        if (count === 0) {
            await this.projectRepository.save([
                {
                    slug: 'badc-web-ais-project',
                    title: 'Pilot Research Project for Irrigation Water Management (WEB-AIS)',
                    client: 'Bangladesh Agricultural Development Corporation (BADC)',
                    category: 'WATER RESOURCES & GIS',
                    location: 'Manikganj & Gangarampur',
                    description: 'Reinstallation and adjustment of river water level gauge readers at Krishnapur, Chailla Burundi, and Uttar Jamsha. Topographic survey and NDVI vegetation health remote sensing analysis.',
                    deliverables: 'Real-time water level data, GIS web platform integration, high-precision contour maps.',
                    imageUrl: '/geospatial-river-hero.webp',
                    isMilestone: true,
                    sortOrder: 1,
                },
                {
                    slug: 'lged-450km-road-survey',
                    title: 'Approx 450 km Detail Road Survey using RTK GNSS',
                    client: 'Local Government Engineering Department (LGED) / IMAGE',
                    category: 'ROAD & TRANSPORT',
                    location: 'Multiple Districts, Bangladesh',
                    description: 'Extensive road corridor mapping, horizontal alignment verification, and road asset inventory using high-precision RTK GNSS receivers.',
                    deliverables: 'Centerline alignments, cross-sections, digital elevation models, civil engineering CAD deliverables.',
                    imageUrl: '/real-media/service-uav-drone-lidar.png',
                    isMilestone: true,
                    sortOrder: 2,
                },
                {
                    slug: 'railway-rcipf-topographic-survey',
                    title: 'Topographic Survey using RTK & UAV under RCIPF Project',
                    client: 'Bangladesh Railway / Oriental Consultants Global (OCG)',
                    category: 'RAILWAY & INFRASTRUCTURE',
                    location: 'Pahartoli GER Shop (Chattogram) & Abdulpur Bypass',
                    description: 'Detailed engineering topographic surveys utilizing RTK GNSS and RTK-enabled UAV drone flights for locomotive workshop modernization and railway bypass alignment.',
                    deliverables: 'Sub-centimeter rail alignment coordinates, 3D point clouds, facility contour plans.',
                    imageUrl: '/inner/field-team.webp',
                    isMilestone: true,
                    sortOrder: 3,
                },
                {
                    slug: 'national-digital-land-zoning',
                    title: 'Mouza & Plot Based National Digital Land Zoning Project (Phase 1 & 2)',
                    client: 'Ministry of Land / CEGIS',
                    category: 'LAND ZONING & GIS',
                    location: 'National Coverage',
                    description: 'High-precision mouza boundary and agricultural/commercial plot demarcation, satellite image rectification, and geodatabase creation.',
                    deliverables: 'Geodatabase with parcel-level land use classifications and digital zoning maps.',
                    imageUrl: '/real-media/service-gis-remote-sensing.png',
                    isMilestone: true,
                    sortOrder: 4,
                },
                {
                    slug: 'dtca-200km-dscc-road-survey',
                    title: 'Approx 200 km Road Survey using RTK and UAV under DSCC',
                    client: 'Dhaka Transport Coordination Authority (DTCA) / IMAGE',
                    category: 'URBAN TRANSPORT',
                    location: 'Dhaka South City Corporation',
                    description: 'Dense urban corridor mapping, intersection geometric layout, and right-of-way demarcation using RTK GNSS and drone photogrammetry.',
                    deliverables: 'As-built drawings, urban right-of-way maps, drainage network surveys.',
                    imageUrl: '/inner/banner-projects.webp',
                    isMilestone: false,
                    sortOrder: 5,
                },
                {
                    slug: 'dncc-bus-terminals-modernization',
                    title: 'Passenger Facilities Modernization at Gabtoli & Mohakhali Bus Terminals',
                    client: 'Dhaka North City Corporation (DNCC)',
                    category: 'CIVIL & ARCHITECTURAL',
                    location: 'Dhaka (Gabtoli & Mohakhali)',
                    description: 'Survey, architectural layout, and engineering design for ticket counters, waiting lounges, sanitary facilities, drainage systems, and passenger passageways.',
                    deliverables: 'Architectural drawings, structural engineering designs, BOQ and cost estimates.',
                    imageUrl: '/inner/banner-services.webp',
                    isMilestone: false,
                    sortOrder: 6,
                },
            ]);
            this.logger.log('Projects seeded.');
        }
    }
    async seedEquipment() {
        const count = await this.equipmentRepository.count();
        if (count === 0) {
            await this.equipmentRepository.save([
                {
                    category: 'DRONE FLEET',
                    name: 'DJI Mavic 3 Enterprise',
                    manufacturer: 'DJI',
                    quantity: 'Multiple Units (7 Batteries per unit)',
                    specs: { sensor: '4/3 CMOS 20MP', shutter: 'Mechanical', rtkModule: 'Centimeter-level precision' },
                    imageUrl: '/hero-poster.jpg',
                    sortOrder: 1,
                },
                {
                    category: 'DRONE FLEET',
                    name: 'DJI Mavic 3 Multispectral',
                    manufacturer: 'DJI',
                    quantity: 'Multiple Units (7 Batteries per unit)',
                    specs: { bands: ['Green', 'Red', 'Red Edge', 'Near Infrared'], rtk: 'Integrated RTK module' },
                    imageUrl: '/real-media/service-uav-drone-lidar.png',
                    sortOrder: 2,
                },
                {
                    category: 'DRONE FLEET',
                    name: 'DJI Matrice 4 Enterprise',
                    manufacturer: 'DJI',
                    quantity: 'Heavy-lift Survey Platform',
                    specs: { payload: 'Multisensor LiDAR / Thermal / Zoom', flightTime: '45 mins' },
                    imageUrl: '/inner/banner-innovations.webp',
                    sortOrder: 3,
                },
                {
                    category: 'TOTAL STATION',
                    name: 'Multi-Brand Precision Total Stations',
                    manufacturer: 'Topcon, Sokkia, CHCNAV, Kolida',
                    quantity: 'Fleet of 8+ Units',
                    specs: { angleAccuracy: '1” to 2”', edmRange: 'Up to 5000m with prism', dualDisplay: true },
                    imageUrl: '/real-media/service-topographic-uav.png',
                    sortOrder: 4,
                },
                {
                    category: 'WORKSTATION',
                    name: 'High-Performance Photogrammetry Workstations (x4)',
                    manufacturer: 'Custom High-Compute Rigs',
                    quantity: '4 Units + 40TB Central NAS',
                    specs: { cpu: 'Intel Core i9 14th Gen / Core Ultra 7', ram: '64 GB DDR5', gpu: 'NVIDIA RTX 4060 Ti / 5060 Ti', storage: '40TB Central NAS' },
                    imageUrl: '/real-media/service-gis-remote-sensing.png',
                    sortOrder: 5,
                },
            ]);
            this.logger.log('Equipment seeded.');
        }
    }
    async seedPartners() {
        const count = await this.partnerRepository.count();
        if (count === 0) {
            await this.partnerRepository.save([
                { name: 'LGED', logoUrl: '/partners/partner_1.png', category: 'Government' },
                { name: 'BADC', logoUrl: '/partners/partner_2.png', category: 'Government' },
                { name: 'Bangladesh Railway', logoUrl: '/partners/partner_3.png', category: 'Government' },
                { name: 'DNCC', logoUrl: '/partners/Dhaka_North_City_Corporation_Logo.svg.webp', category: 'Municipal' },
                { name: 'CEGIS', logoUrl: '/partners/partner_4.png', category: 'Research' },
                { name: 'BPDB', logoUrl: '/partners/partner_5.png', category: 'Power' },
                { name: 'BEZA', logoUrl: '/partners/partner_6.png', category: 'Economic Zones' },
                { name: 'DTCA', logoUrl: '/partners/partner_7.png', category: 'Transport' },
                { name: 'Oriental Consultants Global', logoUrl: '/partners/partner_8.png', category: 'International' },
            ]);
            this.logger.log('Partners seeded.');
        }
    }
    async seedJobPosts() {
        const count = await this.jobPostRepository.count();
        if (count === 0) {
            const savedJobs = await this.jobPostRepository.save([
                {
                    slug: 'lead-geodetic-surveyor',
                    title: 'Lead Geodetic Surveyor (RTK & Total Station)',
                    department: 'Geodesy & Ground Survey',
                    location: 'Dhaka & Field Locations, Bangladesh',
                    type: job_post_entity_1.JobType.PERMANENT,
                    summary: 'Lead primary geodetic control networks, SOB benchmark tying, and high-precision topographic surveys for landmark bridge, rail, and expressway alignments.',
                    description: 'Geospatial Works is seeking a seasoned Lead Geodetic Surveyor to spearhead millimeter-grade control networks across Bangladesh infrastructure mega-projects. You will coordinate field teams, verify instrument calibrations, and interface directly with chief consultant engineers.',
                    qualifications: [
                        'B.Sc. or Diploma in Surveying / Geomatics / Civil Engineering',
                        '5+ years hands-on experience with Trimble/Leica GNSS RTK and robotic total stations',
                        'Proficiency in network least-squares adjustment and Civil 3D surface modeling',
                    ],
                    responsibilities: [
                        'Establish high-order geodetic control stations tied to Survey of Bangladesh benchmarks',
                        'Conduct static GNSS campaigns and post-process baseline vectors',
                        'Supervise junior surveyors on bridge alignments, expressway corridors, and rail tangents',
                        'Prepare statutory survey reports, QA/QC documentation, and coordinate transforms',
                    ],
                    experienceLevel: '5+ Years',
                    salaryRange: 'Negotiable / Attractive Industry Standard',
                    deadline: '2026-12-31',
                    status: job_post_entity_1.JobStatus.PUBLISHED,
                    isActive: true,
                    sortOrder: 1,
                },
                {
                    slug: 'uav-flight-operator',
                    title: 'Commercial UAV Flight Operator & Photogrammetrist',
                    department: 'Aerial Survey & Drone Fleet',
                    location: 'Dhaka & Field Deployments',
                    type: job_post_entity_1.JobType.FULL_TIME,
                    summary: 'Command DJI Enterprise drone fleets (M350 RTK, Phantom 4 RTK) for multi-temporal corridor mapping, photogrammetry, and LiDAR data collection.',
                    description: 'Join our cutting-edge aerial survey division deploying high-end RTK/LiDAR drones across deltaic corridors and urban megacities. You will be responsible for mission planning, airspace compliance, and photogrammetric surface reconstructions.',
                    qualifications: [
                        'Certified commercial drone pilot with CAAB flight protocol knowledge',
                        '3+ years experience with Pix4Dmapper, DJI Terra, or Agisoft Metashape',
                        'Strong safety mindset and ability to manage field ground control points (GCPs)',
                    ],
                    responsibilities: [
                        'Execute automated grid and corridor UAV flight plans with centimeter RTK accuracy',
                        'Ensure CAAB safety compliance and battery health management',
                        'Process aerial imagery into dense point clouds, DEMs, and orthomosaics',
                    ],
                    experienceLevel: '3+ Years',
                    salaryRange: 'Negotiable based on flight credentials',
                    deadline: '2026-11-30',
                    status: job_post_entity_1.JobStatus.PUBLISHED,
                    isActive: true,
                    sortOrder: 2,
                },
                {
                    slug: 'enterprise-gis-analyst',
                    title: 'Enterprise GIS & PostGIS Spatial Developer',
                    department: 'Spatial Intelligence & Digital Twins',
                    location: 'Dhaka Headquarters',
                    type: job_post_entity_1.JobType.FULL_TIME,
                    summary: 'Architect PostgreSQL/PostGIS spatial databases, vector tile servers, and interactive web mapping portals for municipal digital twin projects.',
                    description: 'We are expanding our Spatial Intelligence lab with an Enterprise GIS Developer passionate about scalable spatial queries, 3D tiles, and cloud-native geospatial stacks.',
                    qualifications: [
                        'Degree in GIS, Computer Science, Urban Planning, or related discipline',
                        'Strong SQL/PostGIS skills and experience with Python (GeoPandas, GDAL/OGR)',
                        'Experience building web GIS interfaces using Leaflet, Mapbox, or OpenLayers',
                    ],
                    responsibilities: [
                        'Build automated ETL pipelines for spatial data ingestion and topological cleaning',
                        'Design high-throughput PostGIS database schemas for municipal utility networks',
                        'Develop responsive web mapping dashboards for client stakeholders',
                    ],
                    experienceLevel: '2-4 Years',
                    salaryRange: 'Competitive',
                    deadline: '2026-12-15',
                    status: job_post_entity_1.JobStatus.PUBLISHED,
                    isActive: true,
                    sortOrder: 3,
                },
                {
                    slug: 'hydrographic-survey-engineer',
                    title: 'Hydrographic & Bathymetric Survey Engineer',
                    department: 'Marine & Water Resources',
                    location: 'River Basin Sites & Dhaka HQ',
                    type: job_post_entity_1.JobType.FULL_TIME,
                    summary: 'Conduct riverbed bathymetric echo sounding, ADCP velocity profiling, and scour monitoring in Bangladesh’s major delta river corridors.',
                    description: 'Spearhead bathymetric charting and hydraulic discharge assessments across Bangladesh’s dynamic braided river systems using dual-frequency echosounders and ADCPs.',
                    qualifications: [
                        'Degree in Oceanography, Water Resources Engineering, or Hydrography',
                        'Familiarity with digital echo sounders, Hypack software, and RTK motion sensors',
                        'Willingness to travel on survey vessels in tidal and riverine environments',
                    ],
                    responsibilities: [
                        'Mobilize single/multibeam sonars and ADCP sensors on survey vessels',
                        'Execute transect navigation and sound velocity profiling',
                        'Process raw bathymetric sounding data into 3D riverbed models',
                    ],
                    experienceLevel: '3+ Years',
                    salaryRange: 'Attractive package + Field Allowances',
                    deadline: '2026-12-20',
                    status: job_post_entity_1.JobStatus.PUBLISHED,
                    isActive: true,
                    sortOrder: 4,
                },
                {
                    slug: 'subsurface-utility-engineer',
                    title: 'Subsurface Utility Engineering (SUE) Specialist',
                    department: 'Underground Infrastructure',
                    location: 'Dhaka Metropolitan',
                    type: job_post_entity_1.JobType.FULL_TIME,
                    summary: 'Operate ground penetrating radar (GPR) and precision electromagnetic cable/pipe locators to detect buried municipal utility corridors.',
                    description: 'Protect buried pipelines and power networks by accurately mapping underground infrastructure using advanced dual-frequency GPR and induction locators.',
                    qualifications: [
                        'Diploma/Degree in Geophysics, Electrical, or Civil Engineering',
                        'Experience interpreting GPR radargrams and electromagnetic induction data',
                        'Understanding of ASCE 38-02 Subsurface Utility Engineering guidelines',
                    ],
                    responsibilities: [
                        'Scan arterial city roads with multi-channel GPR carts',
                        'Mark buried pipes, telecom ducts, and gas mains with precision coordinates',
                        'Convert geophysical signatures into AutoCAD and GIS utility models',
                    ],
                    experienceLevel: '2+ Years',
                    salaryRange: 'Competitive',
                    deadline: '2026-12-31',
                    status: job_post_entity_1.JobStatus.PUBLISHED,
                    isActive: true,
                    sortOrder: 5,
                },
            ]);
            if (savedJobs.length > 0) {
                await this.applicationRepository.save([
                    {
                        jobPost: savedJobs[0],
                        fullName: 'Tanvir Rahman',
                        email: 'tanvir.rahman@example.com',
                        phone: '+880 1711 987654',
                        linkedInUrl: 'https://linkedin.com/in/tanvir-geodetic',
                        portfolioUrl: 'https://tanvir-survey.dev',
                        currentCompany: 'Apex Surveyors Ltd',
                        currentTitle: 'Senior Field Surveyor',
                        yearsOfExperience: '6 years',
                        coverLetter: 'I have managed RTK GNSS and robotic total stations on multiple bridge and highway projects across the Padma basin.',
                        status: job_application_entity_1.ApplicationStatus.SHORTLISTED,
                        internalNotes: 'Strong RTK background. SOB benchmarks verified. Invite for technical round.',
                    },
                    {
                        jobPost: savedJobs[0],
                        fullName: 'Mahmudul Karim',
                        email: 'mahmud.karim@example.com',
                        phone: '+880 1822 456789',
                        currentCompany: 'Delta Geomatics',
                        currentTitle: 'Junior Geodesist',
                        yearsOfExperience: '3 years',
                        coverLetter: 'Eager to transition to landmark infrastructure surveying and learn least-squares network adjustments.',
                        status: job_application_entity_1.ApplicationStatus.NEW,
                        internalNotes: 'Review CV attachments and check Civil 3D proficiency.',
                    },
                    {
                        jobPost: savedJobs[1],
                        fullName: 'Farhana Ahmed',
                        email: 'farhana.drone@example.com',
                        phone: '+880 1933 112233',
                        linkedInUrl: 'https://linkedin.com/in/farhana-uav',
                        currentCompany: 'SkyEye Photogrammetry',
                        currentTitle: 'UAV Operations Lead',
                        yearsOfExperience: '4 years',
                        coverLetter: 'Certified drone operator with over 350 successful flight missions across Bangladesh power corridors using DJI Enterprise drones.',
                        status: job_application_entity_1.ApplicationStatus.INTERVIEWED,
                        internalNotes: 'Excellent flight log and Pix4D portfolio. Interview conducted on Nov 7.',
                    },
                ]);
            }
            this.logger.log('Job posts and sample applications seeded.');
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(hero_slide_entity_1.HeroSlide)),
    __param(2, (0, typeorm_1.InjectRepository)(page_section_entity_1.PageSection)),
    __param(3, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(4, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(5, (0, typeorm_1.InjectRepository)(equipment_entity_1.Equipment)),
    __param(6, (0, typeorm_1.InjectRepository)(partner_entity_1.Partner)),
    __param(7, (0, typeorm_1.InjectRepository)(job_post_entity_1.JobPost)),
    __param(8, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map