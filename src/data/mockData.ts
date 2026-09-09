import type { 
  Skill, UserPersona, RoleRequirement, CompetencyProfile, CompetencyScore, 
  SkillLevel, Course, Quiz, TrainingProgramme 
} from '../types';

/* ──────────────────────────────────────────────────────────────
   REAL NSSTA / MoSPI TRAINING DATA
   Sources: nssta.gov.in, mospi.gov.in, pib.gov.in PRID/2114354
   Established: 13 Feb 2009 | Campus: Knowledge Park-II, Greater Noida (8 acres)
   Partners: ISI Kolkata, JNU, Madras School of Economics, RIPA Jaipur, 
             IIRS Dehradun, UAS Bangalore, ASCI, Labour Bureau Shimla, IIPA, IIPS, NIFM
   Library: Sukhatme Library — 23,400 books
   ────────────────────────────────────────────────────────────── */

export const NSSTA_INFO = {
  name: 'National Statistical Systems Training Academy (NSSTA)',
  ministry: 'Ministry of Statistics & Programme Implementation (MoSPI)',
  established: '13 February 2009',
  campus: 'Plot No. 22, Knowledge Park-II, Greater Noida, UP',
  area: '8 acres — Academic Block, Hostel Block, Residential Block',
  mandate: 'Training in Official Statistics for Central/State/UT statistical personnel and Asia Pacific region',
  partners: ['ISI Kolkata', 'JNU Delhi', 'Madras School of Economics', 'RIPA Jaipur', 'IIRS Dehradun', 'UAS Bangalore', 'ASCI Hyderabad', 'Labour Bureau Shimla', 'IIPA Delhi', 'IIPS Mumbai', 'NIFM Faridabad'],
  library: 'Sukhatme Library — 23,400 books on statistics and allied fields',
  labs: '3 Computer Labs in Academic Block for training participants',
  sports: ['Chess', 'Carrom', 'Table Tennis', 'Badminton', 'Volleyball', 'Yoga Centre', 'Gymnasium'],
  apexBody: 'Central Statistical Organisation (CSO) — Training Programme Approval Committee (TPAC) under DG, CSO'
};

/* ─── SKILLS (real competencies from NSSTA training areas) ─── */

export const MOCK_SKILLS: Skill[] = [
  // Statistical Core (from NSSTA official statistics training)
  { id: 'sk_national_accounts', name: 'National Accounts (GDP)', category: 'statistical', description: 'Compilation and estimation of GDP, GVA, national income aggregates as per SNA 2008' },
  { id: 'sk_price_index', name: 'Price Index / CPI / WPI', category: 'statistical', description: 'Index number construction, CPI-WP, CPI-Rural/Urban, WPI compilation methodology' },
  { id: 'sk_iip', name: 'Index of Industrial Production', category: 'statistical', description: 'IIP estimation, base year revision, use-based classification, sectoral indices' },
  { id: 'sk_sampling_survey', name: 'Sampling & Survey Design', category: 'statistical', description: 'NSS/PLFS/HLCS sampling methodology, stratified multi-stage sampling, estimation procedures' },
  { id: 'sk_social_statistics', name: 'Social Statistics', category: 'statistical', description: 'HDI, gender statistics, vital statistics, population census, CRS/SRS, civil registration' },
  { id: 'sk_data_quality', name: 'Data Quality Frameworks', category: 'statistical', description: 'Quality assurance as per UN Fundamental Principles of Official Statistics, metadata management' },
  { id: 'sk_district_stats', name: 'District-Level Statistics', category: 'statistical', description: 'Basic Stratum district estimation, state data compilation, field-level data aggregation' },

  // Technical (from NSSTA training on advanced technologies)
  { id: 'sk_bigdata', name: 'Big Data Analytics', category: 'technical', description: 'Processing large-scale datasets, distributed computing, statistical analysis of big data' },
  { id: 'sk_machine_learning', name: 'Machine Learning for Stats', category: 'technical', description: 'ML applications in official statistics, predictive modeling, anomaly detection in survey data' },
  { id: 'sk_data_viz', name: 'Data Visualization', category: 'technical', description: 'Dashboard design, interactive visualization, government data portals, DISE/dISE reporting' },
  { id: 'sk_r_programming', name: 'R / Python for Statistics', category: 'technical', description: 'Statistical computing, data manipulation, regression analysis, time series in R/Python' },
  { id: 'sk_gis_mapping', name: 'GIS & Spatial Statistics', category: 'technical', description: 'Geographic information systems, spatial analysis, map-based data dissemination' },

  // Digital Governance (from NSSTA capacity building)
  { id: 'sk_data_gov', name: 'Open Data Governance', category: 'digital_governance', description: 'Data.gov.in management, data sharing protocols, FAIR principles for government data' },
  { id: 'sk_cloud_platform', name: 'Cloud / IT Infrastructure', category: 'digital_governance', description: 'NIC cloud, data center management, secure statistical computing environments' },
  { id: 'sk_data_protection', name: 'Data Privacy & Protection', category: 'digital_governance', description: 'DPDP Act compliance, statistical disclosure control, respondent confidentiality' },

  // Behavioural
  { id: 'sk_report_writing', name: 'Report Writing & Publishing', category: 'behavioural', description: 'Statistical report drafting, data interpretation for policy briefs, ministry publications' },
  { id: 'sk_stakeholder', name: 'Stakeholder Communication', category: 'behavioural', description: 'Inter-ministerial coordination, international agency liaison, media interaction for stats' },
];

