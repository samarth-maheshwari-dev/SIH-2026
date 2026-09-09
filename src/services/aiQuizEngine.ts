import type { Quiz, MCQQuestion, QuizAttempt, SkillLevel } from '../types';

import { SKILL_MAP } from '../data/taxonomy';
import { aiChat } from './aiService';

export const QUIZ_QUESTIONS_COUNT = 20;

/**
 * Robust JSON array repair — handles LLM outputs that get truncated mid-array.
 * Strategy:
 *   1. Strip markdown fences.
 *   2. Try strict parse.
 *   3. If fails, salvage the last complete object by walking braces/strings,
 *      then close the array so `[ {...}, {...}, {...` → `[ {...}, {...} ]`.
 */
export function repairQuizJson(input: string): MCQQuestion[] | null {
  let cleaned = input
    .replace(/```json/gi, '')
    .replace(/```/gi, '')
    .trim();

  // If there's text after the first [ and last ], keep just the array span
  const arrStart = cleaned.indexOf('[');
  const arrEnd = cleaned.lastIndexOf(']');
  if (arrStart < 0) return null;
  cleaned = arrEnd > arrStart ? cleaned.substring(arrStart, arrEnd + 1) : cleaned.substring(arrStart);

  // 1) Strict parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* fall through to repair */ }

  // 2) Truncated-array repair: break into top-level objects braces
  //    Scan char-by-char tracking string state, depth, and object boundaries.
  const objs: string[] = [];
  let depth = 0;
  let current = '';
  let inString = false;
  let escaped = false;

  for (const ch of cleaned) {
    current += ch;
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') {
      depth++;
      // start a new object if we were at array level
      if (depth === 1) current = '{';
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        objs.push(current.trim());
        current = '';
      }
    }
  }

  if (objs.length === 0) return null;

  // 3) Reassemble into an array and try parse; drop any object that fails.
  const valid: MCQQuestion[] = [];
  for (const objStr of objs) {
    try {
      const obj = JSON.parse(objStr);
      if (obj && typeof obj === 'object') valid.push(obj);
    } catch { /* skip malformed object — likely truncated tail */ }
  }

  return valid.length > 0 ? valid : null;
}

/* ──────────────────────────────────────────────────────────────
   OFFLINE QUESTION POOL (real NSSTA/MoSPI content)
   Large bank so every refresh picks a fresh random set of 20.
   ────────────────────────────────────────────────────────────── */
interface PoolQ extends Omit<MCQQuestion, 'options'> {
  options: string[];
}

