import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Megaphone, 
  PlusCircle, 
  Search, 
  AlertTriangle, 
  IndianRupee, 
  Shield, 
  Users, 
  Bike, 
  ShoppingBag, 
  Clock, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Filter, 
  Languages, 
  Feather, 
  Mic, 
  Mail, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Map as MapIcon, 
  Navigation, 
  Camera, 
  Video, 
  Layers, 
  Maximize, 
  Minimize, 
  X, 
  Thermometer, 
  Zap, 
  Droplets, 
  Coffee, 
  ParkingCircle, 
  Siren, 
  Gavel, 
  WifiOff, 
  Building 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';

// --- Firebase Configuration & Initialization ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-wcroDBFFsUNgrT6uwQP1TT-1Jc5BtMU",
  authDomain: "gigworkertestimony.firebaseapp.com",
  projectId: "gigworkertestimony",
  storageBucket: "gigworkertestimony.firebasestorage.app",
  messagingSenderId: "1068276458074",
  appId: "1:1068276458074:web:5a39c26578f0ac2ed6ae63",
  measurementId: "G-DX6XVSBHRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const appId = 'safar-archive-v1'; // You can change this ID if needed

// --- Resource Categories Data Structure ---
const RESOURCE_CATEGORIES = {
  infrastructure: {
    id: 'infrastructure',
    color: '#0f172a', // slate-900 (High contrast)
    icon: <Zap className="w-5 h-5" />,
    label: { en: "Essential Infrastructure", bn: "অপরিহার্য পরিকাঠামো" },
    subcategories: [
      { id: 'charging', label: { en: "Mobile Charging", bn: "মোবাইল চার্জিং" } },
      { id: 'washroom', label: { en: "Washroom Facilities", bn: "শৌচাগার সুবিধা" } },
      { id: 'water', label: { en: "Drinking Water", bn: "পানীয় জল" } },
      { id: 'resting', label: { en: "Resting Spaces", bn: "বিশ্রামের স্থান" } },
      { id: 'parking', label: { en: "Parking", bn: "পার্কিং" } }
    ]
  },
  climate: {
    id: 'climate',
    color: '#ea580c', // orange-600
    icon: <Thermometer className="w-5 h-5" />,
    label: { en: "Climate & Risks", bn: "জলবায়ু এবং ঝুঁকি" },
    subcategories: [
      { id: 'flood', label: { en: "Flooding/Waterlogging", bn: "বন্যা/জলমগ্নতা" } },
      { id: 'heat', label: { en: "High Heat Zone", bn: "অত্যধিক তাপ এলাকা" } }
    ]
  },
  safety: {
    id: 'safety',
    color: '#e11d48', // rose-600
    icon: <Siren className="w-5 h-5" />,
    label: { en: "Safety & Risk", bn: "নিরাপত্তা এবং ঝুঁকি" },
    subcategories: [
      { id: 'road_safety', label: { en: "Road Safety", bn: "সড়ক নিরাপত্তা" } },
      { id: 'crime', label: { en: "Crime/Theft", bn: "অপরাধ/চুরি" } },
      { id: 'police', label: { en: "Police Harassment", bn: "পুলিশি হয়রানি" } }
    ]
  },
  platform: {
    id: 'platform',
    color: '#7c3aed', // violet-600
    icon: <WifiOff className="w-5 h-5" />,
    label: { en: "Platform Conditions", bn: "প্ল্যাটফর্মের অবস্থা" },
    subcategories: [
      { id: 'restaurant', label: { en: "Restaurant Behaviour", bn: "রেস্তোরাঁর আচরণ" } },
      { id: 'residential', label: { en: "Residential Access", bn: "আবাসিক প্রবেশাধিকার" } },
      { id: 'tech', label: { en: "Technical/Payment Issues", bn: "প্রযুক্তিগত/পেমেন্ট সমস্যা" } }
    ]
  },
  institutions: {
    id: 'institutions',
    color: '#475569', // slate-600
    icon: <Building className="w-5 h-5" />,
    label: { en: "Institutional Resources", bn: "প্রাতিষ্ঠানিক সম্পদ" },
    subcategories: [
      { id: 'police_station', label: { en: "Police Station", bn: "থানা" } },
      { id: 'hospital', label: { en: "Hospital", bn: "হাসপাতাল" } },
      { id: 'legal', label: { en: "Legal Aid", bn: "আইনি সহায়তা" } }
    ]
  },
  support: {
    id: 'support',
    color: '#059669', // emerald-600
    icon: <Users className="w-5 h-5" />,
    label: { en: "Worker Support", bn: "কর্মী সহায়তা" },
    subcategories: [
      { id: 'union', label: { en: "Union Meeting Point", bn: "ইউনিয়ন মিটিং পয়েন্ট" } },
      { id: 'repair', label: { en: "Worker-friendly Repair", bn: "কর্মী-বান্ধব মেরামত" } }
    ]
  }
};