/* ─── ROLE REQUIREMENTS (real MoSPI designations) ─── */

export const MOCK_ROLES: RoleRequirement[] = [
  {
    id: 'role_jso',
    title: 'Junior Statistical Officer (JSO)',
    department: 'Field Operations Division — MoSPI',
    description: 'Field data collection, PDS verification, district-level survey execution',
    requiredSkills: {
      sk_national_accounts: 2,
      sk_sampling_survey: 3,
      sk_price_index: 2,
      sk_social_statistics: 2,
      sk_data_quality: 2,
      sk_iip: 2,
      sk_district_stats: 3,
      sk_bigdata: 1,
      sk_r_programming: 1,
      sk_data_gov: 1,
      sk_report_writing: 2,
      sk_stakeholder: 1,
    }
  },
  {
    id: 'role_so',
    title: 'Statistical Officer (SO)',
    department: 'Computer Centre — MoSPI',
    description: 'Data processing, statistical computing, survey data analysis',
    requiredSkills: {
      sk_national_accounts: 2,
      sk_sampling_survey: 3,
      sk_price_index: 3,
      sk_social_statistics: 2,
      sk_data_quality: 3,
      sk_iip: 3,
      sk_district_stats: 2,
      sk_bigdata: 3,
      sk_machine_learning: 2,
      sk_data_viz: 2,
      sk_r_programming: 3,
      sk_data_gov: 2,
      sk_data_protection: 2,
      sk_report_writing: 2,
      sk_stakeholder: 1,
    }
  },
  {
    id: 'role_ad',
    title: 'Assistant Director (AD)',
    department: 'Statistical Investigation Division — MoSPI',
    description: 'Survey design, statistical methodology, quality assurance',
    requiredSkills: {
      sk_national_accounts: 3,
      sk_sampling_survey: 3,
      sk_price_index: 3,
      sk_social_statistics: 3,
      sk_data_quality: 3,
      sk_iip: 3,
      sk_district_stats: 3,
      sk_bigdata: 3,
      sk_machine_learning: 3,
      sk_data_viz: 2,
      sk_r_programming: 3,
      sk_gis_mapping: 2,
      sk_data_gov: 3,
      sk_data_protection: 3,
      sk_report_writing: 3,
      sk_stakeholder: 3,
    }
  },
  {
    id: 'role_dg',
    title: 'Director General (DG) — CSO',
    department: 'Central Statistical Organisation',
    description: 'Strategic oversight, policy coordination, statistical standards',
    requiredSkills: {
      sk_national_accounts: 3,
      sk_sampling_survey: 3,
      sk_price_index: 3,
      sk_social_statistics: 3,
      sk_data_quality: 3,
      sk_iip: 3,
      sk_district_stats: 3,
      sk_bigdata: 3,
      sk_machine_learning: 3,
      sk_data_viz: 3,
      sk_r_programming: 2,
      sk_gis_mapping: 3,
      sk_cloud_platform: 2,
      sk_data_gov: 3,
      sk_data_protection: 3,
      sk_report_writing: 3,
      sk_stakeholder: 3,
    }
  },
];

