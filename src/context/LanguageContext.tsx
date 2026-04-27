/**
 * LanguageContext — Full-page auto-translation using Google Translate (free)
 *
 * Fixes applied:
 * 1. translateTexts moved BEFORE applyTranslation so it is in scope
 * 2. Google Translate API called one text at a time (reliable) instead of
 *    multi-q batching (unreliable response structure)
 * 3. data-orig-text stored on the TEXT NODE via a WeakMap instead of the
 *    parent element — handles multiple text nodes inside one parent correctly
 */

import React, {
  createContext, useContext, useState,
  useEffect, useRef, useCallback, ReactNode,
} from "react";

type Language = "English" | "Hindi" | "Marathi";

const LANG_CODE: Record<Language, string> = {
  English: "en",
  Hindi:   "hi",
  Marathi: "mr",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ── Static translations (nav, headings that use t()) ─────────────────────────
const translations: Record<Language, Record<string, string>> = {
  English: {
    "portal.title":                "One-Stop Portal",
    "portal.subtitle":             "for Persons with Disabilities",
    "nav.home":                    "Home",
    "nav.schemes":                 "Schemes",
    "nav.scholarships":            "Scholarships",
    "nav.jobs":                    "Jobs",
    "nav.support":                 "Support",
    "nav.login":                   "Login",
    "FAQ":                         "FAQ",
    "accessibility.high_contrast": "High Contrast",
    "accessibility.normal":        "Normal",
    "accessibility.font_size":     "Font Size",
    "schemes.title":               "Schemes & Benefits",
    "schemes.subtitle":            "Government schemes, financial assistance, and disability benefits",
    "schemes.back":                "Back to Home",
    "schemes.apply_now":           "Apply Now",
    "schemes.get_help":            "Get Help",
    "schemes.eligibility":         "Eligibility",
    "schemes.documents":           "Required Documents",
    "schemes.need_help":           "Need Help Finding the Right Scheme?",
    "schemes.call_helpline":       "Call Helpline: 1800-123-4567",
    "schemes.download_forms":      "Download Application Forms",
    "schemes.find_office":         "Find Nearest Office",
    "schemes.clear":               "Clear",
    "schemes.no_matching":         "No matching schemes. Try clearing filters or use broader keywords.",
    "category.all":                "All",
    "category.central_government": "Central Government",
    "category.state_government":   "State Government",
    "category.financial_aid":      "Financial Aid",
    "category.healthcare":         "Healthcare",
    "education.school":            "School",
    "education.undergraduate":     "Undergraduate",
    "education.postgraduate":      "Postgraduate",
    "education.phd":               "PhD",
    "education.vocational":        "Vocational",
    "jobs.government":             "Government",
    "jobs.private":                "Private",
    "jobs.ngo":                    "NGO",
    "jobs.freelance":              "Freelance",
    "jobs.remote":                 "Remote",
    "status.active":               "Active",
    "status.inactive":             "Inactive",
    "status.pending":              "Pending",
    "search.placeholder":          "Search schemes, scholarships, or support...",
    "search.state":                "Select State",
    "search.age":                  "Select Age",
    "search.disability_type":      "Select Type",
    "search.resources":            "Search Resources",
    "search.advanced_filter":      "Advanced Filter",
    // scheme keys
    "scheme.pradhan_mantri_pension":           "Pradhan Mantri Disability Pension Scheme",
    "scheme.pradhan_mantri_pension.desc":      "Monthly pension for disabled persons below poverty line.",
    "scheme.deen_dayal_rehabilitation":        "Deen Dayal Disabled Rehabilitation Scheme",
    "scheme.deen_dayal_rehabilitation.desc":   "Grants to NGOs working for persons with disabilities.",
    "scheme.assistive_devices":                "Assistive Devices Scheme",
    "scheme.assistive_devices.desc":           "Free assistive devices for persons with disabilities.",
    "scheme.disability_allowance":             "Disability Allowance Scheme",
    "scheme.disability_allowance.desc":        "Monthly allowance for persons with disabilities.",
    "scheme.scholarship_disabled":             "Scholarship for Disabled Students",
    "scheme.scholarship_disabled.desc":        "Annual scholarship for meritorious disabled students.",
    "scheme.health_insurance":                 "Health Insurance for PwD",
    "scheme.health_insurance.desc":            "Health coverage for persons with disabilities.",
    "scheme.employment_guarantee":             "Employment Guarantee for PwD",
    "scheme.employment_guarantee.desc":        "Daily wage employment guarantee for disabled persons.",
    "scheme.skill_development":                "Skill Development for PwD",
    "scheme.skill_development.desc":           "Free skill training with stipend for disabled persons.",
    "scheme.housing_assistance":               "Housing Assistance for PwD",
    "scheme.housing_assistance.desc":          "Housing grant for disabled persons below poverty line.",
    "scheme.transport_subsidy":                "Transport Subsidy for PwD",
    "scheme.transport_subsidy.desc":           "Discounted bus and train travel for disabled persons.",
    // eligibility keys
    "eligibility.40_disability_bpl":           "Persons with ≥40% disability and BPL card",
    "eligibility.ngos_working_pwd":            "NGOs working for persons with disabilities",
    "eligibility.all_categories_disability":   "All categories of disability",
    "eligibility.40_disability_income":        "Persons with ≥40% disability with income criteria",
    "eligibility.students_40_disability_merit":"Disabled students with merit",
    "eligibility.all_pwd_certificate":         "All PwD with valid disability certificate",
    "eligibility.18_65_40_disability":         "Age 18–65 with ≥40% disability",
    "eligibility.18_45_basic_education":       "Age 18–45 with basic education",
    "eligibility.bpl_landless":                "BPL and landless disabled persons",
    "eligibility.valid_disability_certificate":"Valid disability certificate holders",
    // document keys
    "doc.disability_certificate":  "Disability Certificate",
    "doc.bpl_card":                "BPL Card",
    "doc.aadhaar_card":            "Aadhaar Card",
    "doc.bank_details":            "Bank Details",
    "doc.ngo_registration":        "NGO Registration",
    "doc.project_proposal":        "Project Proposal",
    "doc.audited_accounts":        "Audited Accounts",
    "doc.income_certificate":      "Income Certificate",
    "doc.medical_report":          "Medical Report",
    "doc.academic_records":        "Academic Records",
    "doc.family_income_proof":     "Family Income Proof",
    "doc.age_proof":               "Age Proof",
    "doc.skills_certificate":      "Skills Certificate",
    "doc.educational_qualification":"Educational Qualification",
    "doc.land_documents":          "Land Documents",
    "doc.bpl_certificate":         "BPL Certificate",
    "doc.photo_id":                "Photo ID",
  },

  Hindi: {
    "portal.title":                "वन-स्टॉप पोर्टल",
    "portal.subtitle":             "दिव्यांगजनों के लिए",
    "nav.home":                    "होम",
    "nav.schemes":                 "योजनाएं",
    "nav.scholarships":            "छात्रवृत्ति",
    "nav.jobs":                    "नौकरियां",
    "nav.support":                 "सहायता",
    "nav.login":                   "लॉगिन",
    "FAQ":                         "सामान्य प्रश्न",
    "accessibility.high_contrast": "उच्च कंट्रास्ट",
    "accessibility.normal":        "सामान्य",
    "accessibility.font_size":     "फॉन्ट आकार",
    "schemes.title":               "योजनाएं और लाभ",
    "schemes.subtitle":            "दिव्यांगजनों के लिए सरकारी योजनाएं",
    "schemes.back":                "होम पर वापस",
    "schemes.apply_now":           "अभी आवेदन करें",
    "schemes.get_help":            "सहायता प्राप्त करें",
    "schemes.eligibility":         "पात्रता",
    "schemes.documents":           "आवश्यक दस्तावेज",
    "schemes.need_help":           "सही योजना खोजने में सहायता चाहिए?",
    "schemes.call_helpline":       "हेल्पलाइन: 1800-123-4567",
    "schemes.download_forms":      "आवेदन पत्र डाउनलोड करें",
    "schemes.find_office":         "निकटतम कार्यालय खोजें",
    "schemes.clear":               "साफ करें",
    "schemes.no_matching":         "कोई मिलती-जुलती योजना नहीं मिली।",
    "category.all":                "सभी",
    "category.central_government": "केंद्र सरकार",
    "category.state_government":   "राज्य सरकार",
    "category.financial_aid":      "वित्तीय सहायता",
    "category.healthcare":         "स्वास्थ्य सेवा",
    "education.school":            "स्कूल",
    "education.undergraduate":     "स्नातक",
    "education.postgraduate":      "स्नातकोत्तर",
    "education.phd":               "पीएचडी",
    "education.vocational":        "व्यावसायिक",
    "jobs.government":             "सरकारी",
    "jobs.private":                "निजी",
    "jobs.ngo":                    "एनजीओ",
    "jobs.freelance":              "फ्रीलांस",
    "jobs.remote":                 "रिमोट",
    "status.active":               "सक्रिय",
    "status.inactive":             "निष्क्रिय",
    "status.pending":              "लंबित",
    "search.placeholder":          "योजनाएं, छात्रवृत्ति या सहायता खोजें...",
    "search.state":                "राज्य चुनें",
    "search.age":                  "आयु चुनें",
    "search.disability_type":      "प्रकार चुनें",
    "search.resources":            "संसाधन खोजें",
    "search.advanced_filter":      "उन्नत फ़िल्टर",
    "scheme.pradhan_mantri_pension":           "प्रधानमंत्री दिव्यांग पेंशन योजना",
    "scheme.pradhan_mantri_pension.desc":      "गरीबी रेखा से नीचे दिव्यांग व्यक्तियों के लिए मासिक पेंशन।",
    "scheme.deen_dayal_rehabilitation":        "दीन दयाल दिव्यांग पुनर्वास योजना",
    "scheme.deen_dayal_rehabilitation.desc":   "दिव्यांगजनों के लिए काम करने वाले NGO को अनुदान।",
    "scheme.assistive_devices":                "सहायक उपकरण योजना",
    "scheme.assistive_devices.desc":           "दिव्यांग व्यक्तियों के लिए निःशुल्क सहायक उपकरण।",
    "scheme.disability_allowance":             "दिव्यांग भत्ता योजना",
    "scheme.disability_allowance.desc":        "दिव्यांग व्यक्तियों के लिए मासिक भत्ता।",
    "scheme.scholarship_disabled":             "दिव्यांग छात्रों के लिए छात्रवृत्ति",
    "scheme.scholarship_disabled.desc":        "मेधावी दिव्यांग छात्रों के लिए वार्षिक छात्रवृत्ति।",
    "scheme.health_insurance":                 "दिव्यांगजनों के लिए स्वास्थ्य बीमा",
    "scheme.health_insurance.desc":            "दिव्यांग व्यक्तियों के लिए स्वास्थ्य कवरेज।",
    "scheme.employment_guarantee":             "दिव्यांगजनों के लिए रोजगार गारंटी",
    "scheme.employment_guarantee.desc":        "दिव्यांग व्यक्तियों के लिए दैनिक मजदूरी रोजगार।",
    "scheme.skill_development":                "दिव्यांगजनों के लिए कौशल विकास",
    "scheme.skill_development.desc":           "दिव्यांग व्यक्तियों के लिए निःशुल्क कौशल प्रशिक्षण।",
    "scheme.housing_assistance":               "दिव्यांगजनों के लिए आवास सहायता",
    "scheme.housing_assistance.desc":          "गरीबी रेखा से नीचे दिव्यांग व्यक्तियों के लिए आवास अनुदान।",
    "scheme.transport_subsidy":                "दिव्यांगजनों के लिए परिवहन सब्सिडी",
    "scheme.transport_subsidy.desc":           "दिव्यांग व्यक्तियों के लिए रियायती बस और ट्रेन यात्रा।",
    "eligibility.40_disability_bpl":           "≥40% दिव्यांगता और BPL कार्ड धारक",
    "eligibility.ngos_working_pwd":            "दिव्यांगजनों के लिए काम करने वाले NGO",
    "eligibility.all_categories_disability":   "सभी प्रकार की दिव्यांगता",
    "eligibility.40_disability_income":        "आय मानदंड के साथ ≥40% दिव्यांगता",
    "eligibility.students_40_disability_merit":"मेधावी दिव्यांग छात्र",
    "eligibility.all_pwd_certificate":         "वैध दिव्यांगता प्रमाण पत्र वाले सभी PwD",
    "eligibility.18_65_40_disability":         "आयु 18–65 और ≥40% दिव्यांगता",
    "eligibility.18_45_basic_education":       "आयु 18–45 और बुनियादी शिक्षा",
    "eligibility.bpl_landless":                "BPL और भूमिहीन दिव्यांग व्यक्ति",
    "eligibility.valid_disability_certificate":"वैध दिव्यांगता प्रमाण पत्र धारक",
    "doc.disability_certificate":  "दिव्यांगता प्रमाण पत्र",
    "doc.bpl_card":                "BPL कार्ड",
    "doc.aadhaar_card":            "आधार कार्ड",
    "doc.bank_details":            "बैंक विवरण",
    "doc.ngo_registration":        "NGO पंजीकरण",
    "doc.project_proposal":        "परियोजना प्रस्ताव",
    "doc.audited_accounts":        "लेखापरीक्षित खाते",
    "doc.income_certificate":      "आय प्रमाण पत्र",
    "doc.medical_report":          "चिकित्सा रिपोर्ट",
    "doc.academic_records":        "शैक्षणिक रिकॉर्ड",
    "doc.family_income_proof":     "परिवार की आय का प्रमाण",
    "doc.age_proof":               "आयु प्रमाण",
    "doc.skills_certificate":      "कौशल प्रमाण पत्र",
    "doc.educational_qualification":"शैक्षणिक योग्यता",
    "doc.land_documents":          "भूमि दस्तावेज",
    "doc.bpl_certificate":         "BPL प्रमाण पत्र",
    "doc.photo_id":                "फोटो पहचान पत्र",
  },

  Marathi: {
    "portal.title":                "वन-स्टॉप पोर्टल",
    "portal.subtitle":             "दिव्यांग व्यक्तींसाठी",
    "nav.home":                    "मुख्यपृष्ठ",
    "nav.schemes":                 "योजना",
    "nav.scholarships":            "शिष्यवृत्ती",
    "nav.jobs":                    "नोकर्या",
    "nav.support":                 "सहाय्य",
    "nav.login":                   "लॉगिन",
    "FAQ":                         "वारंवार विचारले जाणारे प्रश्न",
    "accessibility.high_contrast": "उच्च कॉन्ट्रास्ट",
    "accessibility.normal":        "सामान्य",
    "accessibility.font_size":     "फॉन्ट आकार",
    "schemes.title":               "योजना आणि फायदे",
    "schemes.subtitle":            "दिव्यांग व्यक्तींसाठी सरकारी योजना",
    "schemes.back":                "मुख्यपृष्ठावर परत",
    "schemes.apply_now":           "आता अर्ज करा",
    "schemes.get_help":            "मदत घ्या",
    "schemes.eligibility":         "पात्रता",
    "schemes.documents":           "आवश्यक कागदपत्रे",
    "schemes.need_help":           "योग्य योजना शोधण्यासाठी मदत हवी?",
    "schemes.call_helpline":       "हेल्पलाइन: 1800-123-4567",
    "schemes.download_forms":      "अर्ज फॉर्म डाउनलोड करा",
    "schemes.find_office":         "जवळचे कार्यालय शोधा",
    "schemes.clear":               "साफ करा",
    "schemes.no_matching":         "कोणतीही जुळणारी योजना नाही.",
    "category.all":                "सर्व",
    "category.central_government": "केंद्र सरकार",
    "category.state_government":   "राज्य सरकार",
    "category.financial_aid":      "आर्थिक सहाय्य",
    "category.healthcare":         "आरोग्य सेवा",
    "education.school":            "शाळा",
    "education.undergraduate":     "पदवी",
    "education.postgraduate":      "पदव्युत्तर",
    "education.phd":               "पीएचडी",
    "education.vocational":        "व्यावसायिक",
    "jobs.government":             "सरकारी",
    "jobs.private":                "खाजगी",
    "jobs.ngo":                    "एनजीओ",
    "jobs.freelance":              "फ्रीलान्स",
    "jobs.remote":                 "रिमोट",
    "status.active":               "सक्रिय",
    "status.inactive":             "निष्क्रिय",
    "status.pending":              "प्रलंबित",
    "search.placeholder":          "योजना, शिष्यवृत्ती किंवा सहाय्य शोधा...",
    "search.state":                "राज्य निवडा",
    "search.age":                  "वय निवडा",
    "search.disability_type":      "प्रकार निवडा",
    "search.resources":            "संसाधने शोधा",
    "search.advanced_filter":      "प्रगत फिल्टर",
    "scheme.pradhan_mantri_pension":           "प्रधानमंत्री दिव्यांग पेन्शन योजना",
    "scheme.pradhan_mantri_pension.desc":      "दारिद्र्यरेषेखालील दिव्यांग व्यक्तींसाठी मासिक पेन्शन.",
    "scheme.deen_dayal_rehabilitation":        "दीन दयाल दिव्यांग पुनर्वसन योजना",
    "scheme.deen_dayal_rehabilitation.desc":   "दिव्यांगांसाठी काम करणाऱ्या NGO ला अनुदान.",
    "scheme.assistive_devices":                "सहाय्यक साधने योजना",
    "scheme.assistive_devices.desc":           "दिव्यांग व्यक्तींसाठी मोफत सहाय्यक साधने.",
    "scheme.disability_allowance":             "दिव्यांग भत्ता योजना",
    "scheme.disability_allowance.desc":        "दिव्यांग व्यक्तींसाठी मासिक भत्ता.",
    "scheme.scholarship_disabled":             "दिव्यांग विद्यार्थ्यांसाठी शिष्यवृत्ती",
    "scheme.scholarship_disabled.desc":        "गुणवंत दिव्यांग विद्यार्थ्यांसाठी वार्षिक शिष्यवृत्ती.",
    "scheme.health_insurance":                 "दिव्यांगांसाठी आरोग्य विमा",
    "scheme.health_insurance.desc":            "दिव्यांग व्यक्तींसाठी आरोग्य संरक्षण.",
    "scheme.employment_guarantee":             "दिव्यांगांसाठी रोजगार हमी",
    "scheme.employment_guarantee.desc":        "दिव्यांग व्यक्तींसाठी दैनिक मजुरी रोजगार.",
    "scheme.skill_development":                "दिव्यांगांसाठी कौशल्य विकास",
    "scheme.skill_development.desc":           "दिव्यांग व्यक्तींसाठी मोफत कौशल्य प्रशिक्षण.",
    "scheme.housing_assistance":               "दिव्यांगांसाठी घरकुल सहाय्य",
    "scheme.housing_assistance.desc":          "दारिद्र्यरेषेखालील दिव्यांगांसाठी घरकुल अनुदान.",
    "scheme.transport_subsidy":                "दिव्यांगांसाठी वाहतूक सवलत",
    "scheme.transport_subsidy.desc":           "दिव्यांग व्यक्तींसाठी बस व रेल्वे सवलत.",
    "eligibility.40_disability_bpl":           "≥40% दिव्यांगता आणि BPL कार्ड",
    "eligibility.ngos_working_pwd":            "दिव्यांगांसाठी काम करणारे NGO",
    "eligibility.all_categories_disability":   "सर्व प्रकारच्या दिव्यांगता",
    "eligibility.40_disability_income":        "उत्पन्न निकषासह ≥40% दिव्यांगता",
    "eligibility.students_40_disability_merit":"गुणवंत दिव्यांग विद्यार्थी",
    "eligibility.all_pwd_certificate":         "वैध दिव्यांगता प्रमाणपत्र असलेले सर्व PwD",
    "eligibility.18_65_40_disability":         "वय 18–65 आणि ≥40% दिव्यांगता",
    "eligibility.18_45_basic_education":       "वय 18–45 आणि प्राथमिक शिक्षण",
    "eligibility.bpl_landless":                "BPL आणि भूमिहीन दिव्यांग व्यक्ती",
    "eligibility.valid_disability_certificate":"वैध दिव्यांगता प्रमाणपत्र धारक",
    "doc.disability_certificate":  "दिव्यांगता प्रमाणपत्र",
    "doc.bpl_card":                "BPL कार्ड",
    "doc.aadhaar_card":            "आधार कार्ड",
    "doc.bank_details":            "बँक तपशील",
    "doc.ngo_registration":        "NGO नोंदणी",
    "doc.project_proposal":        "प्रकल्प प्रस्ताव",
    "doc.audited_accounts":        "लेखापरीक्षित खाती",
    "doc.income_certificate":      "उत्पन्न प्रमाणपत्र",
    "doc.medical_report":          "वैद्यकीय अहवाल",
    "doc.academic_records":        "शैक्षणिक नोंदी",
    "doc.family_income_proof":     "कुटुंबाचा उत्पन्नाचा पुरावा",
    "doc.age_proof":               "वयाचा पुरावा",
    "doc.skills_certificate":      "कौशल्य प्रमाणपत्र",
    "doc.educational_qualification":"शैक्षणिक पात्रता",
    "doc.land_documents":          "जमीन कागदपत्रे",
    "doc.bpl_certificate":         "BPL प्रमाणपत्र",
    "doc.photo_id":                "फोटो ओळखपत्र",
  },
};

// ── WeakMap to store original text per node (FIX for Bug 3) ───────────────
// Using a WeakMap keyed on the Text node itself avoids the "same parent,
// multiple children" corruption that data-orig-text on the element caused.
const originalTextMap = new WeakMap<Text, string>();

// ── Translate a single string via Google free endpoint (FIX for Bug 2) ────
// Sending one text at a time is reliable. The multi-q approach returns a
// flat concatenated array that is nearly impossible to split correctly.
async function translateOne(text: string, targetLang: string): Promise<string> {
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "en");
    url.searchParams.set("tl", targetLang);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);

    const res = await fetch(url.toString());
    if (!res.ok) return text;
    const data = await res.json();
    // data[0] is an array of [translatedChunk, originalChunk, ...]
    // Join all chunks to rebuild the full translated string
    const translated = (data[0] as any[][])
      .map((chunk) => chunk[0] as string)
      .join("");
    return translated || text;
  } catch {
    return text;
  }
}