// --- UI Translation Dictionary ---
const UI_TEXT = {
  en: {
    title: "SAFAR",
    subtitle: "Worker Testimony Archive",
    nav_kb: "Knowledge Base",
    nav_feed: "Community Feed",
    nav_stories: "Stories",
    nav_map: "Resources Map",
    kb_title: "Worker Issues Repository",
    kb_desc: "Mapping Worker Grievances in Grocery and Food Delivery Sectors on Digital Labour Platforms in Kolkata.",
    search_placeholder: "Search issues...",
    no_results: "No categories found matching your search.",
    grocery_label: "Grocery Delivery Workers",
    food_label: "Food Delivery Riders",
    grocery_short: "Grocery",
    food_short: "Food",
    coll_action_title: "Collective Action",
    coll_slogans_title: "Highlighted Slogans",
    coll_demands_title: "Key Demands",
    coll_demands_text: "Workers are uniting to demand clearer payment structures, safety nets, and recognition of their labour status.",
    cta_title: "Are you a digital labour platform worker?",
    cta_text: "Help us build this repository. If you face an issue not listed here, submit it to the community feed.",
    cta_btn: "Report Issue",
    stats_title: "Quick Stats",
    stats_doc: "Documented Issues",
    stats_reports: "Community Reports",
    stats_update: "Last Update",
    live: "Live",
    form_title: "Report a New Grievance",
    form_role: "Worker Role",
    form_cat: "Issue Category",
    form_desc: "Description of Issue",
    form_desc_ph: "Describe the problem, location, or specific incident...",
    form_submit: "Submit Report",
    form_submitting: "Submitting...",
    feed_title: "Live Community Feed",
    feed_loading: "Loading latest reports...",
    feed_empty: "No community reports yet.",
    feed_empty_sub: "Be the first to add one using the form.",
    stories_title: "Workers' Creative Repository",
    stories_subtitle: "Poems, Songs, and Stories from Gig Workers of Kolkata",
    footer_note: "This repository’s data inputs are derived from a workshop conducted by SAFAR in Kolkata in collaboration with the Worker Observatory, Edinburgh, and the STREET Lab, Toronto, in August 2024.",
    footer_contact_hint: "Suggestions and feedback:",
    status_prefix: "Status:",
    view_details: "View Details",
    cat_collective: "Collective Action / Protest",
    cat_other: "Other",
    admin_queue: "Moderation Queue (Admin Only)",
    admin_approve: "Approve",
    admin_reject: "Reject",
    pending_msg: "Report submitted! It is pending admin review.",
    email_cta: "Send to talktosafar@gmail.com",
    // Map specific translations
    map_filter_all: "All Categories",
    map_add_resource: "Add Resource",
    map_quick_report: "Quick Report (Urgent)",
    map_step_cat: "Select Category",
    map_step_sub: "Select Details",
    map_step_loc: "Confirm Location",
    map_step_info: "Additional Info",
    map_drag_pin: "Drag the pin to the exact location",
    map_use_gps: "Use Current Location",
    map_attributes: "Attributes",
    map_free: "Free",
    map_paid: "Paid",
    map_cost: "Cost (₹)",
    map_safe_women: "Women Friendly?",
    map_submit_success: "Location added successfully!",
    map_loading: "Loading Map...",
    map_offline: "Offline Mode: Draft saved locally",
    map_online: "Online",
    btn_back: "Back",
    btn_next: "Next",
    btn_cancel: "Cancel",
    btn_submit: "Submit"
  },
  bn: {
    title: "সফর",
    subtitle: "কর্মী সাক্ষ্য আর্কাইভ",
    nav_kb: "তথ্য ভান্ডার",
    nav_feed: "কমিউনিটি ফিড",
    nav_stories: "গল্প ও কবিতা",
    nav_map: "নগর সম্পদ",
    kb_title: "কর্মী অভিযোগের ভান্ডার",
    kb_desc: "কলকাতায় ডিজিটাল লেবার প্ল্যাটফর্মে মুদি এবং খাবার ডেলিভারি সেক্টরের কর্মীদের অভিযোগের ম্যাপিং।",
    search_placeholder: "সমস্যা খুঁজুন...",
    no_results: "আপনার অনুসন্ধানের সাথে মেলে এমন কোন বিভাগ পাওয়া যায়নি।",
    grocery_label: "মুদি ডেলিভারি কর্মী",
    food_label: "খাবার ডেলিভারি রাইডার",
    grocery_short: "মুদি",
    food_short: "খাবার",
    coll_action_title: "যৌথ আন্দোলন",
    coll_slogans_title: "কর্মশালা থেকে উঠে আসা স্লোগান",
    coll_demands_title: "মূল দাবি",
    coll_demands_text: "কর্মীরা স্পষ্ট পেমেন্ট কাঠামো, নিরাপত্তা জাল এবং তাদের শ্রমিকের মর্যাদার স্বীকৃতির দাবিতে একত্রিত হচ্ছে।",
    cta_title: "আপনি কি একজন ডিজিটাল লেবার প্ল্যাটফর্ম কর্মী?",
    cta_text: "আমাদের এই ভান্ডার গড়তে সাহায্য করুন। আপনি যদি এমন কোনো সমস্যার সম্মুখীন হন যা এখানে তালিকাভুক্ত নয়, তবে কমিউনিটি ফিডে জমা দিন।",
    cta_btn: "অভিযোগ জানান",
    stats_title: "এক নজরে পরিসংখ্যান",
    stats_doc: "নথিভুক্ত সমস্যা",
    stats_reports: "কমিউনিটি রিপোর্ট",
    stats_update: "সর্বশেষ আপডেট",
    live: "লাইভ",
    form_title: "নতুন অভিযোগ জানান",
    form_role: "কর্মীর ভূমিকা",
    form_cat: "সমস্যার বিভাগ",
    form_desc: "সমস্যার বিবরণ",
    form_desc_ph: "সমস্যা, স্থান বা নির্দিষ্ট ঘটনার বর্ণনা দিন...",
    form_submit: "রিপোর্ট জমা দিন",
    form_submitting: "জমা দেওয়া হচ্ছে...",
    feed_title: "লাইভ কমিউনিটি ফিড",
    feed_loading: "সর্বশেষ রিপোর্ট লোড হচ্ছে...",
    feed_empty: "এখনও কোন রিপোর্ট নেই।",
    feed_empty_sub: "ফর্ম ব্যবহার করে প্রথম রিপোর্টটি যোগ করুন।",
    stories_title: "কর্মীদের সৃজনশীল ভান্ডার",
    stories_subtitle: "কলকাতার গিগ কর্মীদের কবিতা, গান এবং গল্প",
    footer_note: "এই রিপোজিটরির ডেটা ইনপুটগুলি আগস্ট ২০২৪-এ ওয়ার্কার অবজারভেটরি, এডিনবার্গ এবং স্ট্রিট ল্যাব, টরন্টোর সহযোগিতায় সফর (SAFAR) দ্বারা কলকাতায় পরিচালিত একটি কর্মশালা থেকে নেওয়া হয়েছে।",
    footer_contact_hint: "পরামর্শ এবং মতামত:",
    status_prefix: "স্ট্যাটাস:",
    view_details: "বিস্তারিত দেখুন",
    cat_collective: "যৌথ আন্দোলন / প্রতিবাদ",
    cat_other: "অন্যান্য",
    admin_queue: "মডারেশন কিউ (শুধুমাত্র অ্যাডমিন)",
    admin_approve: "অনুমোদন করুন",
    admin_reject: "বাতিল করুন",
    pending_msg: "রিপোর্ট জমা হয়েছে! এটি অ্যাডমিন রিভিউর অপেক্ষায় আছে।",
    email_cta: "talktosafar@gmail.com এ পাঠান",
    map_filter_all: "সব বিভাগ",
    map_add_resource: "সম্পদ যোগ করুন",
    map_quick_report: "দ্রুত রিপোর্ট (জরুরি)",
    map_step_cat: "বিভাগ নির্বাচন করুন",
    map_step_sub: "বিস্তারিত নির্বাচন করুন",
    map_step_loc: "অবস্থান নিশ্চিত করুন",
    map_step_info: "অতিরিক্ত তথ্য",
    map_drag_pin: "পিনটি সঠিক অবস্থানে টেনে আনুন",
    map_use_gps: "বর্তমান অবস্থান ব্যবহার করুন",
    map_attributes: "বৈশিষ্ট্য",
    map_free: "বিনামূল্যে",
    map_paid: "মূল্য দিয়ে",
    map_cost: "খরচ (₹)",
    map_safe_women: "নারীদের জন্য নিরাপদ?",
    map_submit_success: "অবস্থান সফলভাবে যোগ করা হয়েছে!",
    map_loading: "ম্যাপ লোড হচ্ছে...",
    map_offline: "অফলাইন মোড: ড্রাফ্ট লোকাল সেভ করা হয়েছে",
    map_online: "অনলাইন",
    btn_back: "পিছনে",
    btn_next: "পরবর্তী",
    btn_cancel: "বাতিল",
    btn_submit: "জমা দিন"
  }
};