const QUESTION_POOL: PoolQ[] = [
  // ===== National Accounts (SNA 2008) =====
  { id: 'na_1', question: 'In GDP compilation under SNA 2008, what is the relation between GDP at Market Prices and GVA at Basic Prices?', options: ['GDP = GVA + Product Taxes - Product Subsidies', 'GDP = GVA - Product Taxes + Product Subsidies', 'GDP = GVA × Inflation Index', 'GDP = Net National Product'], correctOptionIndex: 0, explanation: 'GDP at Market Prices = GVA at Basic Prices + Product Taxes − Product Subsidies, per SNA 2008.', subtopic: 'GDP & GVA Accounting', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_2', question: 'Which table reconciles production accounts and commodity balances in National Accounts?', options: ['Input-Output Table', 'Supply and Use Tables (SUT)', 'Financial Flow Matrix', 'Balance of Payments'], correctOptionIndex: 1, explanation: 'Supply and Use Tables (SUT) track origins of goods/services and their use in intermediate/final consumption.', subtopic: 'Supply-Use Tables (SUT)', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_3', question: 'What is the current base year for India\'s National Accounts series compiled by CSO?', options: ['2004-05', '2011-12', '2017-18', '2020-21'], correctOptionIndex: 1, explanation: 'The current GDP series uses 2011-12 as base year, with periodic revisions by MoSPI.', subtopic: 'Base Year & Index Revision', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_4', question: 'How is Consumption of Fixed Capital (CFC) treated moving from GVA to Net Value Added?', options: ['Added to GVA', 'Subtracted from GVA (NVA = GVA - CFC)', 'Ignored in national accounting', 'Multiplied by tax rate'], correctOptionIndex: 1, explanation: 'NVA = GVA − CFC; depreciation of physical capital is deducted.', subtopic: 'Capital Stocks & Depreciation', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_5', question: 'Which indicators proxy informal-sector GVA growth in quarterly GDP estimates?', options: ['ASI only', 'PLFS labour data + high-frequency indicators (GST/Credit/Cargo)', 'Stock exchange index', 'Customs duty data'], correctOptionIndex: 1, explanation: 'PLFS + high-frequency volume indicators benchmark unorganised sector between quinquennial surveys.', subtopic: 'Informal Sector Benchmarking', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_6', question: 'The SNA 2008 framework recommends which approach as primary for GDP compilation?', options: ['Income approach only', 'Production approach (GVA)', 'Expenditure approach only', 'Monetary approach'], correctOptionIndex: 1, explanation: 'Production approach is primary; income and expenditure approaches validate it.', subtopic: 'GDP Compilation Approaches', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_7', question: 'What does Gross Value Added (GVA) at Basic Prices exclude?', options: ['Compensation of employees', 'Product taxes', 'Consumption of fixed capital', 'Operating surplus'], correctOptionIndex: 1, explanation: 'GVA at basic prices excludes product taxes but includes product subsidies.', subtopic: 'GVA Components', mappedSkillId: 'sk_national_accounts' },
  { id: 'na_8', question: 'Which sector contributes the largest share to India\'s GVA?', options: ['Agriculture', 'Industry', 'Services', 'Mining'], correctOptionIndex: 2, explanation: 'Services sector dominates India\'s GVA (~54-55% as per MoSPI releases).', subtopic: 'Sectoral Composition', mappedSkillId: 'sk_national_accounts' },

  // ===== Sampling & Survey Design =====
  { id: 'samp_1', question: 'In NSS rural household surveys, what typically constitutes the First Stage Unit (FSU)?', options: ['Individual Household', 'Census Village / Gram Panchayat', 'District Headquarters', 'Hamlet Group'], correctOptionIndex: 1, explanation: 'Census villages serve as FSUs; households are Second Stage Units (SSUs).', subtopic: 'Sampling Frame & Unit Selection', mappedSkillId: 'sk_sampling_survey' },
  { id: 'samp_2', question: 'Which design ensures small/rare population sub-groups are represented?', options: ['Simple Random Sampling', 'Stratified Random Sampling', 'Systematic Sampling', 'Convenience Sampling'], correctOptionIndex: 1, explanation: 'Stratification divides population into homogeneous strata ensuring sub-domain representation.', subtopic: 'Stratification Strategy', mappedSkillId: 'sk_sampling_survey' },
  { id: 'samp_3', question: 'What is the primary function of Multipliers/Weights in MoSPI survey pipelines?', options: ['Reduce non-response to zero', 'Inflate sample totals to population level accounting for selection probability', 'Eliminate measurement error', 'Standardize questionnaire length'], correctOptionIndex: 1, explanation: 'Inverse selection-probability weights convert sample aggregates into unbiased population estimates.', subtopic: 'Weight Calibration & Multipliers', mappedSkillId: 'sk_sampling_survey' },
  { id: 'samp_4', question: 'When is Probability Proportional to Size (PPS) preferred over SRS for village selection?', options: ['All villages same size', 'Village sizes vary significantly and larger villages influence estimates more', 'Unlimited budget', 'Only urban surveys'], correctOptionIndex: 1, explanation: 'PPS selects units with probability proportional to size (population), lowering sampling variance.', subtopic: 'PPS Sampling Methodology', mappedSkillId: 'sk_sampling_survey' },
  { id: 'samp_5', question: 'How is non-response bias mitigated in NSS data processing?', options: ['Discard the whole stratum', 'Re-weight responding units within same sub-stratum', 'Double weights of non-respondents', 'Substitute neighbouring households without documentation'], correctOptionIndex: 1, explanation: 'Non-response adjustment reallocates weights of non-responding SSUs to responding ones in the same sub-stratum.', subtopic: 'Non-Response Adjustment', mappedSkillId: 'sk_sampling_survey' },
  { id: 'samp_6', question: 'In the recent NSS rounds, district is treated as which sampling unit?', options: ['Primary Stratum', 'Basic Stratum', 'Secondary Stratum', 'Ultimate Unit'], correctOptionIndex: 1, explanation: 'District as Basic Stratum enables district-level estimates for participating states.', subtopic: 'District-Level Estimation', mappedSkillId: 'sk_district_stats' },
  { id: 'samp_7', question: 'What is the purpose of two-stage sampling in large-scale surveys?', options: ['Save cost with PSU frame only', 'Efficient listing of SSUs within sampled PSUs', 'Avoid stratification', 'Increase sample size arbitrarily'], correctOptionIndex: 1, explanation: 'Two-stage design lists SSUs only within selected PSUs, cutting listing costs.', subtopic: 'Multi-Stage Sampling', mappedSkillId: 'sk_sampling_survey' },
  { id: 'samp_8', question: 'Which survey generates India\'s official unemployment statistics?', options: ['Consumer Pyramids', 'Periodic Labour Force Survey (PLFS)', 'NSS 75th Round only', 'Economic Census'], correctOptionIndex: 1, explanation: 'PLFS produces quarterly urban + annual rural WPR/LFPR/UR estimates.', subtopic: 'PLFS & Labour Surveys', mappedSkillId: 'sk_sampling_survey' },

  // ===== Price Index (CPI/WPI) =====
  { id: 'cpi_1', question: 'Which base year is used for the current CPI series in India?', options: ['2004-05', '2012', '2015', '2019'], correctOptionIndex: 1, explanation: 'Current CPI (combined) uses 2012 base year.', subtopic: 'CPI Base Year', mappedSkillId: 'sk_price_index' },
  { id: 'cpi_2', question: 'CPI is a measure of:', options: ['Wholesale price changes', 'Retail price inflation faced by consumers', 'Industrial output growth', 'Export price changes'], correctOptionIndex: 1, explanation: 'CPI tracks retail price changes of a consumer basket.', subtopic: 'CPI Concepts', mappedSkillId: 'sk_price_index' },
  { id: 'cpi_3', question: 'WPI in India is compiled by:', options: ['NITI Aayog', 'Office of Economic Adviser (DPIIT)', 'RBI', 'NSSTA'], correctOptionIndex: 1, explanation: 'WPI is compiled by the Office of Economic Adviser, DPIIT.', subtopic: 'WPI Compilation', mappedSkillId: 'sk_price_index' },
  { id: 'cpi_4', question: 'Which index has the largest weight in CPI (combined)?', options: ['Housing', 'Food & Beverages', 'Transport', 'Clothing'], correctOptionIndex: 1, explanation: 'Food & Beverages carry ~45% weight in CPI combined.', subtopic: 'CPI Weights', mappedSkillId: 'sk_price_index' },
  { id: 'cpi_5', question: 'Laspeyres index uses which weights?', options: ['Current year quantities', 'Base year quantities', 'Average quantities', 'None'], correctOptionIndex: 1, explanation: 'Laspeyres price index uses base-period quantity weights.', subtopic: 'Index Number Theory', mappedSkillId: 'sk_price_index' },

  // ===== IIP =====
  { id: 'iip_1', question: 'What does IIP measure?', options: ['Agricultural output', 'Growth of industrial sectors', 'Service sector growth', 'Import volumes'], correctOptionIndex: 1, explanation: 'IIP measures industrial production growth across mining, manufacturing, electricity.', subtopic: 'IIP Concepts', mappedSkillId: 'sk_iip' },
  { id: 'iip_2', question: 'Which base year does the current IIP series use?', options: ['2004-05', '2011-12', '2017-18', '2020-21'], correctOptionIndex: 1, explanation: 'IIP 2011-12 base; revision to 2017-18 underway.', subtopic: 'IIP Base Year', mappedSkillId: 'sk_iip' },
  { id: 'iip_3', question: 'The use-based classification of IIP includes:', options: ['Primary goods, capital goods, intermediate goods', 'Only consumer goods', 'Only capital goods', 'Agricultural and industrial goods'], correctOptionIndex: 0, explanation: 'IIP use-based: primary, capital, intermediate, infrastructure, consumer durables/non-durables.', subtopic: 'IIP Classification', mappedSkillId: 'sk_iip' },
  { id: 'iip_4', question: 'Which sector has the highest weight in IIP?', options: ['Mining', 'Manufacturing', 'Electricity', 'Construction'], correctOptionIndex: 1, explanation: 'Manufacturing dominates IIP (~77% weight).', subtopic: 'IIP Weights', mappedSkillId: 'sk_iip' },

  // ===== Social Statistics =====
  { id: 'soc_1', question: 'How is the Human Development Index (HDI) computed?', options: ['Only per-capita income', 'Geometric mean of health, education, income indices', 'Arithmetic mean of GDP and literacy', 'Life expectancy only'], correctOptionIndex: 1, explanation: 'HDI = geometric mean of life expectancy, education, and GNI per capita indices.', subtopic: 'HDI Computation', mappedSkillId: 'sk_social_statistics' },
  { id: 'soc_2', question: 'Which system records vital events (births/deaths) in India?', options: ['Census', 'Civil Registration System (CRS)', 'NSS', 'ECI'], correctOptionIndex: 1, explanation: 'CRS records births/deaths under Registration of Births & Deaths Act.', subtopic: 'Vital Statistics & CRS', mappedSkillId: 'sk_social_statistics' },
  { id: 'soc_3', question: 'The Sample Registration System (SRS) is used to estimate:', options: ['GDP growth', 'Birth and death rates', 'Industrial output', 'Price inflation'], correctOptionIndex: 1, explanation: 'SRS provides annual estimates of vital rates (CBR, CDR, IMR).', subtopic: 'Sample Registration System', mappedSkillId: 'sk_social_statistics' },
  { id: 'soc_4', question: 'Gender statistics frameworks measure:', options: ['Only population counts', 'Disaggregated indicators on empowerment, health, education, work', 'Caste counts only', 'Migration only'], correctOptionIndex: 1, explanation: 'Gender stats use sex-disaggregated SDG indicators across domains.', subtopic: 'Gender Statistics', mappedSkillId: 'sk_social_statistics' },

  // ===== Data Quality =====
  { id: 'dq_1', question: 'Which body established the Fundamental Principles of Official Statistics?', options: ['IMF', 'United Nations', 'World Bank', 'OECD'], correctOptionIndex: 1, explanation: 'UN adopted the Fundamental Principles of Official Statistics (1994, reaffirmed 2014).', subtopic: 'UN Principles', mappedSkillId: 'sk_data_quality' },
  { id: 'dq_2', question: 'FAIR data principles stand for:', options: ['Fast, Available, Integrated, Reliable', 'Findable, Accessible, Interoperable, Reusable', 'Formal, Agile, Iterative, Responsive', 'Flexible, Accurate, Insightful, Robust'], correctOptionIndex: 1, explanation: 'FAIR = Findable, Accessible, Interoperable, Reusable — key for open statistical data.', subtopic: 'FAIR Principles', mappedSkillId: 'sk_data_quality' },
  { id: 'dq_3', question: 'SDMX is a standard for:', options: ['Survey sampling', 'Statistical data and metadata exchange', 'Data visualization', 'Questionnaire design'], correctOptionIndex: 1, explanation: 'SDMX standardises statistical data/metadata exchange between agencies.', subtopic: 'Metadata Standards', mappedSkillId: 'sk_data_quality' },
  { id: 'dq_4', question: 'Statistical disclosure control aims to:', options: ['Publish all microdata openly', 'Prevent identification of individual respondents in published data', 'Increase response rates', 'Reduce collection costs'], correctOptionIndex: 1, explanation: 'Disclosure control (suppression, perturbation) protects respondent confidentiality.', subtopic: 'Disclosure Control', mappedSkillId: 'sk_data_protection' },

  // ===== Big Data & ML =====
  { id: 'bd_1', question: 'Big data in official statistics refers to:', options: ['Only census data', 'High-volume, high-velocity data from digital sources (mobile, scanners, satellites)', 'Paper survey returns', 'Old administrative registers'], correctOptionIndex: 1, explanation: 'Big data includes scanner data, mobile positioning, satellite imagery for official statistics.', subtopic: 'Big Data Sources', mappedSkillId: 'sk_bigdata' },
  { id: 'bd_2', question: 'Which ML task predicts binary outcomes in survey data?', options: ['Regression', 'Classification', 'Clustering', 'Dimensionality reduction'], correctOptionIndex: 1, explanation: 'Classification predicts discrete labels (e.g. respondent category).', subtopic: 'ML for Surveys', mappedSkillId: 'sk_machine_learning' },
  { id: 'bd_3', question: 'Anomaly detection in survey data is used to:', options: ['Increase sample size', 'Flag implausible/erroneous records', 'Replace sampling design', 'Generate reports'], correctOptionIndex: 1, explanation: 'Anomaly detection flags outliers/errors for validation before estimation.', subtopic: 'Anomaly Detection', mappedSkillId: 'sk_machine_learning' },
  { id: 'bd_4', question: 'Scanner data in CPI compilation helps:', options: ['Reduce respondent burden and increase price coverage', 'Replace field staff entirely', 'Compute GDP directly', 'Conduct census'], correctOptionIndex: 0, explanation: 'Scanner data from retailers provides granular, timely price observations.', subtopic: 'Scanner Data', mappedSkillId: 'sk_bigdata' },

  // ===== R/Python & Viz =====
  { id: 'py_1', question: 'Which Pandas method merges datasets on common keys?', options: ['pd.concat()', 'pd.merge()', 'pd.append()', 'df.join_records()'], correctOptionIndex: 1, explanation: 'pd.merge() performs SQL-style joins on key columns.', subtopic: 'Data Merging', mappedSkillId: 'sk_r_programming' },
  { id: 'py_2', question: 'How to compute weighted mean of CPI prices in Python?', options: ['df.mean()', 'np.average(df["price"], weights=df["weight"])', 'df["price"].sum()/len(df)', 'df.groupby("item").mean()'], correctOptionIndex: 1, explanation: 'np.average() accepts a weights parameter for weighted means.', subtopic: 'Statistical Aggregation', mappedSkillId: 'sk_r_programming' },
  { id: 'py_3', question: 'Which library detects outliers via Interquartile Range?', options: ['SciPy / NumPy', 'Flask', 'Requests', 'BeautifulSoup'], correctOptionIndex: 0, explanation: 'np.percentile computes Q1/Q3 to define IQR bounds.', subtopic: 'Data Cleaning', mappedSkillId: 'sk_r_programming' },
  { id: 'py_4', question: 'Why are vectorized Pandas operations faster than for-loops?', options: ['Less disk usage', 'C-optimized SIMD execution on NumPy arrays', 'Avoids memory entirely', 'Auto-formatting'], correctOptionIndex: 1, explanation: 'Vectorized ops run C/SIMD batch instructions without interpreter loop overhead.', subtopic: 'Performance', mappedSkillId: 'sk_r_programming' },
  { id: 'py_5', question: 'Which R package is the standard for tidy data manipulation?', options: ['ggplot2', 'dplyr', 'shiny', 'knitr'], correctOptionIndex: 1, explanation: 'dplyr provides filter/select/mutate/summarise grammar of data manipulation.', subtopic: 'R Packages', mappedSkillId: 'sk_r_programming' },

  // ===== GIS =====
  { id: 'gis_1', question: 'GIS in official statistics is used for:', options: ['Text analysis only', 'Spatial mapping and geospatial analysis of survey data', 'Database indexing', 'Email automation'], correctOptionIndex: 1, explanation: 'GIS supports thematic mapping, spatial interpolation of survey estimates.', subtopic: 'GIS Applications', mappedSkillId: 'sk_gis_mapping' },
  { id: 'gis_2', question: 'Which open-source tool is commonly used for GIS?', options: ['MS Word', 'QGIS', 'Excel', 'PowerPoint'], correctOptionIndex: 1, explanation: 'QGIS is a leading open-source GIS platform used by statistical agencies.', subtopic: 'GIS Tools', mappedSkillId: 'sk_gis_mapping' },

  // ===== Governance / Privacy =====
  { id: 'gov_1', question: 'Which Act governs personal data protection in India?', options: ['IT Act 2000 only', 'Digital Personal Data Protection Act 2023', 'RTI Act 2005', 'Aadhaar Act'], correctOptionIndex: 1, explanation: 'DPDP Act 2023 regulates digital personal data processing in India.', subtopic: 'DPDP Act', mappedSkillId: 'sk_data_protection' },
  { id: 'gov_2', question: 'Open Government Data (data.gov.in) aims to:', options: ['Restrict public access', 'Promote transparency and reuse of government datasets', 'Sell data to private firms', 'Hide ministry data'], correctOptionIndex: 1, explanation: 'India\'s open data platform promotes transparency and citizen reuse.', subtopic: 'Open Data', mappedSkillId: 'sk_data_gov' },
  { id: 'gov_3', question: 'Which platform hosts training for government officials?', options: ['SWAYAM', 'iGOT Karmayogi', 'NPTEL', 'Coursera'], correctOptionIndex: 1, explanation: 'iGOT Karmayogi is the integrated government online training platform.', subtopic: 'iGOT Platform', mappedSkillId: 'sk_data_gov' },

  // ===== Report Writing / Behavioural =====
  { id: 'rep_1', question: 'A good statistical report should:', options: ['Include raw unprocessed data only', 'Present findings with clear tables, metadata, and interpretation', 'Avoid charts', 'Only list survey errors'], correctOptionIndex: 1, explanation: 'Statistical reports require clear presentation, metadata and policy interpretation.', subtopic: 'Report Standards', mappedSkillId: 'sk_report_writing' },
  { id: 'rep_2', question: 'Inter-ministerial statistical coordination requires:', options: ['Working in silos', 'Shared metadata standards and secure data-sharing protocols', 'Avoiding communication', 'Deleting duplicate data'], correctOptionIndex: 1, explanation: 'Coordination relies on common standards and data-sharing frameworks.', subtopic: 'Stakeholder Coordination', mappedSkillId: 'sk_stakeholder' },
];

