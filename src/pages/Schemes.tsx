// src/pages/Schemes.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  IndianRupee,
  FileText,
  Phone,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  GraduationCap,
  Briefcase,
  Wallet,
  Heart,
  Users,
  IdCard,
  Search,
  X
} from "lucide-react";


/* ----------------------------- Schemes array ----------------------------- */
const SchemesData = (t: any) => [
  {
    id: 101,
    title: "Sanjay Gandhi Niradhar Yojana",
    category: "State Government",
    amount: "₹1000 - ₹2500 per month",
    eligibility: "Disabled persons (≥40%) with low income (below poverty line)",
    status: "active",
    description: "Monthly financial assistance for destitute and disabled individuals in Maharashtra.",
    documents: ["Disability Certificate", "Income Certificate", "Aadhaar Card", "Bank Passbook"],
    applyLink: "https://aaplesarkar.mahaonline.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "Wallet"
  },
  {
    id: 102,
    title: "Divyang Shaadi Protsahan Yojana",
    category: "State Government",
    amount: "₹50,000 - ₹1,00,000 (one-time)",
    eligibility: "At least one partner must be a person with disability (≥40%)",
    status: "active",
    description: "Financial assistance to encourage marriage involving persons with disabilities.",
    documents: ["Marriage Certificate", "Disability Certificate", "Aadhaar Card"],
    applyLink: "https://aaplesarkar.mahaonline.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "Heart"
  },
  {
    id: 103,
    title: "Pre-Matric Scholarship for Disabled Students",
    category: "State Government",
    amount: "₹500 - ₹1000 per month",
    eligibility: "Disabled students studying in school (Class 1–10)",
    status: "active",
    description: "Scholarship support for school students with disabilities.",
    documents: ["Disability Certificate", "School Bonafide", "Income Certificate"],
    applyLink: "https://mahadbt.maharashtra.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "BookOpen"
  },
  {
    id: 104,
    title: "Post-Matric Scholarship for Disabled Students",
    category: "State Government",
    amount: "₹1000+ per month (varies)",
    eligibility: "Disabled students in college or higher education",
    status: "active",
    description: "Financial assistance for higher education of students with disabilities.",
    documents: ["Disability Certificate", "College ID", "Income Certificate"],
    applyLink: "https://mahadbt.maharashtra.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "GraduationCap"
  },
  {
    id: 105,
    title: "Self Employment Scheme for Disabled",
    category: "State Government",
    amount: "Loan with subsidy (varies)",
    eligibility: "Disabled persons (≥40%) willing to start a business",
    status: "active",
    description: "Provides financial support and subsidy for self-employment ventures.",
    documents: ["Disability Certificate", "Project Report", "Aadhaar Card"],
    applyLink: "https://www.myscheme.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "Briefcase"
  },
  {
    id: 106,
    title: "Aids and Appliances Scheme (ADIP + State)",
    category: "Central Government",
    amount: "Free / Subsidized equipment",
    eligibility: "Disabled persons (≥40%) with income criteria",
    status: "active",
    description: "Provides assistive devices like wheelchairs, hearing aids, prosthetics.",
    documents: ["Disability Certificate", "Income Certificate", "Aadhaar Card"],
    applyLink: "https://depwd.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "multiple"],
    icon: "Accessibility"
  },
  {
    id: 107,
    title: "Caregiver Allowance Scheme",
    category: "State Government",
    amount: "₹2000 per month",
    eligibility: "Families taking care of severely disabled persons",
    status: "active",
    description: "Financial support for caregivers of persons with severe disabilities.",
    documents: ["Disability Certificate", "Aadhaar Card", "Bank Details"],
    applyLink: "https://aaplesarkar.mahaonline.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "Users"
  },
  {
    id: 108,
    title: "Indira Gandhi National Disability Pension Scheme",
    category: "Central Government",
    amount: "₹300 - ₹600 per month",
    eligibility: "Persons with ≥80% disability aged 18–65 years",
    status: "active",
    description: "Central pension scheme for severely disabled individuals.",
    documents: ["Disability Certificate", "Aadhaar Card", "Income Certificate"],
    applyLink: "https://nsap.nic.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "Wallet"
  },
  {
    id: 109,
    title: "Free Coaching Scheme for PwD",
    category: "Central Government",
    amount: "Free coaching + stipend",
    eligibility: "Disabled students preparing for competitive exams",
    status: "active",
    description: "Provides coaching for UPSC, SSC, Banking, etc.",
    documents: ["Disability Certificate", "Education Proof", "Aadhaar Card"],
    applyLink: "https://depwd.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "Book"
  },
  {
    id: 110,
    title: "Mahatma Jyotiba Phule Jan Arogya Yojana",
    category: "State Government",
    amount: "₹1.5 - ₹2.5 lakh health coverage",
    eligibility: "Economically weaker sections including disabled persons",
    status: "active",
    description: "Health insurance scheme covering major treatments and surgeries.",
    documents: ["Aadhaar Card", "Ration Card", "Medical Documents"],
    applyLink: "https://www.jeevandayee.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "HeartPulse"
  },
  {
    id: 111,
    title: "UDID Card Scheme",
    category: "Central Government",
    amount: "Free ID card",
    eligibility: "All persons with disability (≥40%)",
    status: "active",
    description: "Unique Disability ID card required for availing most government schemes.",
    documents: ["Disability Certificate", "Aadhaar Card", "Photo"],
    applyLink: "https://www.swavlambancard.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: "IdCard"
  },
  {
    id: 1,
    title: t("scheme.pradhan_mantri_pension"),
    category: t("category.central_government"),
    amount: "₹2,000/month",
    eligibility: t("eligibility.40_disability_bpl"),
    status: t("status.active"),
    description: t("scheme.pradhan_mantri_pension.desc"),
    documents: [t("doc.disability_certificate"), t("doc.bpl_card"), t("doc.aadhaar_card"), t("doc.bank_details")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: Building2
  },
  {
    id: 2,
    title: t("scheme.deen_dayal_rehabilitation"),
    category: t("category.central_government"),
    amount: "Up to ₹10 lakh",
    eligibility: t("eligibility.ngos_working_pwd"),
    status: t("status.active"),
    description: t("scheme.deen_dayal_rehabilitation.desc"),
    documents: [t("doc.ngo_registration"), t("doc.project_proposal"), t("doc.audited_accounts")],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/scheme/deendayal-disabled-rehabilitation-scheme-to-promote-voluntary-action-for-persons-with-disabilities-ddrs-scheme/?utm_source=chatgpt.com",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: Heart
  },
  {
    id: 3,
    title: t("scheme.assistive_devices"),
    category: t("category.state_government"),
    amount: "Free devices worth ₹8,000",
    eligibility: t("eligibility.all_categories_disability"),
    status: t("status.active"),
    description: t("scheme.assistive_devices.desc"),
    documents: [t("doc.disability_certificate"), t("doc.income_certificate"), t("doc.medical_report")],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/scheme/7-scheme-of-assistance-to-disabled-persons-for-purchase-fitting-of-aids-appliances-adip-scheme/?utm_source=chatgpt.com",
    disabilityTypes: ["locomotor", "visual", "hearing", "multiple"],
    icon: Building2
  },
  {
    id: 4,
    title: t("scheme.disability_allowance"),
    category: t("category.state_government"),
    amount: "₹1,500/month",
    eligibility: t("eligibility.40_disability_income"),
    status: t("status.active"),
    description: t("scheme.disability_allowance.desc"),
    documents: [t("doc.disability_certificate"), t("doc.income_certificate"), t("doc.aadhaar_card")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: IndianRupee
  },
  {
    id: 5,
    title: t("scheme.scholarship_disabled"),
    category: t("category.central_government"),
    amount: "₹12,000/year",
    eligibility: t("eligibility.students_40_disability_merit"),
    status: t("status.active"),
    description: t("scheme.scholarship_disabled.desc"),
    documents: [t("doc.disability_certificate"), t("doc.academic_records"), t("doc.bank_details")],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/provider/state-government/?utm_source=chatgpt.com",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 6,
    title: t("scheme.health_insurance"),
    category: t("category.healthcare"),
    amount: "₹5 lakh coverage",
    eligibility: t("eligibility.all_pwd_certificate"),
    status: t("status.active"),
    description: t("scheme.health_insurance.desc"),
    documents: [t("doc.disability_certificate"), t("doc.aadhaar_card"), t("doc.family_income_proof")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: Heart
  },
  {
    id: 7,
    title: t("scheme.employment_guarantee"),
    category: t("category.central_government"),
    amount: "₹300/day",
    eligibility: t("eligibility.18_65_40_disability"),
    status: t("status.active"),
    description: t("scheme.employment_guarantee.desc"),
    documents: [t("doc.disability_certificate"), t("doc.age_proof"), t("doc.skills_certificate")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: Briefcase
  },
  {
    id: 8,
    title: t("scheme.skill_development"),
    category: t("category.financial_aid"),
    amount: "Free training + ₹5,000 stipend",
    eligibility: t("eligibility.18_45_basic_education"),
    status: t("status.active"),
    description: t("scheme.skill_development.desc"),
    documents: [t("doc.disability_certificate"), t("doc.educational_qualification"), t("doc.bank_details")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 9,
    title: t("scheme.housing_assistance"),
    category: t("category.state_government"),
    amount: "Up to ₹3 lakh",
    eligibility: t("eligibility.bpl_landless"),
    status: t("status.active"),
    description: t("scheme.housing_assistance.desc"),
    documents: [t("doc.disability_certificate"), t("doc.land_documents"), t("doc.bpl_certificate")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "multiple"],
    icon: Building2
  },
  {
    id: 10,
    title: t("scheme.transport_subsidy"),
    category: t("category.financial_aid"),
    amount: "50% fare discount",
    eligibility: t("eligibility.valid_disability_certificate"),
    status: t("status.active"),
    description: t("scheme.transport_subsidy.desc"),
    documents: [t("doc.disability_certificate"), t("doc.photo_id")],
    applyLink: "#",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: IndianRupee
  },
  {
    id: 12,
    title: "District Disability Rehabilitation Centres (DDRC)",
    category: t("category.state_government"),
    amount: "Rehabilitation services",
    eligibility: "PwDs needing therapy, counselling, skill development",
    status: t("status.active"),
    description: "District-level centres providing rehabilitation services, therapy, counselling, assistive devices, skill development, and support to PwDs.",
    documents: ["Disability certificate", "ID proof"],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/scheme/district-disability-rehabilitation-centre-ddrc/?utm_source=chatgpt.com",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: Building2
  },
  {
    id: 14,
    title: "SIPDA – Implementation of the Rights of Persons with Disabilities Act 2016",
    category: t("category.central_government"),
    amount: "Legal protection & accessibility initiatives",
    eligibility: "Persons with disabilities across all categories",
    status: t("status.active"),
    description: "Ensures implementation of the RPwD Act 2016, promoting accessibility, equal rights, and welfare of persons with disabilities.",
    documents: ["According to scheme guidelines"],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/schemes-programmes/?utm_source=chatgpt.com#sipda",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: CheckCircle
  },
  {
    id: 16,
    title: "Free Coaching & Educational Support for Disabled Students",
    category: t("category.state_government"),
    amount: "Free coaching / exam support",
    eligibility: "Students with disabilities",
    status: t("status.active"),
    description: "Free coaching, academic support, and exam concessions provided to disabled students across Maharashtra.",
    documents: ["Disability certificate", "School/college ID"],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/scheme/free-coaching-scholarship-for-students-with-disabilities/?utm_source=chatgpt.com",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 18,
    title: "State Awards & Matrimonial Incentives for Disabled Persons",
    category: t("category.state_government"),
    amount: "One-time incentives / awards",
    eligibility: "Eligible disabled persons as per rules",
    status: t("status.active"),
    description: "State awards for merit/achievement and incentives for marriage among eligible disabled persons.",
    documents: ["Disability certificate", "Eligibility documents"],
    applyLink: "https://divyangkalyan.maharashtra.gov.in/provider/state-government/?utm_source=chatgpt.com",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: Heart
  },
  {
    id: 20,
    title: "National Overseas Scholarship For Students With Disabilities",
    category: t("category.central_government"),
    amount: "Full scholarship – Tuition + Living + Travel",
    eligibility: "Students with disabilities pursuing Master's or PhD abroad",
    status: t("status.active"),
    description: "A full scholarship by the Ministry of Social Justice & Empowerment for Students with Disabilities (SwDs) to pursue Master's or PhD courses in listed foreign universities.",
    documents: ["Disability Certificate", "Admission Proof", "Educational Records", "Income Certificate"],
    applyLink: "https://socialjustice.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 21,
    title: "Post Matric Scholarship for Students With Disabilities",
    category: t("category.central_government"),
    amount: "Tuition + Books + Maintenance Allowance",
    eligibility: "Students with disabilities in Class 11–12, Diploma, UG, PG",
    status: t("status.active"),
    description: "A scholarship scheme for Students with Disabilities pursuing Class 11–12, Diploma, Undergraduate, Postgraduate and other recognized courses.",
    documents: ["Disability Certificate", "Admission Proof", "Bank Details", "Income Certificate"],
    applyLink: "https://scholarships.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 22,
    title: "Top Class Education For Students With Disabilities",
    category: t("category.central_government"),
    amount: "Books + Tuition + Living Allowance",
    eligibility: "Students pursuing full-time courses beyond Class 12th in notified institutions",
    status: t("status.active"),
    description: "A national scholarship for SwDs pursuing full-time higher education in government-notified top institutions in India.",
    documents: ["Disability Certificate", "Admission Proof", "Fee Receipts"],
    applyLink: "https://scholarships.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 23,
    title: "AICTE – Saksham Scholarship Scheme (Degree)",
    category: t("category.central_government"),
    amount: "₹50,000/year",
    eligibility: "PwD students enrolled in AICTE-approved degree-level technical programs",
    status: t("status.active"),
    description: "A scholarship by AICTE to support specially-abled students pursuing technical degree programs in India.",
    documents: ["Disability Certificate", "AICTE Approved Admission Proof"],
    applyLink: "https://www.aicte-india.org/schemes/students-development-schemes/scholarships",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 24,
    title: "Pre-Matric Scholarship For Students With Disabilities",
    category: t("category.central_government"),
    amount: "Book Grant + Maintenance Allowance",
    eligibility: "Students with disabilities in Class 9–10",
    status: t("status.active"),
    description: "A scholarship for Class 9–10 Students with Disabilities studying in government or government-recognized schools.",
    documents: ["Disability Certificate", "School ID", "Income Certificate"],
    applyLink: "https://scholarships.gov.in",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 25,
    title: "AICTE – Saksham Scholarship Scheme (Diploma)",
    category: t("category.central_government"),
    amount: "₹50,000/year",
    eligibility: "PwD students pursuing AICTE-approved diploma technical programs",
    status: t("status.active"),
    description: "Scholarship by AICTE for specially-abled students pursuing diploma-level technical courses.",
    documents: ["Disability Certificate", "Admission Proof"],
    applyLink: "https://www.aicte-india.org/schemes/students-development-schemes/scholarships",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 26,
    title: "Skill Loan Scheme",
    category: t("category.central_government"),
    amount: "Up to ₹1,50,000 loan",
    eligibility: "Students admitted in ITIs, Polytechnics, or recognized institutions",
    status: t("status.active"),
    description: "Loan scheme by Ministry of Skill Development to support students pursuing technical and skill-based courses.",
    documents: ["Admission Proof", "Identity Proof", "Bank Details"],
    applyLink: "https://www.vidyalakshmi.co.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 27,
    title: "ICAR Junior Research Fellowship (PG Studies)",
    category: t("category.central_government"),
    amount: "Monthly Fellowship + Contingency Grant",
    eligibility: "Students pursuing Master's degree in agricultural sciences",
    status: t("status.active"),
    description: "Fellowship awarded by ICAR to encourage higher education in agriculture and allied sciences.",
    documents: ["UG Degree Certificate", "Entrance Qualification Proof"],
    applyLink: "https://icar.org.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 28,
    title: "ICAR Senior Research Fellowship (PhD)",
    category: t("category.central_government"),
    amount: "Monthly Fellowship + Research Grant",
    eligibility: "Students pursuing PhD in agricultural sciences",
    status: t("status.active"),
    description: "Senior research fellowship for PhD students in agriculture and allied disciplines.",
    documents: ["PG Degree Certificate", "Research Proposal"],
    applyLink: "https://icar.org.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 29,
    title: "National Solar Science Fellowship Programme",
    category: t("category.central_government"),
    amount: "Research Fellowship",
    eligibility: "Scientists and engineers working in solar energy research",
    status: t("status.active"),
    description: "Fellowship program by Ministry of New and Renewable Energy to promote solar research.",
    documents: ["Research Proposal", "Qualification Certificates"],
    applyLink: "https://mnre.gov.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 30,
    title: "Post-Graduate Scholarships for SC/ST Candidates",
    category: t("category.central_government"),
    amount: "Scholarship for Professional PG Courses",
    eligibility: "SC/ST students pursuing postgraduate professional courses",
    status: t("status.active"),
    description: "Scholarship scheme to support SC/ST students in professional postgraduate studies.",
    documents: ["Caste Certificate", "Admission Proof", "Income Certificate"],
    applyLink: "https://scholarships.gov.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 31,
    title: "PM-USP Central Sector Scholarship Scheme",
    category: t("category.central_government"),
    amount: "Financial Assistance for Higher Education",
    eligibility: "Meritorious students from low-income families pursuing higher education",
    status: t("status.active"),
    description: "Scholarship to provide financial support to deserving students for college and university education.",
    documents: ["12th Marksheet", "Income Certificate", "Admission Proof"],
    applyLink: "https://scholarships.gov.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 32,
    title: "Free Education for Sports Medal Winners",
    category: t("category.central_government"),
    amount: "Full Tuition Fee Waiver",
    eligibility: "Sports medal winners/participants in national or international events",
    status: t("status.active"),
    description: "Financial assistance for sports medal winners studying in universities/colleges.",
    documents: ["Sports Certificate", "Admission Proof"],
    applyLink: "https://www.ugc.ac.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 33,
    title: "NITI Internship Scheme",
    category: t("category.central_government"),
    amount: "Internship Opportunity",
    eligibility: "UG/PG students and research scholars enrolled in recognized institutions",
    status: t("status.active"),
    description: "Internship scheme providing exposure to various divisions within NITI Aayog.",
    documents: ["College ID", "Bonafide Certificate", "Resume"],
    applyLink: "https://www.niti.gov.in/internship",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 34,
    title: "DPIIT Internship Scheme",
    category: t("category.central_government"),
    amount: "Internship Opportunity",
    eligibility: "UG/PG students and research scholars",
    status: t("status.active"),
    description: "Internship scheme by DPIIT for students and research scholars.",
    documents: ["College ID", "Resume"],
    applyLink: "https://dpiit.gov.in/internship",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  },
  {
    id: 35,
    title: "Post Graduate Merit Scholarship for Rank Holders",
    category: t("category.central_government"),
    amount: "Scholarship for 2 Years",
    eligibility: "University rank holders at UG level pursuing PG studies",
    status: t("status.active"),
    description: "Merit scholarship scheme for university rank holders at undergraduate level.",
    documents: ["UG Marksheet", "Rank Certificate"],
    applyLink: "https://scholarships.gov.in/",
    disabilityTypes: ["locomotor", "visual", "hearing", "intellectual", "multiple"],
    icon: GraduationCap
  }
];
/* ------------------------- End Schemes data -------------------------- */

/* --------------------- Quick tags & education levels --------------------- */
const AVAILABLE_TAGS = [
  "engineering",
  "financial",
  "medical",
  "scholarship",
  "vocational",
  "entrepreneurship",
  "disability-services",
  "welfare",
  "health"
];

const EDUCATION_LEVELS = [
  { key: "all", label: "All" },
  { key: "1-10", label: "Class 1 - 10" },
  { key: "11-12", label: "Class 11 - 12" },
  { key: "diploma-ug", label: "Diploma / UG" },
  { key: "pg-prof", label: "PG / Professional (MBBS, Engg)" }
];

// ── NEW: Disability type options ──────────────────────────────────────────────
const DISABILITY_TYPES = [
  { key: "all", label: "All Disabilities" },
  { key: "locomotor", label: "Locomotor" },
  { key: "visual", label: "Visual" },
  { key: "hearing", label: "Hearing" },
  { key: "intellectual", label: "Intellectual" },
  { key: "multiple", label: "Multiple" }
];

const SCHEME_TAGS: Record<number, { tags?: string[]; educationLevel?: string }> = {
  1: { tags: ["pension", "welfare", "financial"], educationLevel: "all" },
  2: { tags: ["rehabilitation", "ngo", "disability-services"], educationLevel: "all" },
  3: { tags: ["assistive", "devices", "medical"], educationLevel: "all" },
  4: { tags: ["allowance", "financial"], educationLevel: "all" },
  5: { tags: ["scholarship", "education", "school", "college"], educationLevel: "11-12" },
  6: { tags: ["health", "medical", "insurance", "mbbs"], educationLevel: "all" },
  7: { tags: ["employment", "skill", "vocational"], educationLevel: "diploma-ug" },
  8: { tags: ["skill", "training", "financial"], educationLevel: "diploma-ug" },
  9: { tags: ["housing", "welfare"], educationLevel: "all" },
  10: { tags: ["transport", "financial"], educationLevel: "all" },
  12: { tags: ["rehabilitation", "district", "services"], educationLevel: "all" },
  14: { tags: ["rights", "legal", "accessibility"], educationLevel: "all" },
  16: { tags: ["coaching", "education", "scholarship"], educationLevel: "11-12" },
  18: { tags: ["awards", "incentive"], educationLevel: "all" },
  20: { tags: ["overseas", "phd", "post-graduation", "higher-education", "scholarship"], educationLevel: "pg-prof" },
  21: { tags: ["post-matric", "scholarship", "diploma", "graduation"], educationLevel: "11-12" },
  22: { tags: ["scholarship", "top-class", "higher-education"], educationLevel: "diploma-ug" },
  23: { tags: ["aicte", "technical", "engineering", "scholarship"], educationLevel: "diploma-ug" },
  24: { tags: ["pre-matric", "school", "class-9", "class-10"], educationLevel: "1-10" },
  25: { tags: ["aicte", "technical", "diploma", "scholarship"], educationLevel: "diploma-ug" },
};

// ── Label colours for disability type badges ──────────────────────────────────
const DISABILITY_BADGE_STYLES: Record<string, string> = {
  locomotor:    "bg-blue-100 text-blue-800 border-blue-200",
  visual:       "bg-purple-100 text-purple-800 border-purple-200",
  hearing:      "bg-amber-100 text-amber-800 border-amber-200",
  intellectual: "bg-green-100 text-green-800 border-green-200",
  multiple:     "bg-rose-100 text-rose-800 border-rose-200",
};

const Schemes = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const schemes = SchemesData(t);

  // ── filter state ──────────────────────────────────────────────────────────
  const [selectedTag, setSelectedTag] = useState<string | null>(() => {
    try { return sessionStorage.getItem("schemes_selected_tag_v1") || null; } catch { return null; }
  });

  const [educationLevel, setEducationLevel] = useState<string>(() => {
    try { return sessionStorage.getItem("schemes_edu_level_v1") || "all"; } catch { return "all"; }
  });

  // ── NEW: disability type filter ───────────────────────────────────────────
  const [disabilityType, setDisabilityType] = useState<string>(() => {
    try { return sessionStorage.getItem("schemes_disability_type_v1") || "all"; } catch { return "all"; }
  });

  const [keyword, setKeyword] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    try {
      sessionStorage.setItem("schemes_selected_tag_v1", selectedTag || "");
      sessionStorage.setItem("schemes_edu_level_v1", educationLevel);
      sessionStorage.setItem("schemes_disability_type_v1", disabilityType);
    } catch {}
  }, [selectedTag, educationLevel, disabilityType]);

  const categories = [
    { key: "all", label: t("category.all") },
    { key: "central-government", label: t("category.central_government") },
    { key: "state-government", label: t("category.state_government") },
    { key: "financial-aid", label: t("category.financial_aid") },
    { key: "healthcare", label: t("category.healthcare") }
  ];

  const getFilteredByTab = (categoryKey: string, list = schemes) => {
    if (categoryKey === "all") return list;
    const cat = categories.find(c => c.key === categoryKey);
    if (!cat) return list;
    return list.filter(scheme =>
      String(scheme.category).trim().toLowerCase() === String(cat.label).trim().toLowerCase()
    );
  };

  const applyFilters = (items: typeof schemes) => {
    return items.filter((s) => {
      const meta = SCHEME_TAGS[s.id] || {};
      const edu = meta.educationLevel || "all";

      // education-level filter
      if (educationLevel !== "all") {
        if (edu !== "all" && edu !== educationLevel) return false;
      }

      // ── NEW: disability type filter ───────────────────────────────────
      if (disabilityType !== "all") {
        const schemeTypes: string[] = (s as any).disabilityTypes || [];
        if (!schemeTypes.includes(disabilityType)) return false;
      }

      // tag filter (single)
      if (selectedTag) {
        const schemeTags = new Set((meta.tags || []).map(tg => tg.toLowerCase()));
        const text = `${s.title} ${s.description}`.toLowerCase();
        const tagLower = selectedTag.toLowerCase();
        if (!schemeTags.has(tagLower) && !text.includes(tagLower)) return false;
      }

      // keyword search
      if (keyword && keyword.trim().length > 0) {
        const q = keyword.trim().toLowerCase();
        const hay = `${s.title} ${s.description} ${(SCHEME_TAGS[s.id]?.tags || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  };

  const filteredSchemes = useMemo(() => {
    const byTab = getFilteredByTab(activeTab, schemes);
    return applyFilters(byTab);
  }, [activeTab, selectedTag, educationLevel, disabilityType, keyword, schemes]);

  const toggleTag = (tag: string) => {
    setSelectedTag(prev => (prev === tag ? null : tag));
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setEducationLevel("all");
    setDisabilityType("all");
    setKeyword("");
    setActiveTab("all");
    try {
      sessionStorage.removeItem("schemes_selected_tag_v1");
      sessionStorage.removeItem("schemes_edu_level_v1");
      sessionStorage.removeItem("schemes_disability_type_v1");
    } catch {}
  };

  function handleEducationChange(v: string) {
    setEducationLevel(v);
    setSelectedTag(null);
    setKeyword("");
    setActiveTab("all");
  }

  const hasActiveFilters =
    selectedTag !== null ||
    educationLevel !== "all" ||
    disabilityType !== "all" ||
    keyword.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<Building2 className="w-12 h-12" style={{ color: "hsl(213 100% 40%)" }} />}
          iconColor="hsl(213 100% 40%)"
          iconBg="hsl(213 100% 95%)"
          title={t("schemes.title")}
          subtitle={t("schemes.subtitle")}
          badge="Government Schemes"
        />

        <section className="py-8 page-3d-bg">
          <div className="container mx-auto px-4">

            {/* Back Navigation */}
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("schemes.back")}
            </Button>

            {/* ── SEARCH BAR — top center, full width ── */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search schemes by name, benefit or keyword..."
                  className="w-full pl-10 pr-10 py-3 border-2 rounded-xl bg-white text-black placeholder-gray-400 text-base focus:outline-none focus:border-primary transition-colors"
                  aria-label="Search schemes"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="mb-6 space-y-3">

              {/* Row 1: Education level + Disability type */}
              <div className="flex gap-4 flex-wrap items-center">
                {/* Education level */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Education level:</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => handleEducationChange(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg bg-white text-black text-sm"
                    aria-label="Filter by education level"
                  >
                    {EDUCATION_LEVELS.map(l => (
                      <option key={l.key} value={l.key}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* ── NEW: Disability type dropdown ── */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Disability type:</label>
                  <select
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg bg-white text-black text-sm"
                    aria-label="Filter by disability type"
                  >
                    {DISABILITY_TYPES.map(d => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Clear button */}
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Row 2: Quick tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-sm font-medium mr-1">Quick tag:</label>
                {AVAILABLE_TAGS.map(tag => {
                  const active = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                      aria-pressed={active}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Active filter summary */}
              <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                <span>Active filters:</span>
                {!selectedTag && disabilityType === "all" && educationLevel === "all" && !keyword && (
                  <span>None</span>
                )}
                {selectedTag && (
                  <Badge className="gap-1">
                    Tag: {selectedTag}
                    <button onClick={() => setSelectedTag(null)} aria-label="Remove tag filter">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {disabilityType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Disability: {DISABILITY_TYPES.find(d => d.key === disabilityType)?.label}
                    <button onClick={() => setDisabilityType("all")} aria-label="Remove disability filter">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {educationLevel !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Education: {EDUCATION_LEVELS.find(l => l.key === educationLevel)?.label}
                    <button onClick={() => setEducationLevel("all")} aria-label="Remove education filter">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {keyword && (
                  <Badge variant="outline" className="gap-1">
                    Search: "{keyword}"
                    <button onClick={() => setKeyword("")} aria-label="Remove keyword filter">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <span className="ml-auto text-muted-foreground">
                  {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>

            {/* ── Category Tabs ── */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={(v) => setActiveTab(v)}>
              <TabsList className="grid w-full grid-cols-5 mb-4">
                {categories.map((category) => (
                  <TabsTrigger key={category.key} value={category.key}>
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.key} value={category.key} className="space-y-6">
                  <div className="grid gap-6">
                    {filteredSchemes.length === 0 && (
                      <div className="p-8 bg-card rounded-xl shadow text-center space-y-2">
                        <p className="text-lg font-medium">No matching schemes found</p>
                        <p className="text-muted-foreground text-sm">
                          Try changing the disability type, education level, or use different keywords.
                        </p>
                        <Button variant="outline" onClick={clearFilters} className="mt-2">
                          Clear all filters
                        </Button>
                      </div>
                    )}

                    {filteredSchemes.map((scheme) => {
                      const schemeDisabilityTypes: string[] = (scheme as any).disabilityTypes || [];
                      return (
                        <Card key={scheme.id} className="hover:shadow-lg transition-all duration-300">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <scheme.icon className="w-5 h-5 text-primary" />
                                  </div>
                                  <CardTitle className="text-xl">{scheme.title}</CardTitle>
                                </div>

                                {/* Category + status badges */}
                                <div className="flex gap-2 flex-wrap mb-2">
                                  <Badge variant="secondary">{scheme.category}</Badge>
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {scheme.status}
                                  </Badge>
                                  {(SCHEME_TAGS[scheme.id]?.tags || []).slice(0, 3).map((tg) => (
                                    <Badge key={tg} variant="secondary">{tg}</Badge>
                                  ))}
                                </div>

                                {/* ── NEW: Disability type badges ── */}
                                {schemeDisabilityTypes.length > 0 && (
                                  <div className="flex gap-1.5 flex-wrap">
                                    {schemeDisabilityTypes.map((dtype) => (
                                      <span
                                        key={dtype}
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                          DISABILITY_BADGE_STYLES[dtype] || "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                      >
                                        {dtype.charAt(0).toUpperCase() + dtype.slice(1)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary flex items-center gap-1">
                                  <IndianRupee className="w-5 h-5" />
                                  {scheme.amount ? scheme.amount.replace("₹", "") : ""}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <CardDescription className="text-base mb-4">
                              {scheme.description}
                            </CardDescription>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {t("schemes.eligibility") || "Eligibility"}
                                </h4>
                                <p className="text-muted-foreground">{scheme.eligibility}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">
                                  {t("schemes.documents") || "Required Documents"}
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {scheme.documents.map((doc, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-primary rounded-full" />
                                      {doc}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              {scheme.applyLink && scheme.applyLink.startsWith("http") ? (
                                <a href={scheme.applyLink} target="_blank" rel="noreferrer" className="flex-1">
                                  <Button className="w-full">
                                    {t("schemes.apply_now") || "Apply / Details"}
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </Button>
                                </a>
                              ) : (
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `https://divyangkalyan.maharashtra.gov.in/?s=${encodeURIComponent(String(scheme.title))}`,
                                      "_blank"
                                    )
                                  }
                                  className="flex-1"
                                >
                                  {t("schemes.apply_now") || "Apply / Details"}
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              )}

                              <Button variant="outline">
                                <Phone className="w-4 h-4 mr-2" />
                                {t("schemes.get_help") || "Get Help"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Quick Actions */}
            <Card className="bg-primary/5 border-primary/20 shimmer-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t("schemes.need_help") || "Need help?"}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    {t("schemes.call_helpline") || "Call Helpline"}
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("schemes.download_forms") || "Download Forms"}
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    {t("schemes.find_office") || "Find Office"}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Schemes;