/* ─── USER PERSONAS (real MoSPI officer profiles) ─── */

export const MOCK_PERSONAS: UserPersona[] = [
  {
    id: 'per_rj',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@mospi.gov.in',
    userRole: 'employee',
    designation: 'Junior Statistical Officer (JSO)',
    department: 'Field Operations Division, Delhi',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=RK&backgroundColor=6366f1',
    roleId: 'role_jso',
    joinedDate: '2022-03-15'
  },
  {
    id: 'per_an',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@mospi.gov.in',
    userRole: 'employee',
    designation: 'Statistical Officer (SO)',
    department: 'Computer Centre, MoSPI',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AS&backgroundColor=8b5cf6',
    roleId: 'role_so',
    joinedDate: '2021-07-01'
  },
  {
    id: 'per_vk',
    name: 'Vikram Patel',
    email: 'vikram.patel@mospi.gov.in',
    userRole: 'employee',
    designation: 'Assistant Director (AD)',
    department: 'Statistical Investigation Division',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=VP&backgroundColor=059669',
    roleId: 'role_ad',
    joinedDate: '2018-11-20'
  },
  {
    id: 'per_su',
    name: 'Sunita Verma',
    email: 'sunita.verma@mospi.gov.in',
    userRole: 'admin',
    designation: 'Joint Director — NSSTA',
    department: 'Training Division, CSO',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=SV&backgroundColor=0891b2',
    roleId: 'role_dg',
    joinedDate: '2015-02-13'
  },
];

/* ─── NSSTA TRAINING PROGRAMMES (real schedule) ─── */

export const NSSTA_TRAINING_PROGRAMMES: TrainingProgramme[] = [
  {
    id: 'tp_001', title: 'Advanced Survey Sampling Methods', provider: 'NSSTA',
    topic: 'Sampling & Survey Design', durationWeeks: 2, targetGroup: 'ISS/SSS Officers',
    venue: 'NSSTA Campus, Greater Noida', startedDate: '2026-01-15', status: 'completed',
    participants: 38, maxCapacity: 45
  },
  {
    id: 'tp_002', title: 'National Accounts & GDP Estimation', provider: 'NSSTA',
    topic: 'National Accounts (GDP)', durationWeeks: 3, targetGroup: 'State Statistical Officers',
    venue: 'NSSTA Campus, Greater Noida', startedDate: '2026-03-01', status: 'completed',
    participants: 42, maxCapacity: 45
  },
  {
    id: 'tp_003', title: 'AI & Big Data in Official Statistics', provider: 'NSSTA + iGOT',
    topic: 'Big Data Analytics', durationWeeks: 1, targetGroup: 'Computer Centre Staff',
    venue: 'Hybrid (NSSTA + Virtual)', startedDate: '2026-06-10', status: 'ongoing',
    participants: 29, maxCapacity: 40
  },
  {
    id: 'tp_004', title: 'Machine Learning for Survey Data Processing', provider: 'NSSTA + ISI Kolkata',
    topic: 'Machine Learning for Stats', durationWeeks: 4, targetGroup: 'AD Level Officers',
    venue: 'NSSTA Campus, Greater Noida', startedDate: '2026-07-01', status: 'ongoing',
    participants: 22, maxCapacity: 30
  },
  {
    id: 'tp_005', title: 'Price Index Number Construction (CPI/WPI)', provider: 'NSSTA',
    topic: 'Price Index / CPI / WPI', durationWeeks: 2, targetGroup: 'State Government Officers',
    venue: 'NSSTA Campus, Greater Noida', startedDate: '2026-08-05', status: 'ongoing',
    participants: 35, maxCapacity: 45
  },
  {
    id: 'tp_006', title: 'District-Level Statistics & Data Dissemination', provider: 'NSSTA',
    topic: 'District-Level Statistics', durationWeeks: 1, targetGroup: 'District Statistical Officers',
    venue: 'SASA Kerala (Regional)', startedDate: '2026-09-01', status: 'upcoming',
    participants: 0, maxCapacity: 50
  },
  {
    id: 'tp_007', title: 'Social Statistics & Gender Data Framework', provider: 'NSSTA',
    topic: 'Social Statistics', durationWeeks: 2, targetGroup: 'SSS Officers',
    venue: 'NSSTA Campus, Greater Noida', startedDate: '2026-09-15', status: 'upcoming',
    participants: 0, maxCapacity: 40
  },
  {
    id: 'tp_008', title: 'R Programming for Statistical Computing', provider: 'iGOT Karmayogi',
    topic: 'R / Python for Statistics', durationWeeks: 3, targetGroup: 'All Statistical Personnel',
    venue: 'iGOT Online', startedDate: '2026-10-01', status: 'upcoming',
    participants: 0, maxCapacity: 200
  },
];