/** Shuffle helper (Fisher–Yates). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random, distinct questions from a pool — ensures every refresh differs. */
function pickRandom(pool: PoolQ[], n: number): MCQQuestion[] {
  return shuffle(pool)
    .slice(0, n)
    .map((q, i) => ({
      ...q,
      id: `q_${Date.now()}_${i}`,
      options: q.options as [string, string, string, string],
    }));
}

/** Random 20 from the full offline pool — varies each call. */
export function getOfflineQuiz(targetSkillId: string): MCQQuestion[] {
  // Prefer questions mapped to the target skill, then fill from the rest.
  const skillPool = QUESTION_POOL.filter(q => q.mappedSkillId === targetSkillId);
  const restPool = QUESTION_POOL.filter(q => q.mappedSkillId !== targetSkillId);
  const combined = shuffle([...skillPool, ...restPool]);
  return pickRandom(combined, Math.min(QUIZ_QUESTIONS_COUNT, combined.length));
}

export async function generateQuizFromDocument(
  docTitle: string,
  docContentText: string,
  targetSkillId: string
): Promise<Quiz & { provider?: string }> {
  const skill = SKILL_MAP.get(targetSkillId);
  const skillName = skill ? skill.name : 'Statistical Competency';

  // Fresh random seed each call → new questions on every refresh
  const seed = Math.random().toString(36).slice(2, 10);
  const uniqNoise = `seed=${seed}`;

  // 1) Try live LLM generation via OmniRoute → Ollama failover.
  try {
    const prompt = `
You are an expert examiner for India's Ministry of Statistics & Programme Implementation (MoSPI).
Generate a ${QUIZ_QUESTIONS_COUNT}-question multiple choice quiz (MCQ) based on the following text content regarding "${skillName}".

${uniqNoise} — use this to vary question selection; do NOT repeat the same questions as any previous generation.

Target Document Title: "${docTitle}"
Document Content Snippet: "${docContentText.substring(0, 6000)}"

Return ONLY a raw JSON array of ${QUIZ_QUESTIONS_COUNT} objects, COMPACT (no pretty-printing, no newlines between fields), matching this strict format exactly:
[{"id":"q1","question":"Question text here?","options":["Option A","Option B","Option C","Option D"],"correctOptionIndex":0,"explanation":"1-2 sentence explanation.","subtopic":"Subtopic","mappedSkillId":"${targetSkillId}"}]
Keep explanations under 140 characters. No markdown wrapping, no trailing text after the closing bracket, no code fences. Pure JSON array only.`;

    const { text } = await aiChat([{ role: 'user', content: prompt }]);

        // Robust parse: strict first, then truncated-array repair.
        const questions = repairQuizJson(text);
        if (questions && questions.length >= 1) {
          const normalized = questions.slice(0, QUIZ_QUESTIONS_COUNT).map((q, i): MCQQuestion => {
            const opts: [string, string, string, string] =
              Array.isArray(q.options) && q.options.length === 4
                ? [String(q.options[0]), String(q.options[1]), String(q.options[2]), String(q.options[3])]
                : ['Option A', 'Option B', 'Option C', 'Option D'];
            return {
              id: q.id || `q_gen_${i}`,
              question: q.question || `Question ${i + 1}`,
              options: opts,
              correctOptionIndex: Number.isInteger(q.correctOptionIndex) && q.correctOptionIndex >= 0 && q.correctOptionIndex <= 3 ? q.correctOptionIndex : 0,
              explanation: q.explanation || 'No explanation provided.',
              subtopic: q.subtopic || 'General',
              mappedSkillId: q.mappedSkillId || targetSkillId
            };
          });
          return {
            id: `quiz_${Date.now()}`,
            documentTitle: docTitle,
            targetSkillId,
            createdAt: new Date().toISOString().split('T')[0],
            questions: normalized,
            totalQuestions: normalized.length,
            provider: 'llm'
          };
        }
      } catch (err) {
    console.warn('Live LLM quiz generation failed, falling back to offline AI engine:', (err as Error).message);
  }

  // 2) Offline engine: random fresh 20 from real NSSTA pool.
  const fallbackQuestions = getOfflineQuiz(targetSkillId);

  return {
    id: `quiz_${Date.now()}`,
    documentTitle: docTitle,
    targetSkillId,
    createdAt: new Date().toISOString().split('T')[0],
    questions: fallbackQuestions,
    totalQuestions: fallbackQuestions.length,
    provider: 'offline'
  };
}

