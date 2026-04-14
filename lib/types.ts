export type ConsultationCategory = 
  | 'mental-health'
  | 'harassment'
  | 'career'
  | 'engagement'
  | 'other'

export interface CategoryInfo {
  id: ConsultationCategory
  label: string
  description: string
  icon: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'mental-health',
    label: 'メンタルヘルス',
    description: 'ストレス、不安、気分の落ち込みなど',
    icon: 'heart',
  },
  {
    id: 'harassment',
    label: 'ハラスメント',
    description: '職場や人間関係でのハラスメント相談',
    icon: 'shield',
  },
  {
    id: 'career',
    label: 'キャリア',
    description: '仕事の悩み、キャリアプランニング',
    icon: 'briefcase',
  },
  {
    id: 'engagement',
    label: 'エンゲージメント',
    description: '仕事へのモチベーション、やりがい',
    icon: 'flame',
  },
  {
    id: 'other',
    label: 'その他',
    description: 'その他のご相談',
    icon: 'message-circle',
  },
]

export interface SupportResource {
  name: string
  phone?: string
  url?: string
  description: string
  hours?: string
}

export const OFFICIAL_RESOURCES: SupportResource[] = [
  {
    name: 'こころの健康相談統一ダイヤル',
    phone: '0570-064-556',
    description: '都道府県の相談窓口につながります',
  },
  {
    name: 'よりそいホットライン',
    phone: '0120-279-338',
    description: '24時間対応、無料',
    hours: '24時間',
  },
  {
    name: 'いのちの電話',
    phone: '0570-783-556',
    description: '悩みを抱える方の相談窓口',
  },
  {
    name: 'まもろうよ こころ（厚生労働省）',
    url: 'https://www.mhlw.go.jp/mamorouyokokoro/',
    description: '悩み別の相談窓口を検索できます',
  },
  {
    name: '働く人の「こころの耳」',
    url: 'https://kokoro.mhlw.go.jp/',
    phone: '0120-565-455',
    description: '職場のメンタルヘルス対策',
  },
]

export interface HistoryEntry {
  date: string
  category: string
  summary: string
  keywords: string[]
}
