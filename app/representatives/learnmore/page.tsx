"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import {
  ArrowLeft,
  Landmark,
  Building2,
  UserSquare2,
  MapPinned,
  FileSearch,
  ExternalLink,
} from "lucide-react";

type Lang = "en" | "mr" | "hi";

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिंदी" },
];

const content: Record<
  Lang,
  {
    backLink: string;
    title: string;
    intro: string;
    recentContext: string;
    tiersHeading: string;
    tiers: { name: string; count: string; body: string }[];
    trackingHeading: string;
    trackingBody: string;
    reachHeading: string;
    reachSteps: { title: string; body: string }[];
    reachNote: string;
    rtiHeading: string;
    rtiIntro: string;
    rtiFileLabel: string;
    rtiFileBody: string;
    rtiFeeLabel: string;
    rtiFeeBody: string;
    rtiTimeLabel: string;
    rtiTimeBody: string;
    rtiTipLabel: string;
    rtiTipBody: string;
    linksHeading: string;
    links: { label: string; desc: string; href: string }[];
  }
> = {
  en: {
    backLink: "Back to Representatives",
    title: "Learn More",
    intro:
      "Mumbai is represented by four different elected offices at once, each with its own role, budget, and way of being reached. Here's how the structure fits together.",
    recentContext:
      "The BMC's last elected term ended in March 2022, after which the corporation was run by a state-appointed Administrator. The next municipal election was held on January 15, 2026, with results declared the following day — giving Mumbai an elected Mayor and a full set of 227 corporators again.",
    tiersHeading: "The four tiers",
    tiers: [
      {
        name: "Members of Parliament",
        count: "6 in Mumbai",
        body: "Mumbai elects 6 MPs to the Lok Sabha. Their main local lever is MPLADS — an annual discretionary fund an MP can direct toward infrastructure projects in their constituency. MPs also raise city issues in Parliament, though day-to-day municipal services aren't under their control.",
      },
      {
        name: "MLAs",
        count: "36 in Mumbai",
        body: "36 MLAs represent Mumbai's assembly constituencies in the Maharashtra Vidhan Sabha. They shape state-level policy and budget allocations — housing, transport, policing, land use — and hold a smaller local-area development fund of their own (MLALAD).",
      },
      {
        name: "The Mayor",
        count: "1",
        body: "The Mayor chairs the BMC's general body following each municipal election. The role is largely presiding and ceremonial — executive authority over civic administration sits with the Municipal Commissioner, an appointed IAS officer.",
      },
      {
        name: "Corporators",
        count: "227",
        body: "Each corporator represents one electoral ward and is the direct link to the BMC on garbage collection, roads, drainage, street lighting, and local health posts. This is the tier closest to daily civic life — and the least tracked.",
      },
    ],
    trackingHeading: "Tracking promises and spending",
    trackingBody:
      "Every tier of government publishes some record of what it has promised and spent — campaign manifestos, MPLADS and MLALAD utilization reports, BMC budget documents. The records exist; they're just spread across different portals not built with residents in mind. Bringing that data into one place is what lets a promise be checked against an outcome, and a fund allocation be checked against a completed project.",
    reachHeading: "How to reach them",
    reachSteps: [
      {
        title: "MPs",
        body: "Constituency office addresses and contact details are listed on Sansad.in. Many MPs also maintain WhatsApp or social media lines for constituent queries.",
      },
      {
        title: "MLAs",
        body: "Office addresses are available on the Maharashtra Vidhan Sabha website. Most MLAs hold a weekly janata darbar (public hearing) at their constituency office — often the fastest way to raise a local issue in person.",
      },
      {
        title: "Corporators",
        body: "Mumbai's 227 electoral wards sit within 24 administrative wards, each with its own BMC ward office. Ward office contacts are listed on the MCGM portal, and many corporators run local WhatsApp groups for their ward.",
      },
      {
        title: "The Mayor's office",
        body: "Formal correspondence goes through the Mayor's Secretariat at BMC headquarters. For ward-level issues, a corporator's office is typically the faster route.",
      },
    ],
    reachNote:
      "In general, the smaller the jurisdiction, the faster the response — a corporator can usually act on a ward-level issue more quickly than an MP's office, simply because it falls within their remit.",
    rtiHeading: "Filing an RTI",
    rtiIntro:
      "The Right to Information Act lets any citizen formally request information from a public authority — fund utilization, meeting minutes, project files — and the authority is required to respond within a set timeframe.",
    rtiFileLabel: "File:",
    rtiFileBody:
      "Online at rtionline.maharashtra.gov.in for state departments, or by post to the concerned PIO. Municipal RTIs often go directly to the BMC's own RTI cell rather than the state portal.",
    rtiFeeLabel: "Fee:",
    rtiFeeBody:
      "₹30 per application (waived for BPL applicants), plus ₹5 per page for copies.",
    rtiTimeLabel: "Response time:",
    rtiTimeBody:
      "30 days. If there's no reply, or an unclear one, a First Appeal can be filed within 30 days (₹50), followed by a Second Appeal to the Maharashtra State Information Commission within 90 days (₹100).",
    rtiTipLabel: "Tip:",
    rtiTipBody:
      "One clear subject per request, written plainly, tends to get a faster and more complete response than a broad or multi-part one.",
    linksHeading: "Useful links",
    links: [
      {
        label: "Sansad.in",
        desc: "Official Lok Sabha & Rajya Sabha portal",
        href: "https://sansad.in",
      },
      {
        label: "Maharashtra Vidhan Sabha",
        desc: "Official state assembly portal",
        href: "https://mls.org.in",
      },
      {
        label: "MCGM / BMC Portal",
        desc: "Ward offices & civic services",
        href: "https://portal.mcgm.gov.in",
      },
      {
        label: "RTI Online Maharashtra",
        desc: "File an RTI application or appeal",
        href: "https://rtionline.maharashtra.gov.in",
      },
      {
        label: "MPLADS Portal",
        desc: "MP fund utilization records",
        href: "https://mplads.mospi.gov.in",
      },
    ],
  },
  mr: {
    backLink: "लोकप्रतिनिधींकडे परत जा",
    title: "अधिक जाणून घ्या",
    intro:
      "मुंबईचे प्रतिनिधित्व एकाच वेळी चार वेगवेगळ्या निर्वाचित पदांद्वारे केले जाते, प्रत्येकाची भूमिका, निधी आणि संपर्क साधण्याची पद्धत वेगळी असते. ही रचना कशी एकत्र बसते ते इथे पाहा.",
    recentContext:
      "बीएमसीची मागील निवडलेली मुदत मार्च २०२२ मध्ये संपली, त्यानंतर महापालिका राज्य सरकारने नियुक्त केलेल्या प्रशासकाच्या देखरेखीखाली चालवली गेली. पुढील महापालिका निवडणूक १५ जानेवारी २०२६ रोजी झाली आणि निकाल दुसऱ्या दिवशी जाहीर झाले — त्यामुळे मुंबईला पुन्हा निवडलेले महापौर आणि २२७ नगरसेवकांचा संपूर्ण संच मिळाला.",
    tiersHeading: "चार स्तर",
    tiers: [
      {
        name: "खासदार",
        count: "मुंबईत ६",
        body: "मुंबई लोकसभेसाठी ६ खासदार निवडते. त्यांचे मुख्य स्थानिक साधन म्हणजे एमपीलॅड्स — मतदारसंघातील पायाभूत सुविधा प्रकल्पांसाठी खासदार वापरू शकतील असा वार्षिक विवेकाधीन निधी. खासदार संसदेत शहराचे प्रश्नही मांडतात, मात्र दैनंदिन महापालिका सेवांवर त्यांचे थेट नियंत्रण नसते.",
      },
      {
        name: "आमदार",
        count: "मुंबईत ३६",
        body: "३६ आमदार मुंबईतील विधानसभा मतदारसंघांचे महाराष्ट्र विधानसभेत प्रतिनिधित्व करतात. ते राज्यस्तरीय धोरणे आणि अर्थसंकल्पीय तरतुदी — गृहनिर्माण, वाहतूक, पोलीस, जमीन वापर — यांवर प्रभाव टाकतात, आणि त्यांच्याकडे स्वतःचा छोटा स्थानिक विकास निधी (आमदार निधी) असतो.",
      },
      {
        name: "महापौर",
        count: "१",
        body: "प्रत्येक महापालिका निवडणुकीनंतर महापौर बीएमसीच्या सर्वसाधारण सभेचे अध्यक्षपद भूषवतात. ही भूमिका मुख्यत्वे अध्यक्षीय आणि औपचारिक स्वरूपाची असते — नागरी प्रशासनावरील कार्यकारी अधिकार आयुक्त, एक नियुक्त आयएएस अधिकारी, यांच्याकडे असतात.",
      },
      {
        name: "नगरसेवक",
        count: "२२७",
        body: "प्रत्येक नगरसेवक एका प्रभागाचे प्रतिनिधित्व करतो आणि कचरा संकलन, रस्ते, गटारे, पथदिवे आणि स्थानिक आरोग्य केंद्रे यासंबंधी बीएमसीशी थेट दुवा असतो. दैनंदिन नागरी जीवनाशी सर्वात जवळचा हा स्तर आहे — आणि सर्वात कमी नोंदवला जाणारा.",
      },
    ],
    trackingHeading: "आश्वासने आणि खर्चाचा मागोवा",
    trackingBody:
      "सरकारचा प्रत्येक स्तर आश्वासने आणि खर्चाची काही ना काही नोंद प्रसिद्ध करतो — निवडणूक जाहीरनामे, एमपीलॅड्स आणि आमदार निधी वापर अहवाल, बीएमसी अर्थसंकल्प कागदपत्रे. या नोंदी अस्तित्वात आहेत; त्या फक्त नागरिकांसाठी न बनवलेल्या वेगवेगळ्या संकेतस्थळांवर विखुरलेल्या आहेत. ही माहिती एकाच ठिकाणी आणल्याने आश्वासन आणि प्रत्यक्ष निकाल, तसेच निधीवाटप आणि पूर्ण झालेला प्रकल्प यांची पडताळणी करता येते.",
    reachHeading: "त्यांच्याशी संपर्क कसा साधावा",
    reachSteps: [
      {
        title: "खासदार",
        body: "मतदारसंघ कार्यालयाचे पत्ते आणि संपर्क तपशील Sansad.in वर उपलब्ध आहेत. अनेक खासदार नागरिकांच्या प्रश्नांसाठी व्हॉट्सअॅप किंवा सोशल मीडिया लाईनही ठेवतात.",
      },
      {
        title: "आमदार",
        body: "कार्यालयाचे पत्ते महाराष्ट्र विधानसभेच्या संकेतस्थळावर उपलब्ध आहेत. बहुतांश आमदार त्यांच्या मतदारसंघ कार्यालयात दर आठवड्याला जनता दरबार घेतात — स्थानिक प्रश्न प्रत्यक्ष मांडण्याचा हा सर्वात जलद मार्ग असतो.",
      },
      {
        title: "नगरसेवक",
        body: "मुंबईतील २२७ प्रभाग २४ प्रशासकीय विभागांमध्ये विभागलेले आहेत, प्रत्येकाचे स्वतःचे बीएमसी विभाग कार्यालय आहे. विभाग कार्यालयांचे संपर्क एमसीजीएम संकेतस्थळावर सूचीबद्ध आहेत, आणि अनेक नगरसेवक त्यांच्या प्रभागासाठी स्थानिक व्हॉट्सअॅप गट चालवतात.",
      },
      {
        title: "महापौर कार्यालय",
        body: "औपचारिक पत्रव्यवहार बीएमसी मुख्यालयातील महापौर सचिवालयामार्फत होतो. प्रभागस्तरीय प्रश्नांसाठी नगरसेवकांचे कार्यालय सहसा जलद मार्ग ठरते.",
      },
    ],
    reachNote:
      "साधारणपणे, अधिकारक्षेत्र जितके लहान तितका प्रतिसाद जलद — नगरसेवक प्रभागस्तरीय प्रश्नावर खासदारांच्या कार्यालयापेक्षा अधिक लवकर कारवाई करू शकतो, कारण तो विषय त्यांच्या अखत्यारीत येतो.",
    rtiHeading: "माहिती अधिकार (आरटीआय) अर्ज कसा करावा",
    rtiIntro:
      "माहितीचा अधिकार कायदा कोणत्याही नागरिकाला सार्वजनिक प्राधिकरणाकडून औपचारिकपणे माहिती मागण्याचा अधिकार देतो — निधी वापर, सभेचे इतिवृत्त, प्रकल्प फाईल्स — आणि प्राधिकरणाने ठराविक कालमर्यादेत उत्तर देणे बंधनकारक असते.",
    rtiFileLabel: "अर्ज कसा करावा:",
    rtiFileBody:
      "राज्य विभागांसाठी rtionline.maharashtra.gov.in वर ऑनलाइन, किंवा संबंधित पीआयओकडे टपालाने. महापालिकेसंबंधी आरटीआय अर्ज बहुधा राज्य पोर्टलऐवजी थेट बीएमसीच्या आरटीआय कक्षाकडे पाठवावे लागतात.",
    rtiFeeLabel: "शुल्क:",
    rtiFeeBody:
      "प्रत्येक अर्जासाठी ₹३० (दारिद्र्यरेषेखालील अर्जदारांना माफ), तसेच प्रतींसाठी प्रति पान ₹५.",
    rtiTimeLabel: "उत्तर देण्याचा कालावधी:",
    rtiTimeBody:
      "३० दिवस. उत्तर न मिळाल्यास किंवा अस्पष्ट असल्यास, ३० दिवसांत प्रथम अपील (₹५०) दाखल करता येते, त्यानंतर ९० दिवसांत महाराष्ट्र राज्य माहिती आयोगाकडे द्वितीय अपील (₹१००) करता येते.",
    rtiTipLabel: "टीप:",
    rtiTipBody:
      "विस्तृत किंवा अनेक मुद्द्यांच्या अर्जापेक्षा, स्पष्ट भाषेत मांडलेला एकच मुद्दा असलेला अर्ज साधारणपणे जलद आणि सविस्तर उत्तर मिळवून देतो.",
    linksHeading: "उपयुक्त दुवे",
    links: [
      {
        label: "Sansad.in",
        desc: "अधिकृत लोकसभा आणि राज्यसभा संकेतस्थळ",
        href: "https://sansad.in",
      },
      {
        label: "Maharashtra Vidhan Sabha",
        desc: "अधिकृत राज्य विधानसभा संकेतस्थळ",
        href: "https://mls.org.in",
      },
      {
        label: "MCGM / BMC Portal",
        desc: "विभाग कार्यालये आणि नागरी सेवा",
        href: "https://portal.mcgm.gov.in",
      },
      {
        label: "RTI Online Maharashtra",
        desc: "आरटीआय अर्ज किंवा अपील दाखल करा",
        href: "https://rtionline.maharashtra.gov.in",
      },
      {
        label: "MPLADS Portal",
        desc: "खासदार निधी वापराच्या नोंदी",
        href: "https://mplads.mospi.gov.in",
      },
    ],
  },
  hi: {
    backLink: "प्रतिनिधियों पर वापस जाएं",
    title: "और जानें",
    intro:
      "मुंबई का प्रतिनिधित्व एक साथ चार अलग-अलग निर्वाचित पदों द्वारा किया जाता है, हर एक की भूमिका, बजट और संपर्क करने का तरीका अलग है। यह ढांचा कैसे साथ काम करता है, यह यहां बताया गया है।",
    recentContext:
      "बीएमसी का पिछला निर्वाचित कार्यकाल मार्च 2022 में समाप्त हुआ, जिसके बाद निगम राज्य सरकार द्वारा नियुक्त प्रशासक के अधीन चलाया गया। अगला नगरपालिका चुनाव 15 जनवरी 2026 को हुआ, और नतीजे अगले दिन घोषित किए गए — जिससे मुंबई को फिर से एक निर्वाचित महापौर और 227 नगरसेवकों का पूरा समूह मिला।",
    tiersHeading: "चार स्तर",
    tiers: [
      {
        name: "सांसद",
        count: "मुंबई में 6",
        body: "मुंबई लोकसभा के लिए 6 सांसद चुनती है। उनका मुख्य स्थानीय साधन एमपीलैड्स है — एक वार्षिक विवेकाधीन निधि जिसे सांसद अपने क्षेत्र में बुनियादी ढांचे की परियोजनाओं की ओर लगा सकते हैं। सांसद संसद में शहर के मुद्दे भी उठाते हैं, हालांकि रोज़मर्रा की नगरपालिका सेवाएं उनके नियंत्रण में नहीं होतीं।",
      },
      {
        name: "विधायक",
        count: "मुंबई में 36",
        body: "36 विधायक महाराष्ट्र विधानसभा में मुंबई के विधानसभा क्षेत्रों का प्रतिनिधित्व करते हैं। वे राज्य-स्तरीय नीतियों और बजट आवंटन को प्रभावित करते हैं — आवास, परिवहन, पुलिसिंग, भूमि उपयोग — और उनके पास अपना स्थानीय विकास निधि (विधायक निधि) भी होता है।",
      },
      {
        name: "महापौर",
        count: "1",
        body: "हर नगरपालिका चुनाव के बाद महापौर बीएमसी की सामान्य सभा की अध्यक्षता करते हैं। यह भूमिका मुख्यतः अध्यक्षीय और औपचारिक होती है — नागरिक प्रशासन पर वास्तविक कार्यकारी अधिकार नगर आयुक्त, एक नियुक्त आईएएस अधिकारी, के पास होता है।",
      },
      {
        name: "नगरसेवक",
        count: "227",
        body: "हर नगरसेवक एक वार्ड का प्रतिनिधित्व करता है और कचरा संग्रहण, सड़कों, नालियों, स्ट्रीट लाइट और स्थानीय स्वास्थ्य केंद्रों के मामले में बीएमसी से सीधा संपर्क सूत्र होता है। यह रोज़मर्रा के नागरिक जीवन के सबसे करीब का स्तर है — और सबसे कम ट्रैक किया जाने वाला भी।",
      },
    ],
    trackingHeading: "वादों और खर्च पर नज़र",
    trackingBody:
      "सरकार का हर स्तर वादों और खर्च का कुछ न कुछ रिकॉर्ड प्रकाशित करता है — चुनावी घोषणापत्र, एमपीलैड्स और विधायक निधि उपयोग रिपोर्ट, बीएमसी बजट दस्तावेज़। ये रिकॉर्ड मौजूद हैं; बस ये अलग-अलग पोर्टलों पर बिखरे हुए हैं जो निवासियों को ध्यान में रखकर नहीं बनाए गए। इस जानकारी को एक जगह लाने से किसी वादे को उसके नतीजे के मुकाबले, और किसी निधि आवंटन को पूरी हुई परियोजना के मुकाबले जांचा जा सकता है।",
    reachHeading: "उनसे संपर्क कैसे करें",
    reachSteps: [
      {
        title: "सांसद",
        body: "क्षेत्रीय कार्यालय के पते और संपर्क विवरण Sansad.in पर उपलब्ध हैं। कई सांसद नागरिकों की शिकायतों के लिए व्हाट्सएप या सोशल मीडिया लाइन भी रखते हैं।",
      },
      {
        title: "विधायक",
        body: "कार्यालय के पते महाराष्ट्र विधानसभा की वेबसाइट पर उपलब्ध हैं। ज़्यादातर विधायक अपने क्षेत्रीय कार्यालय में साप्ताहिक जनता दरबार आयोजित करते हैं — स्थानीय मुद्दा व्यक्तिगत रूप से उठाने का यह सबसे तेज़ तरीका है।",
      },
      {
        title: "नगरसेवक",
        body: "मुंबई के 227 वार्ड 24 प्रशासनिक वार्डों में बंटे हैं, हर एक का अपना बीएमसी वार्ड कार्यालय है। वार्ड कार्यालयों के संपर्क एमसीजीएम पोर्टल पर सूचीबद्ध हैं, और कई नगरसेवक अपने वार्ड के लिए स्थानीय व्हाट्सएप ग्रुप चलाते हैं।",
      },
      {
        title: "महापौर कार्यालय",
        body: "औपचारिक पत्राचार बीएमसी मुख्यालय स्थित महापौर सचिवालय के माध्यम से होता है। वार्ड-स्तरीय मुद्दों के लिए नगरसेवक का कार्यालय आमतौर पर तेज़ रास्ता होता है।",
      },
    ],
    reachNote:
      "सामान्यतः, अधिकार क्षेत्र जितना छोटा होगा, प्रतिक्रिया उतनी ही तेज़ होगी — एक नगरसेवक वार्ड-स्तरीय मुद्दे पर सांसद के कार्यालय से कहीं जल्दी कार्रवाई कर सकता है, क्योंकि वह विषय उनके दायरे में आता है।",
    rtiHeading: "आरटीआई दाखिल करना",
    rtiIntro:
      "सूचना का अधिकार अधिनियम किसी भी नागरिक को किसी सार्वजनिक प्राधिकरण से औपचारिक रूप से जानकारी मांगने का अधिकार देता है — निधि उपयोग, बैठक कार्यवृत्त, परियोजना फ़ाइलें — और प्राधिकरण को एक तय समय-सीमा में जवाब देना अनिवार्य होता है।",
    rtiFileLabel: "आवेदन कैसे करें:",
    rtiFileBody:
      "राज्य विभागों के लिए rtionline.maharashtra.gov.in पर ऑनलाइन, या संबंधित पीआईओ को डाक से। नगरपालिका से जुड़े आरटीआई अक्सर राज्य पोर्टल के बजाय सीधे बीएमसी के आरटीआई सेल को भेजने होते हैं।",
    rtiFeeLabel: "शुल्क:",
    rtiFeeBody:
      "प्रति आवेदन ₹30 (बीपीएल आवेदकों के लिए माफ), साथ ही प्रतियों के लिए ₹5 प्रति पृष्ठ।",
    rtiTimeLabel: "जवाब देने का समय:",
    rtiTimeBody:
      "30 दिन। जवाब न मिलने या अस्पष्ट होने पर, 30 दिनों के भीतर प्रथम अपील (₹50) दायर की जा सकती है, इसके बाद 90 दिनों के भीतर महाराष्ट्र राज्य सूचना आयोग में द्वितीय अपील (₹100)।",
    rtiTipLabel: "सुझाव:",
    rtiTipBody:
      "एक व्यापक या बहु-विषयक आवेदन की तुलना में, स्पष्ट भाषा में लिखा गया एक ही विषय वाला आवेदन आमतौर पर तेज़ और अधिक पूर्ण जवाब दिलाता है।",
    linksHeading: "उपयोगी लिंक",
    links: [
      {
        label: "Sansad.in",
        desc: "आधिकारिक लोकसभा और राज्यसभा पोर्टल",
        href: "https://sansad.in",
      },
      {
        label: "Maharashtra Vidhan Sabha",
        desc: "आधिकारिक राज्य विधानसभा पोर्टल",
        href: "https://mls.org.in",
      },
      {
        label: "MCGM / BMC Portal",
        desc: "वार्ड कार्यालय और नागरिक सेवाएं",
        href: "https://portal.mcgm.gov.in",
      },
      {
        label: "RTI Online Maharashtra",
        desc: "आरटीआई आवेदन या अपील दाखिल करें",
        href: "https://rtionline.maharashtra.gov.in",
      },
      {
        label: "MPLADS Portal",
        desc: "सांसद निधि उपयोग रिकॉर्ड",
        href: "https://mplads.mospi.gov.in",
      },
    ],
  },
};

