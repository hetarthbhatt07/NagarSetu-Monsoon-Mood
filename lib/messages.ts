export type MessageLanguage = "en" | "gu" | "hi";
export type MessageChannel = "whatsapp" | "pa" | "notice" | "social";

export interface CommuterMessageParams {
  stationName: string;
  entranceLabel: string;
  alternateEntranceLabel: string;
  validityWindow: string;
  riskBand: "Low" | "Medium" | "High";
  peakRainMm: number;
}

export interface GeneratedMessage {
  text: string;
  charCount: number;
  charLimit?: number;
  isWithinLimit: boolean;
  channel: MessageChannel;
  language: MessageLanguage;
  translationDisclaimer: string;
}

const TRANSLATION_DISCLAIMER =
  "Translation draft, verify with a fluent speaker before publishing.";

export function generateCommuterMessage(
  params: CommuterMessageParams,
  channel: MessageChannel,
  language: MessageLanguage
): GeneratedMessage {
  const { stationName, entranceLabel, alternateEntranceLabel, validityWindow, riskBand } = params;

  let text = "";
  let limit: number | undefined = undefined;

  if (channel === "whatsapp") {
    limit = 300;
    if (language === "en") {
      text =
        `🌧️ *AHMEDABAD METRO MONSOON ADVISORY*\n` +
        `Station: ${stationName}\n` +
        `Notice: ${entranceLabel} has waterlogging risk (${riskBand}). Please use alternate *${alternateEntranceLabel}*.\n` +
        `Window: ${validityWindow}\n` +
        `Lifts/trains operational. Stay cautious.\n` +
        `Approved by: [OPERATOR_NAME]`;
    } else if (language === "gu") {
      text =
        `🌧️ *અમદાવાદ મેટ્રો ચોમાસુ માર્ગદર્શિકા*\n` +
        `સ્ટેશન: ${stationName}\n` +
        `સૂચના: ${entranceLabel} પાસે પાણી ભરાવાની શક્યતા છે. કૃપા કરીને વૈકલ્પિક *${alternateEntranceLabel}* નો ઉપયોગ કરો.\n` +
        `સમય: ${validityWindow}\n` +
        `ટ્રેન સેવા રાબેતા મુજબ ચાલુ છે.\n` +
        `મંજૂરકર્તા: [ઓપરેટર નામ]`;
    } else {
      // Hindi
      text =
        `🌧️ *अहमदाबाद मेट्रो मानसून सतर्कता सूचना*\n` +
        `स्टेशन: ${stationName}\n` +
        `सूचना: ${entranceLabel} पर जलभराव जोखिम है। कृपया वैकल्पिक *${alternateEntranceLabel}* का उपयोग करें।\n` +
        `समय: ${validityWindow}\n` +
        `मेट्रो सेवाएं सामान्य रूप से जारी हैं।\n` +
        `स्वीकृत कर्ता: [ऑपरेटर नाम]`;
    }
  } else if (channel === "pa") {
    if (language === "en") {
      text =
        `Attention passengers at ${stationName}. Due to heavy rain, passengers are advised to use ${alternateEntranceLabel} as ${entranceLabel} has water pooling. Escalators and train services remain fully operational. (Approved by: [OPERATOR_NAME])`;
    } else if (language === "gu") {
      text =
        `${stationName} ના યાત્રીઓ ધ્યાન આપો. ભારે વરસાદના કારણે ${entranceLabel} પાસે પાણી ભરાવાથી યાત્રીઓને ${alternateEntranceLabel} નો ઉપયોગ કરવા વિનંતી છે. ટ્રેન સેવાઓ નિયમિત ચાલુ છે. (મંજૂરકર્તા: [ઓપરેટર નામ])`;
    } else {
      // Hindi
      text =
        `${stationName} के यात्रियों कृपया ध्यान दें। भारी बारिश के चलते ${entranceLabel} पर पानी एकत्र होने से आप सभी ${alternateEntranceLabel} का उपयोग करें। ट्रेन सेवाएं सामान्य रूप से चल रही हैं। (स्वीकृत कर्ता: [ऑपरेटर नाम])`;
    }
  } else if (channel === "notice") {
    if (language === "en") {
      text =
        `AHMEDABAD METRO OPERATIONAL NOTICE\n` +
        `STATION: ${stationName.toUpperCase()}\n` +
        `• ADVISORY: Temporary entry adjustment due to localized rain runoff\n` +
        `• RECOMMENDED ACCESS: Use ${alternateEntranceLabel} (Elevated, sheltered corridor)\n` +
        `• RESTRICTED ACCESS: Avoid low-lying approach at ${entranceLabel}\n` +
        `VALIDITY: ${validityWindow}\n` +
        `Approved by: Station Operations Controller [OPERATOR_NAME]`;
    } else if (language === "gu") {
      text =
        `અમદાવાદ મેટ્રો સંચાલન સૂચના પાટિયું\n` +
        `સ્ટેશન: ${stationName}\n` +
        `• સલાહ: ભારે વરસાદી પાણીના નિકાલ માટે પ્રવેશ વ્યવસ્થામાં ફેરફાર\n` +
        `• ભલામણ કરેલ પ્રવેશ: ${alternateEntranceLabel} નો ઉપયોગ કરવો\n` +
        `• સાવચેતી: ${entranceLabel} પાસે નીચાણવાળા વિસ્તારથી બચો\n` +
        `માન્યતા સમય: ${validityWindow}\n` +
        `મંજૂરકર્તા: સ્ટેશન ઓપરેશન્સ કંટ્રોલર [ઓપરેટર નામ]`;
    } else {
      // Hindi
      text =
        `अहमदाबाद मेट्रो स्टेशन संचालन सूचना\n` +
        `स्टेशन: ${stationName}\n` +
        `• परामर्श: भारी बारिश व जलभराव को देखते हुए प्रवेश मार्ग में परिवर्तन\n` +
        `• अनुशंसित प्रवेश द्वार: ${alternateEntranceLabel} का उपयोग करें\n` +
        `• सावधानी: ${entranceLabel} के निचले क्षेत्र की ओर जाने से बचें\n` +
        `वैधता अवधि: ${validityWindow}\n` +
        `स्वीकृत कर्ता: स्टेशन परिचालन नियंत्रक [ऑपरेटर नाम]`;
    }
  } else if (channel === "social") {
    limit = 160;
    if (language === "en") {
      text = `⚠️ #MetroAlert: Heavy rain at ${stationName}. Use ${alternateEntranceLabel} instead of ${entranceLabel}. Trains running normal. (${validityWindow}) Apprv: [OP]`;
    } else if (language === "gu") {
      text = `⚠️ #મેટ્રોએલર્ટ: ${stationName} પર વરસાદી ચેતવણી. ${entranceLabel} ના બદલે ${alternateEntranceLabel} વાપરો. સેવાઓ ચાલુ. સમય: ${validityWindow}. [OP]`;
    } else {
      // Hindi
      text = `⚠️ #मेट्रोअपडेट: ${stationName} पर बारिश। ${entranceLabel} के बदले ${alternateEntranceLabel} का उपयोग करें। मेट्रो चालू है। (${validityWindow}) [OP]`;
    }
  }

  const charCount = text.length;
  const isWithinLimit = limit ? charCount <= limit : true;

  return {
    text,
    charCount,
    charLimit: limit,
    isWithinLimit,
    channel,
    language,
    translationDisclaimer: TRANSLATION_DISCLAIMER,
  };
}
