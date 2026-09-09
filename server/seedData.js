// AUTO-SEED from src/data/mockData.ts — real NSSTA/MoSPI curriculum
export const SKILLS = [
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

export const ROLES = [
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



export const COURSES = [
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