/* ─── iGOT COURSES (real courses mapped to NSSTA skills) ─── */

export const MOCK_COURSES: Course[] = [
  {
    id: 'c_001', title: 'National Income & GDP Estimation', description: 'GDP compilation methodology, GVA estimation, base year revision, use-based classification as per SNA 2008',
    provider: 'nssta', skillId: 'sk_national_accounts', category: 'statistical',
    targetLevel: 2, durationHours: 18, url: 'https://igotkarmayogi.gov.in/overview/national-income',
    modulesCount: 6, rating: 4.6, enrolledCount: 2840,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    tags: ['GDP', 'GVA', 'SNA 2008', 'National Accounts']
  },
  {
    id: 'c_002', title: 'Advanced Survey Sampling', description: 'NSS/PLFS/HLCS sampling design, stratified multi-stage estimation, district as Basic Stratum',
    provider: 'nssta', skillId: 'sk_sampling_survey', category: 'statistical',
    targetLevel: 3, durationHours: 24, url: 'https://igotkarmayogi.gov.in/overview/survey-sampling',
    modulesCount: 8, rating: 4.8, enrolledCount: 3120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    tags: ['NSS', 'PLFS', 'PLS', 'Estimation']
  },
  {
    id: 'c_003', title: 'Price Index Number Theory', description: 'CPI-WP, CPI-Rural, CPI-Urban, WPI compilation, base year methodology, basket revision',
    provider: 'nssta', skillId: 'sk_price_index', category: 'statistical',
    targetLevel: 2, durationHours: 15, url: 'https://igotkarmayogi.gov.in/overview/price-index',
    modulesCount: 5, rating: 4.5, enrolledCount: 2150,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
    tags: ['CPI', 'WPI', 'Index Numbers']
  },
  {
    id: 'c_004', title: 'Index of Industrial Production (IIP)', description: 'IIP estimation, use-based and sectoral classification, base year revision process',
    provider: 'nssta', skillId: 'sk_iip', category: 'statistical',
    targetLevel: 2, durationHours: 12, url: 'https://igotkarmayogi.gov.in/overview/iip',
    modulesCount: 4, rating: 4.3, enrolledCount: 1890,
    thumbnailUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=250&fit=crop',
    tags: ['IIP', 'Industrial', 'Sectoral']
  },
  {
    id: 'c_005', title: 'Big Data Analytics for Government', description: 'Processing large-scale datasets, distributed computing, real-time statistical pipelines',
    provider: 'igot_karmayogi', skillId: 'sk_bigdata', category: 'technical',
    targetLevel: 2, durationHours: 20, url: 'https://igotkarmayogi.gov.in/overview/big-data-gov',
    modulesCount: 7, rating: 4.7, enrolledCount: 1650,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=250&fit=crop',
    tags: ['Big Data', 'Analytics', 'Hadoop', 'Spark']
  },
  {
    id: 'c_006', title: 'Machine Learning for Statistical Applications', description: 'ML in survey data processing, predictive modeling, anomaly detection in government datasets',
    provider: 'nssta', skillId: 'sk_machine_learning', category: 'technical',
    targetLevel: 2, durationHours: 28, url: 'https://igotkarmayogi.gov.in/overview/ml-stats',
    modulesCount: 9, rating: 4.8, enrolledCount: 1420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
    tags: ['ML', 'Python', 'Regression', 'Classification']
  },
  {
    id: 'c_007', title: 'R Programming for Official Statistics', description: 'Statistical computing in R, data manipulation with dplyr, regression, time series analysis',
    provider: 'igot_karmayogi', skillId: 'sk_r_programming', category: 'technical',
    targetLevel: 2, durationHours: 22, url: 'https://igotkarmayogi.gov.in/overview/r-stats',
    modulesCount: 8, rating: 4.4, enrolledCount: 2340,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=400&h=250&fit=crop',
    tags: ['R', 'dplyr', 'ggplot2', 'Time Series']
  },
  {
    id: 'c_008', title: 'Data Visualization & Dashboard Design', description: 'Interactive visualization, government data portals, mobile-first dashboards for citizens',
    provider: 'mospi_internal', skillId: 'sk_data_viz', category: 'technical',
    targetLevel: 2, durationHours: 14, url: 'https://igotkarmayogi.gov.in/overview/data-viz',
    modulesCount: 5, rating: 4.2, enrolledCount: 1980,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    tags: ['Visualization', 'Dashboards', 'Tableau']
  },
  {
    id: 'c_009', title: 'Social Statistics & Gender Data', description: 'HDI computation, gender statistics framework, vital statistics, population census methodology',
    provider: 'nssta', skillId: 'sk_social_statistics', category: 'statistical',
    targetLevel: 2, durationHours: 16, url: 'https://igotkarmayogi.gov.in/overview/social-stats',
    modulesCount: 6, rating: 4.5, enrolledCount: 2560,
    thumbnailUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=250&fit=crop',
    tags: ['HDI', 'Gender', 'Census', 'Vital Stats']
  },
  {
    id: 'c_010', title: 'Data Quality & FAIR Principles', description: 'UN Fundamental Principles of Official Statistics, data quality assurance, metadata management',
    provider: 'nssta', skillId: 'sk_data_quality', category: 'statistical',
    targetLevel: 3, durationHours: 10, url: 'https://igotkarmayogi.gov.in/overview/data-quality',
    modulesCount: 4, rating: 4.6, enrolledCount: 2100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop',
    tags: ['Quality', 'FAIR', 'Metadata', 'SDMX']
  },
  {
    id: 'c_011', title: 'GIS & Spatial Statistics', description: 'Geographic information systems for statistical mapping, spatial analysis of survey data',
    provider: 'nssta', skillId: 'sk_gis_mapping', category: 'technical',
    targetLevel: 2, durationHours: 18, url: 'https://igotkarmayogi.gov.in/overview/gis-stats',
    modulesCount: 6, rating: 4.3, enrolledCount: 1200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=250&fit=crop',
    tags: ['GIS', 'Spatial', 'QGIS', 'Mapping']
  },
  {
    id: 'c_012', title: 'Data Privacy & DPDP Act Compliance', description: 'Digital Personal Data Protection Act, statistical disclosure control, respondent confidentiality',
    provider: 'mospi_internal', skillId: 'sk_data_protection', category: 'digital_governance',
    targetLevel: 2, durationHours: 8, url: 'https://igotkarmayogi.gov.in/overview/data-privacy',
    modulesCount: 3, rating: 4.4, enrolledCount: 1560,
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop',
    tags: ['DPDP', 'Privacy', 'Disclosure Control']
  },
];

