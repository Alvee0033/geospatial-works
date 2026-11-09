import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { HeroSlide } from '../../entities/hero-slide.entity';
import { PageSection } from '../../entities/page-section.entity';
import { Service } from '../../entities/service.entity';
import { Project } from '../../entities/project.entity';
import { Equipment } from '../../entities/equipment.entity';
import { Partner } from '../../entities/partner.entity';
import { JobPost, JobType, JobStatus } from '../../entities/job-post.entity';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(HeroSlide)
    private readonly heroSlideRepository: Repository<HeroSlide>,
    @InjectRepository(PageSection)
    private readonly pageSectionRepository: Repository<PageSection>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
  ) {}

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

  private async seedAdminUser() {
    const existing = await this.userRepository.findOne({ where: { email: 'admin@geospatialworks.com.bd' } });
    if (!existing) {
      const passwordHash = await bcrypt.hash('Admin@2026!GW', 12);
      await this.userRepository.save({
        email: 'admin@geospatialworks.com.bd',
        name: 'GW System Administrator',
        passwordHash,
        role: UserRole.ADMIN,
      });
      this.logger.log('Default Admin user created: admin@geospatialworks.com.bd');
    }
  }

  private async seedHeroSlides() {
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

  private async seedPageSections() {
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

  private async seedServices() {
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

  private async seedProjects() {
    const defaultProjects = [
      {
        slug: 'page-16-passenger-facilities-modernization-at-gabt',
        title: 'Passenger Facilities Modernization at Gabtoli Inter-District Bus Terminal',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'CIVIL & ARCHITECTURAL',
        location: 'Gabtoli, Dhaka',
        description: 'Comprehensive digital surveying and improvement planning for Gabtoli Bus Terminal.',
        deliverables: 'Digital Topographic Survey, Master Plan, Congestion Mitigation Layout',
        imageUrl: '/projects-extracted/page_16/img_02.jpg',
        isMilestone: true,
        sortOrder: 1,
      },
      {
        slug: 'page-17-gabtoli-terminal-3d-engineering---structura',
        title: 'Gabtoli Terminal 3D Engineering & Structural Models',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'CIVIL & ARCHITECTURAL',
        location: 'Gabtoli, Dhaka',
        description: 'Advanced 3D structural modeling (ETABS), Ground Floor architectural layouts, and digital survey verification.',
        deliverables: '3D Model Output (ETABS), Digital Survey Plotting, Ground Floor Layout, Typical Floor Plan',
        imageUrl: '/projects-extracted/page_17/img_05.jpg',
        isMilestone: true,
        sortOrder: 2,
      },
      {
        slug: 'page-18-gulshan-1-intersection-to-progati-sarani-hi',
        title: 'Gulshan-1 Intersection to Progati Sarani Highway & Drain Improvement',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'ROAD & TRANSPORT',
        location: 'Gulshan-1 to Progati Sarani, Dhaka',
        description: 'Road infrastructure improvement works along the critical Gulshan-1 to Progati Sarani link corridor.',
        deliverables: 'Road Geometric Alignment, Subsurface Drain Network, Median Demarcation, Traffic Circulation Plan',
        imageUrl: '/projects-extracted/page_18/img_02.jpg',
        isMilestone: true,
        sortOrder: 3,
      },
      {
        slug: 'page-19-gulshan-badda-corridor-passenger-waiting-sh',
        title: 'Gulshan-Badda Corridor Passenger Waiting Shelter & Road Sections',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'ROAD & TRANSPORT',
        location: 'Gulshan-Badda Corridor, Dhaka',
        description: '3D Model Output of passenger waiting shelters, drain layout plans, waiting shelter architectural floor plans, and detailed civil cross-sections.',
        deliverables: '3D Waiting Shelter Model, Drain Layout Plan, Waiting Shelter Plan, Section for Road',
        imageUrl: '/projects-extracted/page_19/img_02.jpg',
        isMilestone: true,
        sortOrder: 4,
      },
      {
        slug: 'page-20-passenger-facilities-modernization-at-moha',
        title: 'Passenger Facilities Modernization at Mohakhali Inter-District Bus Terminal',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'CIVIL & ARCHITECTURAL',
        location: 'Mohakhali, Dhaka',
        description: 'Comprehensive digital surveying, structural engineering, and passenger facility modernization at Mohakhali Inter-District Bus Terminal.',
        deliverables: 'Digital Boundary Survey, Terminal Traffic Flow Study, Facility Zoning Plan',
        imageUrl: '/projects-extracted/page_20/img_02.jpg',
        isMilestone: true,
        sortOrder: 5,
      },
      {
        slug: 'page-21-mohakhali-terminal-ticketing-counters---3d',
        title: 'Mohakhali Terminal Ticketing Counters & 3D Architectural Plans',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'CIVIL & ARCHITECTURAL',
        location: 'Mohakhali, Dhaka',
        description: 'Architectural floor plans and 3D perspectives separating AC and Non-AC bus counters, digital survey integration, and multi-tier passenger waiting amenities.',
        deliverables: 'Bus Counter Floor Plan, AC Bus Counter Plan, Non-AC Bus Counter Plan, 3D Model Perspective',
        imageUrl: '/projects-extracted/page_21/img_06.jpg',
        isMilestone: true,
        sortOrder: 6,
      },
      {
        slug: 'page-22-mohakhali-terminal-drainage-network---pali',
        title: 'Mohakhali Terminal Drainage Network & Palisading Engineering',
        client: 'Dhaka North City Corporation (DNCC)',
        category: 'CIVIL & ARCHITECTURAL',
        location: 'Mohakhali, Dhaka',
        description: 'Detailed civil structural drawings including heavy-load RCC box drain sections, retaining drop palisading details, and apron stormwater discharge layouts.',
        deliverables: 'Section for Drain, Section for Palisading, Stormwater Retention Details',
        imageUrl: '/projects-extracted/page_22/img_02.jpg',
        isMilestone: true,
        sortOrder: 7,
      },
      {
        slug: 'page-23-ltp-of-sanitary-landfill-at-moheshkhali-so',
        title: 'LTP of Sanitary Landfill at Moheshkhali Solid Waste Management',
        client: 'LGED / JICA / Nippon Koei / OSMO CORPORATION',
        category: 'ENVIRONMENTAL & CIVIL',
        location: 'Moheshkhali, Cox’s Bazar',
        description: 'Structural design and preparation of drawings for the Leachate Treatment Plant (LTP) under Moheshkhali SWM funded by JICA.',
        deliverables: 'Structural Calculations, Reinforcement Schedules, Technical Review with Nippon Koei, LTP Holding Cell Design',
        imageUrl: '/projects-extracted/page_24/img_02.png',
        isMilestone: true,
        sortOrder: 8,
      },
      {
        slug: 'page-24-moheshkhali-sanitary-landfill-structural-dr',
        title: 'Moheshkhali Sanitary Landfill Structural Drawing Outputs',
        client: 'LGED / Nippon Koei / OSMO CORPORATION',
        category: 'ENVIRONMENTAL & CIVIL',
        location: 'Moheshkhali, Cox’s Bazar',
        description: 'Engineering drawing outputs and reinforcement schedules for the Leachate Treatment Plant at Moheshkhali Sanitary Landfill.',
        deliverables: 'LTP Plan & Elevations, Structural Details, Bar Bending Schedules',
        imageUrl: '/projects-extracted/page_24/img_02.png',
        isMilestone: true,
        sortOrder: 9,
      },
      {
        slug: 'page-25-web-ais-pilot-research-project-on-irrigati',
        title: 'WEB-AIS Pilot Research Project on Irrigation Water Management',
        client: 'Bangladesh Agricultural Development Corporation (BADC)',
        category: 'WATER RESOURCES & GIS',
        location: 'Manikganj, Bangladesh',
        description: 'Pilot research project to improve irrigation water management and agricultural planning through high-precision spatial data.',
        deliverables: 'Canal Distribution Mapping, TBM & GCP Geodetic Network, Remote Sensing Baseline, GIS Database',
        imageUrl: '/projects-extracted/page_25/img_02.jpg',
        isMilestone: true,
        sortOrder: 10,
      },
      {
        slug: 'page-26-web-ais-spatial-data-outputs--tbm--land-co',
        title: 'WEB-AIS Spatial Data Outputs: TBM, Land Cover & Irrigation Canals',
        client: 'Bangladesh Agricultural Development Corporation (BADC)',
        category: 'WATER RESOURCES & GIS',
        location: 'Manikganj, Bangladesh',
        description: 'Comprehensive spatial datasets: Distribution of TBM & GCP Grid, Primary & Secondary Controls, Land Cover, Canals, and Pumps.',
        deliverables: 'Distribution of TBM and GCP Grid, Primary & Secondary Control Maps, Land Cover Classification, Irrigation Canal Distribution',
        imageUrl: '/projects-extracted/page_26/img_02.jpg',
        isMilestone: true,
        sortOrder: 11,
      },
      {
        slug: 'page-27-installation-of-water-level-gauge-readers-',
        title: 'Installation of Water-Level Gauge Readers & Topographic Survey',
        client: 'Bangladesh Agricultural Development Corporation (BADC)',
        category: 'WATER RESOURCES & GIS',
        location: 'Gangarampur Union, Batiaghata, Khulna',
        description: 'Installation and adjustment of river water level gauge readers at three critical monitoring locations in Gangarampur under BADC.',
        deliverables: 'Water Level Gauge Calibration, TBM Datum Transfer, River Water Depth Profiling, Bamboo Support Rig Installation',
        imageUrl: '/projects-extracted/page_27/img_02.jpg',
        isMilestone: true,
        sortOrder: 12,
      },
      {
        slug: 'page-28-gangarampur-hydrological-water-level-monit',
        title: 'Gangarampur Hydrological Water Level Monitoring Sites',
        client: 'Bangladesh Agricultural Development Corporation (BADC)',
        category: 'WATER RESOURCES & GIS',
        location: 'Batiaghata Upazila, Khulna',
        description: 'River gauging station outputs and calibrated water level readings across Jhopjhopia River Site and Guiyer Canal.',
        deliverables: 'Jhopjhopia River Water Level: 1.83m, Guiyer Canal Opening: 0.229m, Guiyer Canal Y-Section: 1.273m',
        imageUrl: '/projects-extracted/page_28/img_02.jpg',
        isMilestone: true,
        sortOrder: 13,
      },
      {
        slug: 'page-29-abdulpur-railway-bypass-topographic---uav-p',
        title: 'Abdulpur Railway Bypass Topographic & UAV Photogrammetry Survey',
        client: 'Bangladesh Railway / Oriental Consultants Global (OCG)',
        category: 'RAPID MAPPING & INFRASTRUCTURE',
        location: 'Abdulpur Bypass Station, Natore',
        description: 'Rapid delivery topographic and physical feature survey using RTK and RTK-enabled UAV drone flights for the Abdulpur Railway Bypass.',
        deliverables: 'Topographic Survey, UAV Flight Missions, Track Alignment Geometry, Rapid 14-Day Delivery',
        imageUrl: '/projects-extracted/page_29/img_02.jpg',
        isMilestone: true,
        sortOrder: 14,
      },
      {
        slug: 'page-30-abdulpur-railway-bypass-photogrammetry---su',
        title: 'Abdulpur Railway Bypass Photogrammetry & Surface Outputs',
        client: 'Bangladesh Railway / OCG',
        category: 'RAPID MAPPING & INFRASTRUCTURE',
        location: 'Abdulpur, Natore',
        description: 'High-precision engineering surface outputs: Digital Surface Model (DSM), Digital Terrain Model (DTM), High-Resolution Orthomosaic, 0.20m Contours.',
        deliverables: 'Digital Surface Model (DSM), Digital Terrain Model (DTM), High Resolution Orthomosaic, 0.20m Contours',
        imageUrl: '/projects-extracted/page_30/img_03.jpg',
        isMilestone: true,
        sortOrder: 15,
      },
      {
        slug: 'page-31-bus-route-rationalization---corridor-concep',
        title: 'Bus Route Rationalization & Corridor Concept Design for Dhaka',
        client: 'Dhaka Transport Coordination Authority (DTCA)',
        category: 'RAPID MAPPING & INFRASTRUCTURE',
        location: 'Dhaka Metropolitan Corridors',
        description: 'Preparation of Concept Design & Implementation Plan for Bus Route Rationalization and company-based bus service in Dhaka.',
        deliverables: 'UAV Drone Corridor Flights, Classified Traffic Count Survey, Origin-Destination Surveys, Corridor Concept Design',
        imageUrl: '/projects-extracted/page_31/img_01.jpg',
        isMilestone: true,
        sortOrder: 16,
      },
      {
        slug: 'page-32-dtca-arterial-corridor-digital-surface-mode',
        title: 'DTCA Arterial Corridor Digital Surface Model & Orthomosaic',
        client: 'Dhaka Transport Coordination Authority (DTCA)',
        category: 'RAPID MAPPING & INFRASTRUCTURE',
        location: 'Dhaka Arterial Roads',
        description: 'Dense urban corridor drone photogrammetry outputs: Digital Surface Model (DSM) and High-Resolution Orthomosaic covering key arterial transit routes.',
        deliverables: 'Corridor Digital Surface Model, High Resolution Orthomosaic, Junction Geometry Models',
        imageUrl: '/projects-extracted/page_32/img_02.jpg',
        isMilestone: true,
        sortOrder: 17,
      },
    ];

    for (const proj of defaultProjects) {
      const existing = await this.projectRepository.findOne({ where: { slug: proj.slug } });
      if (!existing) {
        await this.projectRepository.save(proj);
      } else {
        await this.projectRepository.update({ slug: proj.slug }, proj);
      }
    }
    const validSlugs = defaultProjects.map((p) => p.slug);
    const allInDb = await this.projectRepository.find();
    for (const p of allInDb) {
      if (!validSlugs.includes(p.slug)) {
        await this.projectRepository.delete({ id: p.id });
      }
    }
    this.logger.log('Projects seeded with all 17 page projects from PPT pages 16-32.');
  }

  private async seedEquipment() {
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

  private async seedPartners() {
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

  private async seedJobPosts() {
    const count = await this.jobPostRepository.count();
    if (count === 0) {
      const savedJobs = await this.jobPostRepository.save([
        {
          slug: 'lead-geodetic-surveyor',
          title: 'Lead Geodetic Surveyor (RTK & Total Station)',
          department: 'Geodesy & Ground Survey',
          location: 'Dhaka & Field Locations, Bangladesh',
          type: JobType.PERMANENT,
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
          status: JobStatus.PUBLISHED,
          isActive: true,
          sortOrder: 1,
        },
        {
          slug: 'uav-flight-operator',
          title: 'Commercial UAV Flight Operator & Photogrammetrist',
          department: 'Aerial Survey & Drone Fleet',
          location: 'Dhaka & Field Deployments',
          type: JobType.FULL_TIME,
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
          status: JobStatus.PUBLISHED,
          isActive: true,
          sortOrder: 2,
        },
        {
          slug: 'enterprise-gis-analyst',
          title: 'Enterprise GIS & PostGIS Spatial Developer',
          department: 'Spatial Intelligence & Digital Twins',
          location: 'Dhaka Headquarters',
          type: JobType.FULL_TIME,
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
          status: JobStatus.PUBLISHED,
          isActive: true,
          sortOrder: 3,
        },
        {
          slug: 'hydrographic-survey-engineer',
          title: 'Hydrographic & Bathymetric Survey Engineer',
          department: 'Marine & Water Resources',
          location: 'River Basin Sites & Dhaka HQ',
          type: JobType.FULL_TIME,
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
          status: JobStatus.PUBLISHED,
          isActive: true,
          sortOrder: 4,
        },
        {
          slug: 'subsurface-utility-engineer',
          title: 'Subsurface Utility Engineering (SUE) Specialist',
          department: 'Underground Infrastructure',
          location: 'Dhaka Metropolitan',
          type: JobType.FULL_TIME,
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
          status: JobStatus.PUBLISHED,
          isActive: true,
          sortOrder: 5,
        },
      ]);

      // Seed initial sample applications for demo and testing
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
            status: ApplicationStatus.SHORTLISTED,
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
            status: ApplicationStatus.NEW,
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
            status: ApplicationStatus.INTERVIEWED,
            internalNotes: 'Excellent flight log and Pix4D portfolio. Interview conducted on Nov 7.',
          },
        ]);
      }
      this.logger.log('Job posts and sample applications seeded.');
    }
  }
}