// --- Static Data (English) ---
const KNOWLEDGE_BASE_EN = [
  {
    id: 1,
    category: "Payment & Compensation",
    icon: <IndianRupee className="w-5 h-5" />,
    subCodes: [
      {
        title: "Inadequate Pay",
        grocery: ["Pay not adjusted for bulk orders (weight of groceries)", "Falling rates due to oversupply of workers"],
        food: ["Unfair minimum order earnings (e.g., ₹15 for 2–3 km)", "High platform commissions"]
      },
      {
        title: "Fuel/Weather Compensation",
        grocery: ["Rain surge not counted in wages", "No compensation for weather hazards"],
        food: ["Petrol-fuel costs not adjusted for inflation", "No return pay for out-of-zone orders"]
      },
      {
        title: "Minimum Wage Demands",
        grocery: ["Guaranteed ₹300 for 8 logged hours"],
        food: ["Demand for ₹100/hour base pay"]
      }
    ]
  },
  {
    id: 2,
    category: "Working Conditions & Safety",
    icon: <Shield className="w-5 h-5" />,
    subCodes: [
      {
        title: "Infrastructure Shortages",
        grocery: ["Lack of parking near dark stores", "No shelter during rain"],
        food: ["Lack of rest spaces", "No drinking water at restaurants"]
      },
      {
        title: "Hazardous Conditions",
        grocery: ["Weather hazards impacting work"],
        food: ["Safety risks (street dogs, unsafe roads)", "Police harassment and fines"]
      },
      {
        title: "Community Tensions",
        grocery: ["Dark store locations causing conflicts with residents"],
        food: ["Customer tensions over cash shortages"]
      }
    ]
  },
  {
    id: 3,
    category: "Platform Policies",
    icon: <Briefcase className="w-5 h-5" />,
    subCodes: [
      {
        title: "ID Blocking & Recruitment",
        grocery: ["Unrestricted onboarding reduces order rates", "ID blocking for inactivity"],
        food: ["Forced subscription models"]
      },
      {
        title: "Outsourcing",
        grocery: ["Not applicable"],
        food: ["Orders outsourced to third parties (e.g., Rapido, Shadowfax)"]
      },
      {
        title: "Punitive Systems",
        grocery: ["No worker input before penalties"],
        food: ["Penalties for restaurant delays", "Unilateral ID blocking"]
      }
    ]
  },
  {
    id: 4,
    category: "Grievance Redressal",
    icon: <Megaphone className="w-5 h-5" />,
    subCodes: [
      {
        title: "Ineffective Support",
        grocery: ["Team Leaders (TLs) unresponsive", "Store managers unhelpful"],
        food: ["In-app complaints delayed (48hr)", "TLs deflect responsibility"]
      },
      {
        title: "Demand for Redressal",
        grocery: ["Worker voice in platform decisions"],
        food: ["Demand for zone-wise help centers"]
      }
    ]
  },
  {
    id: 5,
    category: "Social Security",
    icon: <Users className="w-5 h-5" />,
    subCodes: [
      {
        title: "Insurance Demands",
        grocery: ["Death insurance clarity"],
        food: ["Health insurance, mediclaim, and life insurance"]
      },
      {
        title: "Long-Term Security",
        grocery: ["Not emphasized"],
        food: ["Provident Fund (PF) and ESI demands"]
      }
    ]
  },
  {
    id: 6,
    category: "Operational Challenges",
    icon: <Clock className="w-5 h-5" />,
    subCodes: [
      {
        title: "Delays",
        grocery: ["Dark stores take longer to process orders"],
        food: ["Restaurants delay orders, leading to penalties"]
      },
      {
        title: "Cash Handling",
        grocery: ["Not applicable"],
        food: ["E-payments cause cash shortages for customer change"]
      }
    ]
  }
];

// --- Static Data (Bengali) ---
const KNOWLEDGE_BASE_BN = [
  {
    id: 1,
    category: "Payment & Compensation", 
    displayCategory: "পেমেন্ট এবং ক্ষতিপূরণ",
    icon: <IndianRupee className="w-5 h-5" />,
    subCodes: [
      {
        title: "অপর্যাপ্ত বেতন",
        grocery: ["বাল্ক অর্ডারের জন্য বেতন সমন্বয় করা হয় না (মুদির ওজন)", "অতিরিক্ত কর্মী সরবরাহের কারণে রেট কমে যাচ্ছে"],
        food: ["অন্যায্য ন্যূনতম অর্ডার আয় (যেমন ২-৩ কিলোমিটারের জন্য মাত্র ১৫ টাকা)", "উচ্চ প্ল্যাটফর্ম কমিশন"]
      },
      {
        title: "জ্বালানি/আবহাওয়া ক্ষতিপূরণ",
        grocery: ["বৃষ্টির সময় বাড়তি টাকা বেতনে ধরা হয় না", "আবহাওয়া ঝুঁকির জন্য কোন ক্ষতিপূরণ নেই"],
        food: ["পেট্রোল খরচ মুদ্রাস্ফীতি অনুযায়ী সমন্বয় করা হয় না", "জোন-এর বাইরে অর্ডারের জন্য ফেরার টাকা নেই"]
      },
      {
        title: "ন্যূনতম মজুরির দাবি",
        grocery: ["৮ ঘণ্টা লগ-ইন থাকলে নিশ্চিত ৩০০ টাকা"],
        food: ["ঘণ্টায় ১০০ টাকা বেস পে-র দাবি"]
      }
    ]
  },
  {
    id: 2,
    category: "Working Conditions & Safety",
    displayCategory: "কাজের পরিবেশ এবং নিরাপত্তা",
    icon: <Shield className="w-5 h-5" />,
    subCodes: [
      {
        title: "পরিকাঠামোর অভাব",
        grocery: ["ডার্ক স্টোরের কাছে পার্কিংয়ের অভাব", "বৃষ্টির সময় আশ্রয় নেই"],
        food: ["বিশ্রামের জায়গার অভাব", "রেস্টুরেন্টে খাবার জলের ব্যবস্থা নেই"]
      },
      {
        title: "ঝুঁকিপূর্ণ অবস্থা",
        grocery: ["আবহাওয়ার বিপদ কাজের ওপর প্রভাব ফেলে"],
        food: ["নিরাপত্তা ঝুঁকি (রাস্তার কুকুর, রাতে অনিরাপদ রাস্তা)", "পুলিশের হয়রানি এবং জরিমানা"]
      },
      {
        title: "সামাজিক উত্তেজনা",
        grocery: ["ডার্ক স্টোরের অবস্থান নিয়ে বাসিন্দাদের সাথে সংঘাত"],
        food: ["খুচরো পয়সার অভাবে গ্রাহকদের সাথে উত্তেজনা"]
      }
    ]
  },
  {
    id: 3,
    category: "Platform Policies",
    displayCategory: "প্ল্যাটফর্মের নিয়মাবলী",
    icon: <Briefcase className="w-5 h-5" />,
    subCodes: [
      {
        title: "আইডি ব্লক এবং নিয়োগ",
        grocery: ["অবাধে নিয়োগের ফলে অর্ডারের হার কমেছে", "নিষ্ক্রিয়তার জন্য আইডি ব্লক করা"],
        food: ["জোরপূর্বক সাবস্ক্রিপশন মডেল"]
      },
      {
        title: "আউটসোর্সিং",
        grocery: ["প্রযোজ্য নয়"],
        food: ["অর্ডার তৃতীয় পক্ষের কাছে আউটসোর্স করা (যেমন র‍্যাপিডো, শ্যাডোফ্যাক্স)"]
      },
      {
        title: "শাস্তিমূলক ব্যবস্থা",
        grocery: ["শাস্তির আগে কর্মীর মতামত নেওয়া হয় না"],
        food: ["রেস্টুরেন্টের দেরির জন্য পেনাল্টি", "একতরফা আইডি ব্লক"]
      }
    ]
  },
  {
    id: 4,
    category: "Grievance Redressal",
    displayCategory: "অভিযোগ নিষ্পত্তি",
    icon: <Megaphone className="w-5 h-5" />,
    subCodes: [
      {
        title: "অকার্যকর সহায়তা",
        grocery: ["টিম লিডাররা (TL) সাড়া দেয় না", "স্টোর ম্যানেজাররা সাহায্য করে না"],
        food: ["ইন-অ্যাপ অভিযোগের উত্তর দেরিতে আসে (৪৮ ঘণ্টা)", "টিম লিডাররা দায়িত্ব এড়িয়ে যায়"]
      },
      {
        title: "সমাধানের দাবি",
        grocery: ["প্ল্যাটফর্মের সিদ্ধান্তে কর্মীদের মতামত"],
        food: ["জোন-ভিত্তিক সহায়তা কেন্দ্রের দাবি"]
      }
    ]
  },
  {
    id: 5,
    category: "Social Security",
    displayCategory: "সামাজিক সুরক্ষা",
    icon: <Users className="w-5 h-5" />,
    subCodes: [
      {
        title: "বিমার দাবি",
        grocery: ["মৃত্যু বিমার স্বচ্ছতা"],
        food: ["স্বাস্থ্য বিমা, মেডিক্লেইম এবং জীবন বিমা"]
      },
      {
        title: "দীর্ঘমেয়াদী নিরাপত্তা",
        grocery: ["জোর দেওয়া হয়নি"],
        food: ["প্রভিডেন্ট ফান্ড (PF) এবং ESI-এর দাবি"]
      }
    ]
  },
  {
    id: 6,
    category: "Operational Challenges",
    displayCategory: "পরিচালনাগত চ্যালেঞ্জ",
    icon: <Clock className="w-5 h-5" />,
    subCodes: [
      {
        title: "দেরি",
        grocery: ["ডার্ক স্টোর অর্ডার প্রসেস করতে বেশি সময় নেয়"],
        food: ["রেস্টুরেন্ট অর্ডার দিতে দেরি করে, যার ফলে পেনাল্টি হয়"]
      },
      {
        title: "নগদ টাকা লেনদেন",
        grocery: ["প্রযোজ্য নয়"],
        food: ["ই-পেমেন্টের কারণে গ্রাহককে ফেরত দেওয়ার খুচরো টাকার অভাব হয়"]
      }
    ]
  }
];