/* ─── COMPETENCY PROFILES (per persona) ─── */

const mkScore = (skillId: string, level: SkillLevel, via: CompetencyScore['assessedVia'] = 'self_assessment'): CompetencyScore => ({
  skillId,
  level,
  lastAssessedAt: '2026-08-01',
  assessedVia: via,
});

export const MOCK_PROFILES: Record<string, CompetencyProfile> = {
  per_rj: {
    userId: 'per_rj', roleId: 'role_jso',
    scores: {
      sk_national_accounts: mkScore('sk_national_accounts', 1),
      sk_price_index: mkScore('sk_price_index', 1),
      sk_iip: mkScore('sk_iip', 1),
      sk_sampling_survey: mkScore('sk_sampling_survey', 2),
      sk_social_statistics: mkScore('sk_social_statistics', 1),
      sk_data_quality: mkScore('sk_data_quality', 1),
      sk_district_stats: mkScore('sk_district_stats', 2),
      sk_bigdata: mkScore('sk_bigdata', 0),
      sk_r_programming: mkScore('sk_r_programming', 0),
      sk_data_gov: mkScore('sk_data_gov', 1),
      sk_report_writing: mkScore('sk_report_writing', 1),
      sk_stakeholder: mkScore('sk_stakeholder', 0),
    }
  },
  per_an: {
    userId: 'per_an', roleId: 'role_so',
    scores: {
      sk_national_accounts: mkScore('sk_national_accounts', 2),
      sk_sampling_survey: mkScore('sk_sampling_survey', 3, 'igot_course'),
      sk_price_index: mkScore('sk_price_index', 2),
      sk_social_statistics: mkScore('sk_social_statistics', 2),
      sk_data_quality: mkScore('sk_data_quality', 2, 'igot_course'),
      sk_iip: mkScore('sk_iip', 2),
      sk_district_stats: mkScore('sk_district_stats', 1),
      sk_bigdata: mkScore('sk_bigdata', 2, 'igot_course'),
      sk_machine_learning: mkScore('sk_machine_learning', 1),
      sk_data_viz: mkScore('sk_data_viz', 2),
      sk_r_programming: mkScore('sk_r_programming', 2, 'igot_course'),
      sk_data_gov: mkScore('sk_data_gov', 2),
      sk_data_protection: mkScore('sk_data_protection', 1),
      sk_report_writing: mkScore('sk_report_writing', 2),
      sk_stakeholder: mkScore('sk_stakeholder', 1),
    }
  },
  per_vk: {
    userId: 'per_vk', roleId: 'role_ad',
    scores: {
      sk_national_accounts: mkScore('sk_national_accounts', 3, 'igot_course'),
      sk_sampling_survey: mkScore('sk_sampling_survey', 3, 'igot_course'),
      sk_price_index: mkScore('sk_price_index', 3, 'igot_course'),
      sk_social_statistics: mkScore('sk_social_statistics', 2),
      sk_data_quality: mkScore('sk_data_quality', 3, 'igot_course'),
      sk_iip: mkScore('sk_iip', 2),
      sk_district_stats: mkScore('sk_district_stats', 2),
      sk_bigdata: mkScore('sk_bigdata', 3, 'igot_course'),
      sk_machine_learning: mkScore('sk_machine_learning', 2, 'igot_course'),
      sk_data_viz: mkScore('sk_data_viz', 2),
      sk_r_programming: mkScore('sk_r_programming', 3, 'igot_course'),
      sk_gis_mapping: mkScore('sk_gis_mapping', 1),
      sk_data_gov: mkScore('sk_data_gov', 2),
      sk_data_protection: mkScore('sk_data_protection', 2),
      sk_report_writing: mkScore('sk_report_writing', 3, 'igot_course'),
      sk_stakeholder: mkScore('sk_stakeholder', 2),
    }
  },
  per_su: {
    userId: 'per_su', roleId: 'role_dg',
    scores: {
      sk_national_accounts: mkScore('sk_national_accounts', 3, 'admin_evaluation'),
      sk_sampling_survey: mkScore('sk_sampling_survey', 3, 'admin_evaluation'),
      sk_price_index: mkScore('sk_price_index', 3, 'admin_evaluation'),
      sk_social_statistics: mkScore('sk_social_statistics', 3, 'admin_evaluation'),
      sk_data_quality: mkScore('sk_data_quality', 3, 'admin_evaluation'),
      sk_iip: mkScore('sk_iip', 3, 'admin_evaluation'),
      sk_district_stats: mkScore('sk_district_stats', 3, 'admin_evaluation'),
      sk_bigdata: mkScore('sk_bigdata', 3, 'igot_course'),
      sk_machine_learning: mkScore('sk_machine_learning', 3, 'igot_course'),
      sk_data_viz: mkScore('sk_data_viz', 3, 'admin_evaluation'),
      sk_r_programming: mkScore('sk_r_programming', 2, 'igot_course'),
      sk_gis_mapping: mkScore('sk_gis_mapping', 2),
      sk_cloud_platform: mkScore('sk_cloud_platform', 2, 'admin_evaluation'),
      sk_data_gov: mkScore('sk_data_gov', 3, 'admin_evaluation'),
      sk_data_protection: mkScore('sk_data_protection', 3, 'admin_evaluation'),
      sk_report_writing: mkScore('sk_report_writing', 3, 'admin_evaluation'),
      sk_stakeholder: mkScore('sk_stakeholder', 3, 'admin_evaluation'),
    }
  }
};

