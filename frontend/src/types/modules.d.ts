declare module 'react-dom/client' {
  import React from 'react';
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment | null): Root;
}

declare module 'lucide-react' {
  import React from 'react';
  type IconComponent = React.FC<any>;
  const icons: Record<string, IconComponent>;
  export default icons;

  export const Github: IconComponent;
  export const Twitter: IconComponent;
  export const Linkedin: IconComponent;
  export const Kanban: IconComponent;
  export const Code2: IconComponent;
  export const CheckSquare: IconComponent;
  export const Activity: IconComponent;
  export const Key: IconComponent;
  export const AlertCircle: IconComponent;
  export const CheckCircle2: IconComponent;
  export const Globe: IconComponent;
  export const UploadCloud: IconComponent;
  export const FileCode: IconComponent;
  export const ArrowRightLeft: IconComponent;
  export const Star: IconComponent;
  export const ShieldAlert: IconComponent;
  export const Building: IconComponent;
  export const MoveRight: IconComponent;
  export const Zap: IconComponent;
  export const ShieldCheck: IconComponent;
  export const Brain: IconComponent;

  export const BarChart3: IconComponent;
  export const TrendingUp: IconComponent;
  export const Users: IconComponent;
  export const Calendar: IconComponent;
  export const Award: IconComponent;
  export const Sparkles: IconComponent;
  export const Check: IconComponent;
  export const X: IconComponent;
  export const ChevronDown: IconComponent;
  export const Search: IconComponent;
  export const Plus: IconComponent;
  export const Filter: IconComponent;
  export const Briefcase: IconComponent;
  export const MapPin: IconComponent;
  export const DollarSign: IconComponent;
  export const Clock: IconComponent;
  export const User: IconComponent;
  export const Mail: IconComponent;
  export const Phone: IconComponent;
  export const FileText: IconComponent;
  export const Download: IconComponent;
  export const Eye: IconComponent;
  export const Trash2: IconComponent;
  export const Edit: IconComponent;
  export const Copy: IconComponent;
  export const ExternalLink: IconComponent;
  export const LogOut: IconComponent;
  export const Settings: IconComponent;
  export const Bell: IconComponent;
  export const Moon: IconComponent;
  export const Sun: IconComponent;
  export const Shield: IconComponent;
  export const Code: IconComponent;
  export const Play: IconComponent;
  export const CheckCircle: IconComponent;
  export const AlertTriangle: IconComponent;
  export const XCircle: IconComponent;
  export const Send: IconComponent;
  export const LayoutDashboard: IconComponent;
  export const UserCheck: IconComponent;
  export const FileCheck: IconComponent;
  export const HelpCircle: IconComponent;
  export const ChevronRight: IconComponent;
  export const ChevronLeft: IconComponent;
  export const ArrowRight: IconComponent;
  export const ArrowLeft: IconComponent;
  export const RefreshCw: IconComponent;
  export const Upload: IconComponent;
  export const Lock: IconComponent;
  export const Unlock: IconComponent;
  export const Menu: IconComponent;
  export const MoreVertical: IconComponent;
  export const MoreHorizontal: IconComponent;
}

declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(options?: any);
  }
  export const QueryClientProvider: any;
  export function useQuery(options?: any): any;
  export function useMutation(options?: any): any;
}

declare module '@monaco-editor/react' {
  const Editor: any;
  export default Editor;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: any[]): string;
}