// --- Featured Stories Data ---
const STORIES_DATA = [
    {
        id: 1,
        type: 'chant',
        icon: <Mic className="w-5 h-5" />,
        title: {
            en: "We Shall Overcome: Workshop Chant",
            bn: "আমরা করব জয়: কর্মশালা স্লোগান"
        },
        author: {
            en: "Food Delivery Workers' Workshop Output",
            bn: "ফুড ডেলিভারি কর্মীদের কর্মশালা"
        },
        date: "August 14, 2024",
        content: {
            en: `We shall overcome, we shall overcome, we shall overcome one day
We want our freedom, we want from Swiggy. Please accept our demands.

Our demands are, our demands are, our demands are from Swiggy
Salary upgrade, medical service, customer help support.

Our demand are, our demand are, our demand are from Swiggy
We want insurance, we want mediclaim. Please listen to our voice.`,
            bn: `আমরা করব জয়, আমরা করব জয়, আমরা করব জয় একদিন
আমরা আমাদের স্বাধীনতা চাই, আমরা সুইগি থেকে চাই। দয়া করে আমাদের দাবি মেনে নিন।

আমাদের দাবি, আমাদের দাবি, আমাদের দাবি সুইগি থেকে
বেতন বৃদ্ধি, চিকিৎসা পরিষেবা, গ্রাহক সহায়তা।

আমাদের দাবি, আমাদের দাবি, আমাদের দাবি সুইগি থেকে
আমরা বিমা চাই, আমরা মেডিক্লেইম চাই। দয়া করে আমাদের কথা শুনুন।`
        }
    },
    {
        id: 2,
        type: 'poem',
        icon: <Feather className="w-5 h-5" />,
        title: {
            en: "Poem: I am a Delivery Boy",
            bn: "কবিতা: আমি এক ডেলিভারি বয়"
        },
        author: {
            en: "Prashanta Ghosh (President, Delivery Partners Unit, All India Gig Workers Union)",
            bn: "প্রশান্ত ঘোষ (সভাপতি, ডেলিভারি পার্টনার্স ইউনিট, অল ইন্ডিয়া গিগ ওয়ার্কার্স ইউনিয়ন)"
        },
        meta: {
            en: "55 year old | Recorded at Gig and Platform Workers Convention, Kolkata",
            bn: "৫৫ বছর বয়সী | গিগ এবং প্ল্যাটফর্ম ওয়ার্কার্স কনভেনশন, কলকাতায় রেকর্ড করা"
        },
        date: "February 26, 2022",
        content: {
            en: `I deliver expensive parcels to your home,
With a smile I ask, sir please provide me some stars,
I am a delivery boy, O mother I am a delivery boy.
All my degrees are buried in some files,
Covered in dust, as they are no more in use.
I don’t know when and where all my dreams are lost,
I am a delivery boy, O mother I am a delivery boy.

On the road you have the harassment of Police,
On the phone you have the company bullying you,
Your life is at risk and the scolding from the customer never stops.
I am a delivery boy, O mother I am a delivery boy.
No one think of us as human,
Our life is full of agony and pain.
Even after a ten twelve hours of work,
My pockets remain half empty.

I am a delivery boy, O mother I am a delivery boy.
Can we not get social security?
Minimum wage and the dignity of labour?
The leaders come and go, the ministers also change,
But nothing changes our situation.
Only the flood of false promises stays with us.

I am a delivery boy, O mother I am a delivery boy.
Swiggy Zomato Amazon or Flipkart,
They all put us together under one sky,
Its summer or winter, monsoon or spring,
We remain proletariat,
I am a delivery boy, O mother I am a delivery boy.`,
            bn: `আমি তোমার ঘরে দামী পার্সেল পৌঁছে দিই,
হাসিমুখে বলি, স্যার দয়া করে কিছু স্টার দিন,
আমি এক ডেলিভারি বয়, ও মা আমি এক ডেলিভারি বয়।
আমার সব ডিগ্রি ফাইলে চাপা পড়ে আছে,
ধুলোয় ঢাকা, কারণ ওগুলো আর কাজে লাগে না।
জানিনা কবে কোথায় হারিয়ে গেছে আমার সব স্বপ্ন,
আমি এক ডেলিভারি বয়, ও মা আমি এক ডেলিভারি বয়।

রাস্তায় পুলিশের হয়রানি,
ফোনে কোম্পানির ধমক,
জীবন ঝুঁকিপূর্ণ আর গ্রাহকের বকুনি থামে না।
আমি এক ডেলিভারি বয়, ও মা আমি এক ডেলিভারি বয়।
কেউ আমাদের মানুষ ভাবে না,
আমাদের জীবন যন্ত্রণায় ভরা।
দশ-বারো ঘণ্টা কাজের পরেও,
পকেট সেই আধা খালি।

আমি এক ডেলিভারি বয়, ও মা আমি এক ডেলিভারি বয়।
আমরা কি সামাজিক সুরক্ষা পাব না?
ন্যূনতম মজুরি আর শ্রমের মর্যাদা?
নেতারা আসে যায়, মন্ত্রীরাও বদলায়,
কিন্তু আমাদের অবস্থার কোনো পরিবর্তন হয় না।
শুধু মিথ্যে প্রতিশ্রুতির বন্যা আমাদের সাথে থাকে।

আমি এক ডেলিভারি বয়, ও মা আমি এক ডেলিভারি বয়।
সুইগি জোম্যাটো আমাজন বা ফ্লিপকার্ট,
সবাই আমাদের এক আকাশের নিচে এনেছে,
গ্রীষ্ম হোক বা শীত, বর্ষা বা বসন্ত,
আমরা প্রলেতারিয়েত (সর্বহারা) থেকে যাই,
আমি এক ডেলিভারি বয়, ও মা আমি এক ডেলিভারি বয়।`
        }
    }
];