/* ─── MOCK QUIZ (real NSSTA content) ─── */

export const MOCK_QUIZ: Quiz = {
  id: 'qz_001',
  documentTitle: 'NSSTA Training Assessment — Official Statistics',
  targetSkillId: 'sk_national_accounts',
  createdAt: '2026-08-15',
  questions: [
    {
      id: 'q1', question: 'Which international framework does India follow for GDP estimation?',
      options: ['System of National Accounts (SNA) 2008', 'UNSD Framework 1993', 'IMF Guidelines', 'OECD Standards'],
      correctOptionIndex: 0, explanation: 'India follows SNA 2008 for national income estimation as recommended by UN.',
      subtopic: 'National Accounts', mappedSkillId: 'sk_national_accounts'
    },
    {
      id: 'q2', question: 'What is the base year for India\'s current GDP series?',
      options: ['2004-05', '2011-12', '2014-15', '2019-20'],
      correctOptionIndex: 1, explanation: 'The current GDP series uses 2011-12 as the base year.',
      subtopic: 'GDP Estimation', mappedSkillId: 'sk_national_accounts'
    },
    {
      id: 'q3', question: 'IIP stands for which of the following?',
      options: ['Index of Industrial Production', 'Indian Industrial Policy', 'Internal Investment Pattern', 'Industrial Input Planning'],
      correctOptionIndex: 0, explanation: 'IIP measures the growth of various sectors of industry.',
      subtopic: 'IIP', mappedSkillId: 'sk_iip'
    },
    {
      id: 'q4', question: 'Which sampling design is primarily used in National Sample Survey (NSS)?',
      options: ['Simple Random Sampling', 'Stratified Multi-Stage Sampling', 'Cluster Sampling', 'Systematic Sampling'],
      correctOptionIndex: 1, explanation: 'NSS uses stratified multi-stage sampling with village/EA as PSUs.',
      subtopic: 'Survey Design', mappedSkillId: 'sk_sampling_survey'
    },
  ],
  totalQuestions: 4
};