// ── Collect all visible text nodes from the page ───────────────────────────
function getTextNodes(root: Element): Text[] {
  const nodes: Text[] = [];
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "SVG",
    "CANVAS", "CODE", "PRE", "INPUT", "TEXTAREA",
  ]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.getAttribute("aria-hidden") === "true") return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim() ?? "";
      if (text.length < 2) return NodeFilter.FILTER_REJECT;
      // skip pure numbers / symbols / URLs
      if (/^[\d\s₹%+/\-.:,()]+$/.test(text)) return NodeFilter.FILTER_REJECT;
      if (/^https?:\/\//.test(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  return nodes;
}

// ── Provider ───────────────────────────────────────────────────────────────
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const prevLangRef = useRef<Language>("English");

  // Per-language translation cache: { "hi:some text" -> "translated text" }
  const cache = useRef<Map<string, string>>(new Map());

  const t = useCallback(
    (key: string): string => translations[language][key] ?? key,
    [language]
  );

  // ── Restore all nodes back to English ─────────────────────────────────
  const restoreEnglish = useCallback(() => {
    const root = document.getElementById("root") ?? document.body;
    const nodes = getTextNodes(root);
    nodes.forEach((node) => {
      const orig = originalTextMap.get(node);
      if (orig !== undefined) node.textContent = orig;
    });
  }, []);

  // ── FIX Bug 1: translateTexts defined BEFORE applyTranslation ─────────
  const translateTexts = useCallback(
    async (texts: string[], targetCode: string): Promise<string[]> => {
      const results: string[] = new Array(texts.length);
      const toFetch: { idx: number; text: string }[] = [];

      // Check cache first
      texts.forEach((text, i) => {
        const key = `${targetCode}:${text}`;
        if (cache.current.has(key)) {
          results[i] = cache.current.get(key)!;
        } else {
          toFetch.push({ idx: i, text });
        }
      });

      // Translate uncached texts one-by-one with a small pause between each
      // to avoid hitting Google's rate limit
      for (let i = 0; i < toFetch.length; i++) {
        const { idx, text } = toFetch[i];
        const translated = await translateOne(text, targetCode);
        results[idx] = translated;
        cache.current.set(`${targetCode}:${text}`, translated);
        // 40 ms gap — fast enough to feel instant, gentle enough to avoid 429s
        if (i < toFetch.length - 1) {
          await new Promise((r) => setTimeout(r, 40));
        }
      }

      return results;
    },
    []
  );

  // ── Core translation function (uses translateTexts above) ──────────────
  const applyTranslation = useCallback(
    async (lang: Language) => {
      if (lang === "English") {
        restoreEnglish();
        return;
      }

      setIsTranslating(true);

      // If switching between two non-English languages, restore first
      if (prevLangRef.current !== "English") {
        restoreEnglish();
        // Let React repaint after restore before collecting nodes again
        await new Promise((r) => setTimeout(r, 100));
      }

      const targetCode = LANG_CODE[lang];
      const root = document.getElementById("root") ?? document.body;
      const textNodes = getTextNodes(root);

      // Save original English text in WeakMap (FIX for Bug 3)
      textNodes.forEach((node) => {
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, node.textContent ?? "");
        }
      });

      // Translate in batches of 10 nodes at a time so the UI updates
      // progressively and the browser doesn't freeze
      const BATCH = 10;
      for (let i = 0; i < textNodes.length; i += BATCH) {
        const batch = textNodes.slice(i, i + BATCH);
        const texts = batch.map((n) => n.textContent?.trim() ?? "");
        try {
          const translated = await translateTexts(texts, targetCode);
          batch.forEach((node, j) => {
            if (translated[j] && translated[j] !== texts[j]) {
              node.textContent = translated[j];
            }
          });
        } catch {
          // skip failed batch — leave original text visible
        }
      }

      setIsTranslating(false);
    },
    [restoreEnglish, translateTexts]
  );

  // ── Public setLanguage ─────────────────────────────────────────────────
  const setLanguage = useCallback(
    (lang: Language) => {
      prevLangRef.current = language;
      setLanguageState(lang);
    },
    [language]
  );

  // ── Trigger translation whenever language changes ──────────────────────
  useEffect(() => {
    applyTranslation(language);
  }, [language, applyTranslation]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {/* Top progress bar while translating */}
      {isTranslating && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 999999,
            background:
              "linear-gradient(90deg, hsl(213 100% 38%), hsl(142 76% 38%), hsl(213 100% 38%))",
            backgroundSize: "200% 100%",
            animation: "gradient-rotate 1.2s linear infinite",
            height: 3,
          }}
        />
      )}
      {/* Bottom toast */}
      {isTranslating && (
        <div
          style={{
            position: "fixed", bottom: 20, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15,15,30,0.92)", color: "#fff",
            padding: "10px 20px", borderRadius: 24, zIndex: 999999,
            fontSize: 13, fontWeight: 500, backdropFilter: "blur(12px)",
            border: "1px solid rgba(99,102,241,0.4)",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <span
            style={{
              width: 14, height: 14, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              display: "inline-block",
              animation: "spin-y 0.6s linear infinite",
            }}
          />
          Translating page...
        </div>
      )}
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};