// --- Components ---

const CategoryCard = ({ data, isOpen, onToggle, lang }) => {
  const t = UI_TEXT[lang];
  return (
    <div className="bg-white border border-stone-200 rounded-md shadow-sm mb-4 overflow-hidden transition-all duration-300">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 text-stone-900 rounded-md">
            {data.icon}
          </div>
          <h3 className="text-lg font-jacobin-serif font-bold text-stone-900">
            {lang === 'bn' ? data.displayCategory : data.category}
          </h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header for Columns */}
            <div className="hidden md:block pb-2 border-b border-stone-200 font-bold font-jacobin-sans text-stone-800 text-sm tracking-wide uppercase flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-600" /> {t.grocery_label}
            </div>
            <div className="hidden md:block pb-2 border-b border-stone-200 font-bold font-jacobin-sans text-stone-800 text-sm tracking-wide uppercase flex items-center gap-2">
              <Bike className="w-4 h-4 text-rose-600" /> {t.food_label}
            </div>

            {data.subCodes.map((sub, idx) => (
              <React.Fragment key={idx}>
                {/* Mobile Sub-header */}
                <div className="md:hidden col-span-1 mt-4 font-bold text-stone-900 border-b border-stone-200 pb-1">
                  {sub.title}
                </div>

                {/* Grocery Column */}
                <div className="bg-stone-50 p-3 rounded-md border border-stone-100">
                  <h4 className="md:hidden font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-rose-600" /> {t.grocery_short}:
                  </h4>
                  <div className="hidden md:block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{sub.title}</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {sub.grocery.map((item, i) => (
                      <li key={i} className="text-sm text-stone-700 leading-snug">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Food Column */}
                <div className="bg-stone-50 p-3 rounded-md border border-stone-100">
                  <h4 className="md:hidden font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-rose-600" /> {t.food_short}:
                  </h4>
                  <div className="hidden md:block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{sub.title}</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {sub.food.map((item, i) => (
                      <li key={i} className="text-sm text-stone-700 leading-snug">{item}</li>
                    ))}
                  </ul>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GrievanceForm = ({ user, onSubmitSuccess, lang }) => {
  const t = UI_TEXT[lang];
  const kbData = lang === 'en' ? KNOWLEDGE_BASE_EN : KNOWLEDGE_BASE_BN;
   
  const [role, setRole] = useState('Grocery');
  const [category, setCategory] = useState(KNOWLEDGE_BASE_EN[0].category); // Store English Key
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      if (user && db) { // Check if db exists
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'grievances'), {
            role,
            category, // Storing English category for consistency
            description,
            timestamp: serverTimestamp(),
            userId: user.uid,
            status: 'Pending' // Default to Pending
        });
        setSubmitted(true);
      } else if (!db) {
        alert("Firebase is not initialized. Please check your configuration.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setSubmitted(false);
    onSubmitSuccess();
  }

  // Construct mailto link for client-side email
  const subject = `SAFAR Report: ${category} (${role})`;
  const body = `Role: ${role}%0D%0ACategory: ${category}%0D%0A%0D%0ADescription:%0D%0A${encodeURIComponent(description)}`;
  const mailtoLink = `mailto:talktosafar@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

  if (submitted) {
      return (
          <div className="bg-emerald-50 p-6 rounded-md border border-emerald-100 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-900 mb-2">{t.pending_msg}</h3>
              <p className="text-sm text-emerald-700 mb-6">For faster processing, please email this report to the admin.</p>
              
              <div className="space-y-3">
                <a 
                    href={mailtoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    <Mail className="w-4 h-4" />
                    {t.email_cta}
                </a>
                <button 
                    onClick={handleReset}
                    className="text-sm text-stone-500 underline hover:text-stone-800"
                >
                    Submit another report
                </button>
              </div>
          </div>
      )
  }

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-stone-200">
      <h3 className="text-lg font-jacobin-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-rose-600" />
        {t.form_title}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1 font-jacobin-sans uppercase tracking-wide">{t.form_role}</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none bg-stone-50"
            >
              <option value="Grocery">{t.grocery_label}</option>
              <option value="Food">{t.food_label}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1 font-jacobin-sans uppercase tracking-wide">{t.form_cat}</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none bg-stone-50"
            >
              {kbData.map(kb => (
                <option key={kb.id} value={kb.category}>
                  {lang === 'bn' ? kb.displayCategory : kb.category}
                </option>
              ))}
              <option value="Collective Action">{t.cat_collective}</option>
              <option value="Other">{t.cat_other}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1 font-jacobin-sans uppercase tracking-wide">{t.form_desc}</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.form_desc_ph}
            className="w-full p-3 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:outline-none h-32 bg-stone-50"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !user}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? t.form_submitting : <><Send className="w-4 h-4" /> {t.form_submit}</>}
        </button>
        {!user && <p className="text-xs text-rose-500 text-center">Connecting to secure server...</p>}
      </form>
    </div>
  );
};

const FeedItem = ({ item, lang, isAdmin, onApprove, onReject }) => {
  const t = UI_TEXT[lang];
   
  const getDisplayCategory = (cat) => {
    if (lang === 'en') return cat;
    const found = KNOWLEDGE_BASE_BN.find(k => k.category === cat);
    if (found) return found.displayCategory;
    if (cat === "Collective Action") return "যৌথ আন্দোলন";
    if (cat === "Other") return "অন্যান্য";
    return cat; 
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-US', {
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
  };

  const displayRole = item.role === "Grocery" ? t.grocery_short : t.food_short;

  return (
    <div className={`bg-white p-5 rounded-md border ${item.status === 'Pending' ? 'border-amber-200 bg-amber-50/30' : 'border-stone-200'} shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white">
              {displayRole}
            </span>
            {item.status === 'Pending' && (
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                    Pending
                </span>
            )}
        </div>
        <div className="text-right">
            <span className="text-xs text-rose-600 font-bold uppercase tracking-wide block">
              {getDisplayCategory(item.category)}
            </span>
        </div>
      </div>
      
      <p className="text-stone-800 text-base font-jacobin-serif leading-relaxed mb-3">{item.description}</p>
      
      <div className="flex justify-between items-center border-t border-stone-100 pt-2 mt-2">
         <span className="text-xs text-stone-400 font-jacobin-sans">{formatTime(item.timestamp)}</span>
         
         {/* Admin Actions */}
         {isAdmin && item.status === 'Pending' && (
             <div className="flex gap-2">
                <button 
                  onClick={() => onReject(item.id)}
                  className="px-3 py-1 bg-stone-100 hover:bg-red-100 text-red-700 text-xs font-bold uppercase rounded-sm"
                >
                    Reject
                </button>
                <button 
                  onClick={() => onApprove(item.id)}
                  className="px-3 py-1 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase rounded-sm"
                >
                    Approve
                </button>
             </div>
         )}
      </div>
    </div>
  );
};