const tierIcons = [Landmark, UserSquare2, Building2, MapPinned];

type Tab = "structure" | "contact" | "rti" | "links";

const TAB_LABELS: Record<Lang, Record<Tab, string>> = {
  en: { structure: "Structure", contact: "Contact", rti: "RTI", links: "Links" },
  mr: { structure: "रचना", contact: "संपर्क", rti: "आरटीआय", links: "दुवे" },
  hi: { structure: "संरचना", contact: "संपर्क", rti: "आरटीआई", links: "लिंक" },
};

function LearnMoreContent() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState<Tab>("structure");
  const t = content[lang];
  const tabLabels = TAB_LABELS[lang];
  const tabs: Tab[] = ["structure", "contact", "rti", "links"];

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-12">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/representatives"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#800020] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backLink}
        </Link>

        <div className="inline-flex items-center gap-2 text-sm">
          {LANGUAGES.map(({ code, label }, i) => (
            <span key={code} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-stone-300">/</span>}
              <button
                onClick={() => setLang(code)}
                className={`transition-colors ${
                  lang === code
                    ? "font-bold text-stone-900"
                    : "font-normal text-stone-400 hover:text-stone-600"
                }`}
              >
                {label}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <header className="mb-10 md:mb-14">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
          <span className="text-[#800020]">{t.title.split(" ")[0]}</span>{" "}
          {t.title.split(" ").slice(1).join(" ")}
        </h1>
        <p className="text-base md:text-lg text-stone-500 leading-relaxed max-w-2xl">
          {t.intro}
        </p>
      </header>

      {/* Tabs */}
      <div className="border-b border-stone-300 mb-10 overflow-x-auto">
        <nav className="flex gap-0 -mb-px min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-[3px] transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-[#800020] text-[#800020]"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>
      </div>

      {/* ===== TAB: STRUCTURE ===== */}
      {activeTab === "structure" && (
        <div className="space-y-12">
          {/* Context callout */}
          <div className="border-l-[3px] border-[#800020] pl-5 md:pl-8 py-1">
            <p className="text-stone-700 leading-relaxed text-[15px]">
              {t.recentContext}
            </p>
          </div>

          {/* Four tiers */}
          <section>
            <h2 className="text-xl md:text-2xl font-extrabold mb-6 tracking-tight">
              {t.tiersHeading}
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {t.tiers.map((tier, i) => {
                const Icon = tierIcons[i];
                return (
                  <div
                    key={tier.name}
                    className="bg-white border border-stone-200 rounded-xl p-6 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#800020]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#800020]" />
                      </div>
                      <div>
                        <p className="font-bold text-[15px] leading-tight">
                          {tier.name}
                        </p>
                        <p className="text-xs text-[#800020] font-semibold">
                          {tier.count}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {tier.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-xl md:text-2xl font-extrabold mb-4 tracking-tight">
              {t.trackingHeading}
            </h2>
            <p className="text-[15px] text-stone-600 leading-relaxed max-w-3xl">
              {t.trackingBody}
            </p>
          </section>
        </div>
      )}

      {/* ===== TAB: CONTACT ===== */}
      {activeTab === "contact" && (
        <div className="space-y-10">
          <div className="grid md:grid-cols-2 gap-5">
            {t.reachSteps.map((step) => (
              <div
                key={step.title}
                className="bg-white border border-stone-200 rounded-xl p-6 hover:border-stone-300 transition-colors"
              >
                <p className="font-bold text-[15px] mb-2 text-[#800020]">
                  {step.title}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="border-l-[3px] border-stone-300 pl-5 md:pl-8">
            <p className="text-sm text-stone-500 leading-relaxed italic">
              {t.reachNote}
            </p>
          </div>
        </div>
      )}

      {/* ===== TAB: RTI ===== */}
      {activeTab === "rti" && (
        <div className="space-y-8">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#800020]/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileSearch className="w-5 h-5 text-[#800020]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight mb-2">
                {t.rtiHeading}
              </h2>
              <p className="text-[15px] text-stone-600 leading-relaxed">
                {t.rtiIntro}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { label: t.rtiFileLabel, body: t.rtiFileBody },
              { label: t.rtiFeeLabel, body: t.rtiFeeBody },
              { label: t.rtiTimeLabel, body: t.rtiTimeBody },
              { label: t.rtiTipLabel, body: t.rtiTipBody },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-colors"
              >
                <p className="font-bold text-sm text-[#800020] mb-1.5 uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: LINKS ===== */}
      {activeTab === "links" && (
        <div className="grid md:grid-cols-2 gap-4">
          {t.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 bg-white border border-stone-200 rounded-xl p-5 hover:border-[#800020]/30 transition-all"
            >
              <div>
                <p className="font-bold text-[15px] group-hover:text-[#800020] transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{link.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-[#800020] shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900">
      <Navbar />
      <LearnMoreContent />
    </div>
  );
}