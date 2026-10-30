import type { SVGProps } from "react";
import {
  BellIcon,
  BookmarkSimpleIcon,
  CalendarBlankIcon,
  CameraIcon,
  ChatCircleIcon,
  CompassIcon,
  ForkKnifeIcon,
  GearIcon,
  HeartIcon,
  HouseIcon,
  ImageIcon as PhImageIcon,
  ImagesIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NotebookIcon,
  StarIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Baby,
  BadgeCheck,
  BatteryFull,
  Bell,
  Bookmark,
  Calendar,
  Camera,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleParking,
  CircleX,
  Clock3,
  Compass,
  Copy,
  Ellipsis,
  EllipsisVertical,
  Funnel,
  Heart,
  House,
  ImageIcon,
  Images,
  Info,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  NotebookTabs,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share,
  Share2,
  Signal,
  SquarePlus,
  Star,
  Trash2,
  TriangleAlert,
  User,
  UserRound,
  Utensils,
  Wifi,
  X,
} from "lucide-react";

// design.pen Iconography Foundation: 디자인 아이콘명 → Lucide 아이콘
export const icons = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  home: House,
  calendar: Calendar,
  copy: Copy,
  refresh: RefreshCw,
  logout: LogOut,
  close: X,
  menu: Menu,
  search: Search,
  filter: Funnel,
  sort: ArrowUpDown,
  plus: Plus,
  edit: Pencil,
  delete: Trash2,
  bookmark: Bookmark,
  share: Share2,
  "more-horizontal": Ellipsis,
  "more-vertical": EllipsisVertical,
  check: Check,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
  user: User,
  settings: Settings,
  notification: Bell,
  heart: Heart,
  star: Star,
  comment: MessageCircle,
  image: ImageIcon,
  signal: Signal,
  wifi: Wifi,
  "battery-full": BatteryFull,
  "map-pin": MapPin,
  "user-round": UserRound,
  "car-front": CarFront,
  "badge-check": BadgeCheck,
  "loader-circle": LoaderCircle,
  compass: Compass,
  "notebook-tabs": NotebookTabs,
  images: Images,
  "circle-parking": CircleParking,
  baby: Baby,
  "clock-3": Clock3,
  utensils: Utensils,
  navigation: Navigation,
  "circle-alert": CircleAlert,
  camera: Camera,
  // iOS 홈 화면 추가 안내: Safari 공유 버튼 · '홈 화면에 추가' 메뉴 아이콘
  "share-ios": Share,
  "square-plus": SquarePlus,
} as const;

export type IconName = keyof typeof icons;

// Lucide에는 필(fill) 스타일이 없어, 선택 상태 등 "필" 아이콘은 Phosphor fill로 대체 (design.pen 바텀내비 선택 아이콘과 동일)
const filledIcons: Partial<Record<IconName, PhosphorIcon>> = {
  home: HouseIcon,
  compass: CompassIcon,
  "notebook-tabs": NotebookIcon,
  user: UserIcon,
  "user-round": UserIcon,
  heart: HeartIcon,
  star: StarIcon,
  bookmark: BookmarkSimpleIcon,
  search: MagnifyingGlassIcon,
  notification: BellIcon,
  comment: ChatCircleIcon,
  "map-pin": MapPinIcon,
  settings: GearIcon,
  calendar: CalendarBlankIcon,
  image: PhImageIcon,
  images: ImagesIcon,
  camera: CameraIcon,
  utensils: ForkKnifeIcon,
};

export const filledIconNames = Object.keys(filledIcons) as IconName[];

export const iconNames = Object.keys(icons) as IconName[];

export const iconSizes = [16, 20, 24, 32] as const;

export type IconSize = (typeof iconSizes)[number];

export type IconProps = {
  name: IconName;
  size?: IconSize;
  /** 지정하지 않으면 장식용으로 간주해 스크린리더에서 숨긴다 */
  label?: string;
  /** 필 스타일. filledIconNames에 있는 아이콘만 지원하며, 없으면 아웃라인으로 표시 */
  filled?: boolean;
} & Omit<SVGProps<SVGSVGElement>, "ref">;

export function Icon({ name, size = 24, label, filled, className = "", ...props }: IconProps) {
  const FilledIcon = filled ? filledIcons[name] : undefined;
  if (FilledIcon) {
    return (
      <FilledIcon
        size={size}
        weight="fill"
        aria-label={label}
        aria-hidden={label ? undefined : true}
        role={label ? "img" : undefined}
        className={`shrink-0 ${className}`}
      />
    );
  }

  const LucideIcon = icons[name];
  return (
    <LucideIcon
      size={size}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      className={`shrink-0 ${className}`}
      {...props}
    />
  );
}