const StoryCard = ({ story, lang }) => (
    <div className="bg-white rounded-md shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-all group">
        <div className={`p-1 h-1 w-full ${story.type === 'poem' ? 'bg-stone-900' : 'bg-rose-600'}`}></div>
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-md ${story.type === 'poem' ? 'bg-stone-100 text-stone-900' : 'bg-rose-50 text-rose-600'}`}>
                        {story.icon}
                    </span>
                    <span className="text-xs font-jacobin-sans font-bold tracking-widest text-stone-400 uppercase">{story.date}</span>
                 </div>
            </div>
            
            <h3 className="text-4xl font-jacobin-head font-bold text-stone-900 mb-6 leading-none group-hover:text-rose-700 transition-colors">
                {lang === 'bn' ? story.title.bn : story.title.en}
            </h3>
            
            <div className="mb-8 pb-6 border-b border-stone-100">
                 <p className="text-sm font-bold uppercase tracking-widest text-rose-600 mb-1">
                    {lang === 'bn' ? story.author.bn : story.author.en}
                 </p>
                 {story.meta && (
                     <p className="text-xs font-jacobin-sans text-stone-400">
                        {lang === 'bn' ? story.meta.bn : story.meta.en}
                     </p>
                 )}
            </div>

            <div className="prose prose-stone prose-lg max-w-none">
                <p className="whitespace-pre-line font-jacobin-serif text-xl leading-relaxed text-stone-800">
                    {lang === 'bn' ? story.content.bn : story.content.en}
                </p>
            </div>
        </div>
    </div>
);

// --- City Resources Components ---

const ResourcesMap = ({ lang, user }) => {
  const t = UI_TEXT[lang];
  const [activeStep, setActiveStep] = useState(0); 
  const [formData, setFormData] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerLayer, setMarkerLayer] = useState(null);
  const [tempMarker, setTempMarker] = useState(null);
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const KOLKATA_COORDS = [22.5726, 88.3639];

  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (mapLoaded && !mapInstance && document.getElementById('map-container')) {
      const L = window.L;
      const map = L.map('map-container').setView(KOLKATA_COORDS, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);
      const markers = L.layerGroup().addTo(map);
      setMarkerLayer(markers);
      setMapInstance(map);
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [mapLoaded, activeStep]);

  useEffect(() => {
    if (db) { // Check if db exists
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'city_resources'),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResources(data);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!mapInstance || !markerLayer || !window.L) return;
    markerLayer.clearLayers();
    const L = window.L;

    resources.forEach(res => {
      if (filter !== 'all' && res.category !== filter) return;
      const catColor = RESOURCE_CATEGORIES[res.category]?.color || '#333';
      const marker = L.circleMarker([res.lat, res.lng], {
        radius: 6,
        fillColor: catColor,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      });
      const popupContent = `
        <div class="p-2 font-sans">
          <strong class="text-sm font-bold block mb-1 text-slate-900">${lang === 'bn' ? RESOURCE_CATEGORIES[res.category]?.label.bn : RESOURCE_CATEGORIES[res.category]?.label.en}</strong>
          <span class="text-xs text-slate-500 block mb-2 uppercase tracking-wide">${res.subcategory}</span>
          <p class="text-xs text-slate-700 mb-2">${res.description || ''}</p>
          <div class="text-xs font-bold text-rose-600">
             ${res.cost ? `₹${res.cost}` : (res.isFree ? t.map_free : t.map_paid)}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      markerLayer.addLayer(marker);
    });
  }, [resources, filter, mapInstance, markerLayer, lang]);

  const startReport = () => {
    setActiveStep(1);
    setFormData({});
  };

  const handleQuickReport = (type) => {
     setFormData({
       category: 'safety',
       subcategory: type,
       isUrgent: true,
       description: 'Urgent Report',
       lat: KOLKATA_COORDS[0],
       lng: KOLKATA_COORDS[1]
     });
     setActiveStep(4);
  };

  const submitReport = async () => {
    setLoading(true);
    try {
      if (user && db) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'city_resources'), {
          ...formData,
          timestamp: serverTimestamp(),
          userId: user.uid,
          status: 'Verified'
        });
        alert(t.map_submit_success);
        setActiveStep(0);
        setFormData({});
        if (tempMarker) {
            mapInstance.removeLayer(tempMarker);
            setTempMarker(null);
        }
      } else if (!db) {
        alert("Firebase is not initialized. Please check your configuration.");
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeStep === 4 && mapInstance && window.L) {
       const L = window.L;
       if (tempMarker) mapInstance.removeLayer(tempMarker);
       const center = mapInstance.getCenter();
       const marker = L.marker(center, { draggable: true }).addTo(mapInstance);
       marker.on('dragend', (e) => {
         const { lat, lng } = e.target.getLatLng();
         setFormData(prev => ({ ...prev, lat, lng }));
       });
       setTempMarker(marker);
       setFormData(prev => ({ ...prev, lat: center.lat, lng: center.lng }));
    }
  }, [activeStep]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row relative overflow-hidden rounded-md border border-stone-200 bg-stone-100">
      
      <div className={`absolute z-[1000] top-4 left-4 flex flex-col gap-2 ${activeStep !== 0 ? 'hidden' : ''}`}>
        <div className="bg-white p-1 rounded-md shadow-sm border border-stone-200">
           <select 
             className="bg-transparent text-sm font-bold text-stone-700 p-2 outline-none cursor-pointer"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           >
             <option value="all">{t.map_filter_all}</option>
             {Object.values(RESOURCE_CATEGORIES).map(cat => (
               <option key={cat.id} value={cat.id}>
                 {lang === 'bn' ? cat.label.bn : cat.label.en}
               </option>
             ))}
           </select>
        </div>
      </div>

      <div id="map-container" className="flex-1 h-full w-full bg-stone-200 relative z-0">
         {!mapLoaded && (
             <div className="absolute inset-0 flex items-center justify-center text-stone-500">
                 {t.map_loading}
             </div>
         )}
      </div>

      {activeStep === 0 && (
         <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3 items-end">
             <div className="flex gap-2">
                <button 
                  onClick={() => handleQuickReport('accident')}
                  className="bg-rose-600 text-white p-3 rounded-full shadow-lg hover:bg-rose-700 transition-transform hover:scale-105"
                  title="Report Accident"
                >
                 <AlertTriangle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleQuickReport('police')}
                  className="bg-stone-800 text-white p-3 rounded-full shadow-lg hover:bg-black transition-transform hover:scale-105"
                  title="Police Issue"
                >
                 <Shield className="w-5 h-5" />
                </button>
             </div>

             <button 
               onClick={startReport}
               className="flex items-center gap-2 bg-stone-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-black font-bold transition-transform hover:scale-105"
             >
                <PlusCircle className="w-5 h-5" />
                {t.map_add_resource}
             </button>
         </div>
      )}

      {activeStep > 0 && (
         <div className="absolute inset-0 z-[2000] bg-stone-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200">
               <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-stone-900 font-jacobin-head text-lg">
                     {activeStep === 1 && t.map_step_cat}
                     {activeStep === 2 && t.map_step_sub}
                     {activeStep === 3 && t.map_step_info}
                     {activeStep === 4 && t.map_step_loc}
                  </h3>
                  <button onClick={() => { setActiveStep(0); if(tempMarker) mapInstance.removeLayer(tempMarker); }} className="text-stone-400 hover:text-stone-600">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-4 overflow-y-auto flex-1">
                   {activeStep === 1 && (
                      <div className="grid grid-cols-2 gap-3">
                          {Object.values(RESOURCE_CATEGORIES).map(cat => (
                             <button 
                               key={cat.id}
                               onClick={() => { setFormData({...formData, category: cat.id}); setActiveStep(2); }}
                               className="flex flex-col items-center justify-center p-4 rounded-md border border-stone-200 hover:border-rose-500 hover:bg-rose-50 transition-all gap-2 text-center group"
                             >
                                  <div className="p-2 rounded-full bg-stone-100 text-stone-900 group-hover:bg-rose-200 group-hover:text-rose-900 transition-colors">
                                     {cat.icon}
                                  </div>
                                  <span className="text-sm font-bold text-stone-700 group-hover:text-rose-900">
                                     {lang === 'bn' ? cat.label.bn : cat.label.en}
                                  </span>
                             </button>
                          ))}
                      </div>
                   )}
                   {activeStep === 2 && (
                      <div className="space-y-2">
                          {RESOURCE_CATEGORIES[formData.category].subcategories.map(sub => (
                             <button
                               key={sub.id}
                               onClick={() => { setFormData({...formData, subcategory: sub.id}); setActiveStep(3); }}
                               className="w-full text-left p-3 rounded-md border border-stone-200 hover:bg-stone-50 font-medium text-stone-700"
                             >
                                {lang === 'bn' ? sub.label.bn : sub.label.en}
                             </button>
                          ))}
                      </div>
                   )}
                   {activeStep === 3 && (
                      <div className="space-y-4">
                          <div>
                             <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">{t.map_attributes}</label>
                             <div className="flex gap-4">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" onChange={e => setFormData({...formData, isFree: e.target.checked})} className="rounded text-rose-600" />
                                    <span className="text-sm text-stone-700">{t.map_free}</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" onChange={e => setFormData({...formData, isSafe: e.target.checked})} className="rounded text-rose-600" />
                                    <span className="text-sm text-stone-700">{t.map_safe_women}</span>
                                 </label>
                             </div>
                          </div>
                          {!formData.isFree && (
                              <div>
                                  <label className="block text-sm font-bold text-stone-700 mb-1 uppercase tracking-wide">{t.map_cost}</label>
                                  <input type="number" className="w-full border border-stone-300 rounded-md p-2" onChange={e => setFormData({...formData, cost: e.target.value})}/>
                              </div>
                          )}
                          <div>
                             <label className="block text-sm font-bold text-stone-700 mb-1 uppercase tracking-wide">{t.form_desc}</label>
                             <textarea className="w-full border border-stone-300 rounded-md p-2 h-20" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                          </div>
                      </div>
                   )}
                   {activeStep === 4 && (
                       <div className="text-center">
                           <MapPin className="w-12 h-12 text-rose-600 mx-auto mb-3 animate-bounce" />
                           <p className="font-medium text-stone-800 mb-1">{t.map_drag_pin}</p>
                           <div className="bg-stone-100 p-3 rounded-md border border-stone-200 text-left text-xs text-stone-600 mt-4">
                              <div className="flex justify-between mb-1 font-mono">
                                 <span>Lat: {formData.lat?.toFixed(4)}</span>
                                 <span>Lng: {formData.lng?.toFixed(4)}</span>
                              </div>
                           </div>
                       </div>
                   )}
               </div>
               <div className="p-4 border-t border-stone-100 flex justify-between bg-white">
                   {activeStep > 1 && (
                      <button onClick={() => setActiveStep(activeStep - 1)} className="px-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-bold uppercase tracking-wide">
                         {t.btn_back}
                      </button>
                   )}
                   {activeStep < 4 ? (
                       activeStep > 1 ? (
                         <button onClick={() => setActiveStep(activeStep + 1)} className="ml-auto px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-bold uppercase tracking-wide hover:bg-black">
                             {t.btn_next}
                         </button>
                       ) : null
                   ) : (
                       <button onClick={submitReport} disabled={loading} className="w-full px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-bold uppercase tracking-wide hover:bg-rose-700 flex justify-center items-center gap-2">
                           {loading ? 'Submitting...' : t.btn_submit}
                       </button>
                   )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [lang, setLang] = useState('en');
  const [isAdmin, setIsAdmin] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    // Standard Firebase Auth Check
    const initAuth = async () => {
        if (!auth) return;
        await signInAnonymously(auth);
    };
    initAuth();
    
    if (auth) {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'grievances'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const feed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGrievances(feed);
        setLoadingFeed(false);
      }, (error) => {
        console.error("Error fetching grievances:", error);
        setLoadingFeed(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleApprove = async (id) => {
      try {
        if (!db) return;
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'grievances', id);
        await updateDoc(docRef, { status: 'Approved' });
      } catch (e) { console.error("Approval failed", e); }
  };

  const handleReject = async (id) => {
      try {
        if (!db) return;
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'grievances', id);
        await deleteDoc(docRef);
      } catch (e) { console.error("Rejection failed", e); }
  };

  const t = UI_TEXT[lang];
  const activeKB = lang === 'en' ? KNOWLEDGE_BASE_EN : KNOWLEDGE_BASE_BN;
  const visibleGrievances = isAdmin ? grievances : grievances.filter(g => g.status === 'Approved');

  const filteredKB = activeKB.filter(item => {
    const catText = lang === 'bn' ? item.displayCategory : item.category;
    return (
      catText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCodes.some(sub => 
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.grocery.some(g => g.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sub.food.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-stone-900 selection:bg-rose-200 selection:text-rose-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@400;700;900&family=Playfair+Display:wght@400;700;900&display=swap');
        .font-jacobin-serif { font-family: 'Crimson Text', serif; }
        .font-jacobin-head { font-family: 'Playfair Display', serif; }
        .font-jacobin-sans { font-family: 'Lato', sans-serif; }
      `}</style>
      
      {/* Navbar - Jacobin Style: White, Minimal, Red CTA */}
      <nav className="bg-white sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-rose-600 flex items-center justify-center rounded-sm">
                 <Megaphone className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col">
                 <h1 className="text-xl font-jacobin-head font-black tracking-tight leading-none text-stone-900">{t.title}</h1>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t.subtitle}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6">
                {[
                  { id: 'knowledge', label: t.nav_kb },
                  { id: 'feed', label: t.nav_feed },
                  { id: 'stories', label: t.nav_stories },
                  { id: 'map', label: t.nav_map }
                ].map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === tab.id ? 'text-rose-600' : 'text-stone-500 hover:text-stone-900'}`}
                   >
                     {tab.label}
                   </button>
                ))}
            </div>

            <div className="flex items-center gap-3 border-l border-stone-200 pl-6">
                <button
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`p-1.5 rounded-sm transition-colors ${isAdmin ? 'bg-rose-600 text-white' : 'text-stone-400 hover:text-stone-900'}`}
                >
                    {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
                <button 
                    onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                    className="flex items-center gap-1 px-3 py-1 rounded-sm bg-stone-100 hover:bg-stone-200 text-xs font-bold uppercase tracking-wide transition-colors"
                >
                    <Languages className="w-3 h-3" />
                    {lang === 'en' ? 'বাংলা' : 'EN'}
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex mb-8 bg-white p-1 rounded-md border border-stone-200 overflow-x-auto shadow-sm">
          {[
              { id: 'knowledge', label: t.nav_kb },
              { id: 'feed', label: t.nav_feed },
              { id: 'stories', label: t.nav_stories },
              { id: 'map', label: t.nav_map }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] py-2 text-xs font-bold uppercase tracking-wide rounded-sm text-center ${activeTab === tab.id ? 'bg-stone-900 text-white' : 'text-stone-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'knowledge' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white p-8 rounded-md shadow-sm border border-stone-200">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-100">
                  <div className="max-w-md">
                    <h2 className="text-3xl font-jacobin-head font-bold text-stone-900 mb-2">{t.kb_title}</h2>
                    <p className="text-stone-600 font-jacobin-serif text-lg leading-relaxed">{t.kb_desc}</p>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder={t.search_placeholder}
                      className="pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:ring-1 focus:ring-stone-900 focus:outline-none w-full md:w-64 bg-stone-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredKB.map((item) => (
                    <CategoryCard 
                      key={item.id} 
                      data={item} 
                      lang={lang}
                      isOpen={openCategory === item.id}
                      onToggle={() => setOpenCategory(openCategory === item.id ? null : item.id)}
                    />
                  ))}
                  {filteredKB.length === 0 && (
                    <div className="text-center py-16 text-stone-400">
                      <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      {t.no_results}
                    </div>
                  )}
                </div>
              </div>

              {/* Collective Action - Editorial Box */}
              <div className="bg-white border-l-4 border-rose-600 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="p-2 bg-rose-50 rounded-sm text-rose-600">
                     <Users className="w-6 h-6" />
                  </span>
                  <h3 className="text-2xl font-jacobin-head font-bold text-stone-900">{t.coll_action_title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold font-jacobin-sans uppercase tracking-widest text-xs text-stone-400 mb-3">{t.coll_slogans_title}</h4>
                    <ul className="list-disc pl-4 space-y-2 text-stone-800 font-jacobin-serif text-lg">
                      <li>"We shall overcome"</li>
                      <li>"Salary upgrade, medical service"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold font-jacobin-sans uppercase tracking-widest text-xs text-stone-400 mb-3">{t.coll_demands_title}</h4>
                    <p className="text-stone-700 font-jacobin-serif text-lg italic leading-relaxed">
                      {t.coll_demands_text}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-8">
              <div className="bg-rose-600 p-8 rounded-md shadow-md text-white">
                <h3 className="font-jacobin-head font-bold text-2xl mb-3">{t.cta_title}</h3>
                <p className="text-rose-100 mb-6 leading-relaxed font-jacobin-serif text-lg">
                  {t.cta_text}
                </p>
                <button 
                  onClick={() => setActiveTab('feed')}
                  className="w-full bg-white text-rose-600 font-bold uppercase tracking-wide py-3 px-4 rounded-sm hover:bg-rose-50 transition-colors"
                >
                  {t.cta_btn}
                </button>
              </div>

              <div className="bg-white border border-stone-200 p-6 rounded-md shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2 uppercase tracking-wide text-xs">{t.stats_title}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">{t.stats_doc}</span>
                    <span className="font-bold text-stone-900 font-mono">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">{t.stats_reports}</span>
                    <span className="font-bold text-stone-900 font-mono">{grievances.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">{t.stats_update}</span>
                    <span className="font-bold text-emerald-600 text-xs uppercase tracking-wide flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t.live}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <GrievanceForm user={user} lang={lang} onSubmitSuccess={() => {}} />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
                    <h2 className="text-2xl font-jacobin-head font-bold text-stone-900 flex items-center gap-3">
                        {isAdmin ? 'Admin View' : t.feed_title}
                    </h2>
                    {isAdmin && (
                        <span className="bg-stone-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-sm">
                            {t.admin_queue}
                        </span>
                    )}
                </div>
            
              {loadingFeed ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto mb-4"></div>
                  <p className="text-stone-500">{t.feed_loading}</p>
                </div>
              ) : visibleGrievances.length > 0 ? (
                visibleGrievances.sort((a,b) => {
                    if (!isAdmin) return 0;
                    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                    return 0;
                }).map(item => (
                  <FeedItem 
                    key={item.id} 
                    item={item} 
                    lang={lang} 
                    isAdmin={isAdmin} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-md border border-dashed border-stone-300">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 text-stone-200" />
                  <p className="text-stone-500 font-bold">{t.feed_empty}</p>
                  <p className="text-sm text-stone-400 mt-2">{t.feed_empty_sub}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
            <div className="max-w-3xl mx-auto">
                <div className="mb-16 text-center border-b border-stone-200 pb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 text-stone-900 mb-6">
                        <Feather className="w-8 h-8" />
                    </div>
                    <h2 className="text-5xl font-jacobin-head font-black text-stone-900 mb-4 tracking-tight">{t.stories_title}</h2>
                    <p className="text-stone-500 font-jacobin-serif text-xl italic">{t.stories_subtitle}</p>
                </div>

                <div className="space-y-16">
                    {STORIES_DATA.map((story) => (
                        <StoryCard key={story.id} story={story} lang={lang} />
                    ))}
                </div>
            </div>
        )}
        
        {activeTab === 'map' && (
           <ResourcesMap lang={lang} user={user} />
        )}

        {/* Footer */}
        <footer className="mt-24 pt-12 pb-12 border-t border-stone-200 text-center">
            <div className="max-w-2xl mx-auto">
                <Megaphone className="w-8 h-8 mx-auto text-rose-600 mb-6" />
                <p className="text-stone-600 font-jacobin-serif text-lg leading-relaxed mb-6 italic">
                    {t.footer_note}
                </p>
                <div className="flex justify-center gap-2">
                    <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">{t.footer_contact_hint}</span>
                    <a 
                        href={`mailto:ashique.thuppilikkat@mail.utoronto.ca`} 
                        className="text-stone-900 hover:text-rose-600 font-bold text-xs uppercase tracking-widest transition-colors border-b border-stone-300 hover:border-rose-600 pb-0.5"
                    >
                        ashique.thuppilikkat@mail.utoronto.ca
                    </a>
                </div>
            </div>
        </footer>

      </main>
    </div>
  );
}
