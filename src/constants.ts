export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isExternal?: boolean;
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: '1', label: 'Beranda', icon: 'Home', href: '#' },
  { id: '2', label: 'Artikel', icon: 'FileText', href: '#' },
  { id: '3', label: 'Unduhan', icon: 'Download', href: '#' },
  { id: '4', label: 'Statistik', icon: 'BarChart2', href: '#' },
  { id: '6', label: 'Quis', icon: 'Compass', href: 'https://smartadethea.pages.dev', isExternal: true },
  { id: '5', label: 'Pengaturan', icon: 'Settings', href: '#' },
];

export const SLIDE_ITEMS: SlideItem[] = [
  {
    id: '1',
    title: 'Desain Modern & Responsif',
    subtitle: 'Pengalaman pengguna yang luar biasa di semua perangkat.',
    imageUrl: 'https://picsum.photos/seed/slide1/1200/600',
    ctaText: 'Pelajari Lebih Lanjut',
  },
  {
    id: '2',
    title: 'Navigasi Mudah',
    subtitle: 'Sidebar intuitif untuk kemudahan akses menu Anda.',
    imageUrl: 'https://picsum.photos/seed/slide2/1200/600',
    ctaText: 'Mulai Sekarang',
  },
  {
    id: '3',
    title: 'Performa Optimal',
    subtitle: 'Dibangun dengan teknologi terbaru untuk kecepatan maksimal.',
    imageUrl: 'https://picsum.photos/seed/slide3/1200/600',
    ctaText: 'Coba Demo',
  },
];
