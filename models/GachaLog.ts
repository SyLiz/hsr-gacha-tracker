export interface GachaLogs {
  page: string;
  size: string;
  list: Log[];
  region: string;
  region_time_zone: number;
}

export interface Log {
  uid: string;
  gacha_id: string;
  gacha_type: string;
  item_id: string;
  count: string;
  time: string;
  name: string;
  lang: string;
  item_type: string;
  rank_type: string;
  id: string;
}