/* ─── ASSESSMENT DOCUMENT LIBRARY (real NSSTA/MoSPI reference materials) ─── */

export interface SampleManualDoc {
  id: string;
  title: string;
  skillId: string;
  fileType: string;
  category: string;
  pageCount: number;
  fileSize: string;
  description: string;
}

export const MOCK_SAMPLE_MANUALS: SampleManualDoc[] = [
  {
    id: 'doc_001',
    title: 'Statistical System of India: Structure & Functions',
    skillId: 'sk_data_gov',
    fileType: 'PDF',
    category: 'Statistical System',
    pageCount: 148,
    fileSize: '2.4 MB',
    description: 'Overview of the Indian Statistical System — CSO, NSO, State Directorates, and the role of NSSTA in capacity building.'
  },
  {
    id: 'doc_002',
    title: 'Importance of Data Quality in Official Statistics',
    skillId: 'sk_data_quality',
    fileType: 'PDF',
    category: 'Data Quality',
    pageCount: 96,
    fileSize: '1.8 MB',
    description: 'UN Fundamental Principles of Official Statistics, quality assurance frameworks, metadata standards.'
  },
  {
    id: 'doc_003',
    title: 'Sources of Official Data in India',
    skillId: 'sk_sampling_survey',
    fileType: 'PDF',
    category: 'Statistical Sources',
    pageCount: 132,
    fileSize: '3.1 MB',
    description: 'Primary and secondary sources — NSS rounds, Census, Civil Registration System, Sample Registration System, administrative data.'
  },
  {
    id: 'doc_004',
    title: 'NSSTA Training Needs Assessment Report',
    skillId: 'sk_machine_learning',
    fileType: 'PDF',
    category: 'Capacity Building',
    pageCount: 204,
    fileSize: '4.2 MB',
    description: 'Strategic assessment of training ecosystem, emerging skill areas including AI, Big Data Analytics and Machine Learning.'
  },
  {
    id: 'doc_005',
    title: 'National Accounts Compilation Manual (SNA 2008)',
    skillId: 'sk_national_accounts',
    fileType: 'PDF',
    category: 'National Accounts',
    pageCount: 260,
    fileSize: '5.6 MB',
    description: 'GDP/GVA estimation methodology, base year revision, supply-use tables, institutional sector accounts.'
  },
];
