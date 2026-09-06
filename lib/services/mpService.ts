import { supabase } from '../supabase';

export interface MPInfo {
  name: string;
  id: string; 
  mp_gov_id: number;
  state: string;
  constituency: string;
  constituencyCode: number;
  image?: string;
}

export interface MPListItem extends MPInfo {
  party: string;
  color: string;
}

export interface WorkRecord {
  id: string;
  WORK_CATEGORY?: string;
  ACTIVITY_NAME?: string;
  IDA_NAME?: string;
  WORK_DESCRIPTION?: string;
  RECOMMENDATION_DATE?: string;
  RECOMMENDED_AMOUNT?: number;
  SANCTION_AMOUNT?: number;
  ACTUAL_AMOUNT?: number;
  WORK_STAGE?: string;
  WORK_STATUS?: string;
  LETTER_NO?: string;
  SANCTION_DATE?: string;
  Sno?: number;
}

export interface WorkCategory {
  count: number;
  totalAmount: number;
  records: WorkRecord[];
}

export interface MPLADSData {
  mp: MPInfo;
  party: string;
  color: string;
  works: {
    recommended: WorkCategory;
    sanctioned: WorkCategory;
    completed: WorkCategory;
  };
}

const MP_META_MAP: Record<string, { party: string; color: string }> = {
  "arvind sawant": { party: "Shiv Sena (UBT)", color: "#FF6B00" },
  "piyush goyal": { party: "BJP", color: "#FF9933" },
  "varsha eknath gaikwad": { party: "Congress", color: "#19AAED" },
  "varsha gaikwad": { party: "Congress", color: "#19AAED" },
  "sanjay dina patil": { party: "Shiv Sena (UBT)", color: "#FF6B00" },
  "sanjay patil": { party: "Shiv Sena (UBT)", color: "#FF6B00" },
  "ravindra waikar": { party: "Shiv Sena", color: "#F58220" },
  "anil desai": { party: "Shiv Sena (UBT)", color: "#FF6B00" },
};

function getMPMeta(name: string) {
  const lowerName = name.toLowerCase();
  for (const [key, meta] of Object.entries(MP_META_MAP)) {
    if (lowerName.includes(key)) {
      return meta;
    }
  }
  return { party: "Unknown", color: "#888888" };
}

export async function getMumbaiMPsList(): Promise<{ data: MPListItem[], error: any }> {
  const { data: mps, error: mpsError } = await supabase
    .from('mumbai_mps')
    .select('*')
    .order('constituency_code');

  if (mpsError || !mps) {
    console.error('Error fetching MPs:', mpsError);
    return { data: [], error: mpsError || 'No MPs data returned' };
  }

  const mapped = mps.map(mp => {
    const meta = getMPMeta(mp.name);
    return {
      id: mp.id,
      mp_gov_id: mp.mp_gov_id,
      name: mp.name,
      state: mp.state,
      constituency: mp.constituency,
      constituencyCode: mp.constituency_code,
      party: meta.party,
      color: meta.color,
      image: mp.image
    };
  });
  
  return { data: mapped, error: null };
}

export async function getMumbaiMPDataById(id: string): Promise<MPLADSData | null> {
  const { data: mp, error: mpError } = await supabase
    .from('mumbai_mps')
    .select('*')
    .eq('id', id)
    .single();

  if (mpError || !mp) {
    console.error('Error fetching MP:', mpError);
    return null;
  }

  const { data: works, error: worksError } = await supabase
    .from('mp_works')
    .select('*')
    .eq('mp_id', id);

  if (worksError || !works) {
    console.error('Error fetching works:', worksError);
    return null;
  }

  const recommended = { count: 0, totalAmount: 0, records: [] as WorkRecord[] };
  const sanctioned = { count: 0, totalAmount: 0, records: [] as WorkRecord[] };
  const completed = { count: 0, totalAmount: 0, records: [] as WorkRecord[] };

  works.forEach((w: any, index: number) => {
    const record: WorkRecord = {
      id: w.id,
      WORK_CATEGORY: w.work_category,
      ACTIVITY_NAME: w.activity_name,
      IDA_NAME: w.ida_name,
      WORK_DESCRIPTION: w.work_description,
      RECOMMENDATION_DATE: w.recommendation_date,
      RECOMMENDED_AMOUNT: w.recommended_amount,
      SANCTION_AMOUNT: w.sanction_amount,
      ACTUAL_AMOUNT: w.actual_amount,
      WORK_STAGE: w.work_stage,
      WORK_STATUS: w.work_status,
      LETTER_NO: w.letter_no,
      SANCTION_DATE: w.sanction_date,
      Sno: index + 1
    };

    const stage = (w.work_stage || '').toLowerCase();
    const status = (w.work_status || '').toLowerCase();
    
    if (status === 'completed' || (stage.includes('completed') && !stage.includes('partially'))) {
      completed.count++;
      completed.totalAmount += w.sanction_amount || w.recommended_amount || 0;
      completed.records.push(record);
    } else if (status === 'recommended' || stage.includes('pending for sanction')) {
      recommended.count++;
      recommended.totalAmount += w.recommended_amount || w.sanction_amount || 0;
      recommended.records.push(record);
    } else if (status === 'sanctioned' || (w.sanction_amount && w.sanction_amount > 0)) {
      sanctioned.count++;
      sanctioned.totalAmount += w.sanction_amount || w.recommended_amount || 0;
      sanctioned.records.push(record);
    } else {
      recommended.count++;
      recommended.totalAmount += w.recommended_amount || 0;
      recommended.records.push(record);
    }
  });

  const meta = getMPMeta(mp.name);

  return {
    mp: {
      id: mp.id,
      mp_gov_id: mp.mp_gov_id,
      name: mp.name,
      state: mp.state,
      constituency: mp.constituency,
      constituencyCode: mp.constituency_code,
      image: mp.image
    },
    party: meta.party,
    color: meta.color,
    works: {
      recommended,
      sanctioned,
      completed
    }
  };
}