export function evaluateQuizAttempt(
  quiz: Quiz,
  userId: string,
  userAnswers: Record<string, number>
): { attempt: QuizAttempt; newSkillLevel: SkillLevel; levelUpEarned: boolean } {
  let correctCount = 0;
  const topicStats: Record<string, { correct: number; total: number }> = {};

  quiz.questions.forEach(q => {
    const selected = userAnswers[q.id];
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correctCount++;

    if (!topicStats[q.subtopic]) {
      topicStats[q.subtopic] = { correct: 0, total: 0 };
    }
    topicStats[q.subtopic].total++;
    if (isCorrect) topicStats[q.subtopic].correct++;
  });

  const scorePercent = Math.round((correctCount / quiz.totalQuestions) * 100);
  const passed = scorePercent >= 70;

  const topicScores: Record<string, { correct: number; total: number; scorePercent: number }> = {};
  Object.entries(topicStats).forEach(([topic, stat]) => {
    topicScores[topic] = {
      correct: stat.correct,
      total: stat.total,
      scorePercent: Math.round((stat.correct / stat.total) * 100)
    };
  });

  const attempt: QuizAttempt = {
    id: `att_${Date.now()}`,
    quizId: quiz.id,
    userId,
    takenAt: new Date().toISOString(),
    answers: userAnswers,
    scorePercent,
    passed,
    topicScores
  };

  // Level progression: >=80% level up +1; >=60% maintain/bump to 1 if 0
  let newSkillLevel: SkillLevel = 1;
  let levelUpEarned = false;

  if (scorePercent >= 80) {
    newSkillLevel = 3;
    levelUpEarned = true;
  } else if (scorePercent >= 60) {
    newSkillLevel = 2;
  } else {
    newSkillLevel = 1;
  }

  return { attempt, newSkillLevel, levelUpEarned };
}