// Ícones customizados SVG feitos do zero
// Todos os ícones são modernos, limpos e consistentes

import styles from './Icons.module.css';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  fill?: string;
}

// ============= NAVEGAÇÃO =============

export const IconHome = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 21V12H15V21" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconShopping = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M3 6H21" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconUser = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle 
      cx="12" 
      cy="8" 
      r="4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ stroke: color }}
    />
    <path 
      d="M5 20C5 17.2386 7.23858 15 10 15H14C16.7614 15 19 17.2386 19 20" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ stroke: color }}
    />
  </svg>
);

export const IconMail = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconMenu = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M3 12H21" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M3 18H21" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconClose = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M6 6L18 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

// ============= ADMIN / GESTÃO =============
export const IconCamera = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);


export const IconDashboard = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2"/>
  </svg>
);

export const IconAdd = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <path d="M12 8V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconPackage = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 3L3 7.5V16.5L12 21L21 16.5V7.5L12 3Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path d="M12 12L21 7.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 12V21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 12L3 7.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconTag = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M3.5 12.5L11.5 20.5L20.5 11.5V3.5H12.5L3.5 12.5Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="16.5" cy="7.5" r="1.5" fill={color}/>
  </svg>
);

export const IconHistory = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 12H6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconSearch = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2"/>
    <path d="M16 16L21 21" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const IconFilter = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M4 4H20L14 11.5V18L10 20V11.5L4 4Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconChevronDown = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconEdit = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M17 3L21 7L9 19H5V15L17 3Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ stroke: color }}
    />
    <path d="M15 5L19 9" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconDelete = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
    <path 
      d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
      style={{ stroke: color }}
    />
    <path 
      d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
      style={{ stroke: color }}
    />
    <path d="M10 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M14 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconUpload = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
    <path 
      d="M21 15L16 10L11 15" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path d="M3 16L7 12L11 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ============= AUTH / SEGURANÇA =============

export const IconLogin = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M10 17L15 12L10 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}/>
    <path d="M15 12H3" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconLogout = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}/>
    <path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconKey = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="7" cy="17" r="4" stroke={color} strokeWidth="2"/>
    <path d="M10.5 14.5L21 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 4H21V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconEye = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);

export const IconEyeOff = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3L21 21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path 
      d="M10.5 10.5C10.1872 10.8128 10 11.2373 10 11.6796C10 12.122 10.1872 12.5465 10.5 12.8593C10.8128 13.1721 11.2373 13.3593 11.6796 13.3593C12.122 13.3593 12.5465 13.1721 12.8593 12.8593" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M7.36 7.36C5.68 8.68 4.5 10.5 4 12C5 15 8 18 12 18C13.24 18 14.38 17.73 15.39 17.26" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M16.82 16.82C15.5 17.88 13.86 18.5 12 18.5C8 18.5 5 15 4 12C4.5 10.5 5.68 8.68 7.36 7.36" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path d="M12 5.5C16 5.5 19 9 20 12C19.5 13.5 18.32 15.32 16.64 16.64" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ============= UI / AÇÕES =============

export const IconArrowRight = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <path d="M12 8L16 12L12 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconArrowLeft = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconStar = ({ size = 24, color = 'currentColor', className, fill }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} className={className}>
    <path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconHeart = ({ size = 24, color = 'currentColor', className, fill }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} className={className}>
    <path 
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconHeartFilled = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path 
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z"
    />
  </svg>
);

export const IconUserPlus = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle 
      cx="10" 
      cy="8" 
      r="4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M3 20C3 17.2386 5.23858 15 8 15H12C14.7614 15 17 17.2386 17 20" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path d="M18 8V14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 11H15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconCheck = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconAlert = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5318 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4682 3.56611 10.29 3.86V3.86Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path d="M12 9V13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill={color}/>
  </svg>
);

export const IconAlertCircle = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <path d="M12 8V12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill={color}/>
  </svg>
);

export const IconLoader = ({ size = 24, color = 'currentColor', className }: IconProps) => {
  const combinedClassName = className ? `${styles.spinIcon} ${className}` : styles.spinIcon;
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={combinedClassName}>
    <path 
      d="M12 2V6" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.2"
    />
    <path 
      d="M12 18V22" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.9"
    />
    <path 
      d="M4.93 4.93L7.76 7.76" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.3"
    />
    <path 
      d="M16.24 16.24L19.07 19.07" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.8"
    />
    <path 
      d="M2 12H6" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.4"
    />
    <path 
      d="M18 12H22" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.7"
    />
    <path 
      d="M4.93 19.07L7.76 16.24" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.5"
    />
    <path 
      d="M16.24 7.76L19.07 4.93" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
  );
};

export const IconMessage = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47091C20.0052 6.94703 20.885 8.91568 21 11V11.5Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// ============= SOCIAL / OUTROS =============

export const IconInstagram = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill={color}/>
  </svg>
);

export const IconMapPin = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" 
      stroke={color} 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2"/>
    <path d="M15 17L12 19L9 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconPhone = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const IconWhatsapp = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M17.472 14.382C17.194 14.243 15.859 13.585 15.602 13.493C15.346 13.402 15.156 13.355 14.966 13.632C14.776 13.909 14.254 14.521 14.089 14.711C13.923 14.902 13.758 14.926 13.48 14.787C11.915 14.004 10.856 13.394 9.794 11.593C9.509 11.112 10.079 11.148 10.609 10.119C10.7 9.929 10.653 9.763 10.583 9.624C10.513 9.486 9.956 8.15 9.723 7.574C9.497 7.015 9.267 7.092 9.095 7.083C8.929 7.074 8.739 7.071 8.549 7.071C8.359 7.071 8.052 7.141 7.796 7.418C7.539 7.695 6.837 8.353 6.837 9.689C6.837 11.024 7.82 12.314 7.96 12.504C8.099 12.695 9.951 15.526 12.752 16.699C14.539 17.436 15.286 17.509 16.237 17.369C16.821 17.28 17.892 16.722 18.125 16.101C18.358 15.48 18.358 14.95 18.288 14.834C18.219 14.719 18.029 14.649 17.751 14.51C17.473 14.372 17.472 14.382 17.472 14.382Z" 
      fill={color}
    />
    <path 
      d="M20.52 3.449C12.831 -3.679 0.106 1.407 0.101 11.893C0.101 13.878 0.622 15.812 1.61 17.529L0 24L6.635 22.424C8.289 23.318 10.139 23.79 12.014 23.79H12.02C22.505 23.79 28.239 10.847 20.52 3.449ZM12.02 21.785C10.348 21.785 8.708 21.334 7.275 20.479L6.957 20.286L3.018 21.319L4.069 17.484L3.859 17.152C2.912 15.664 2.412 13.937 2.412 12.16C2.412 4.649 10.838 -0.549 17.621 4.037C23.436 8.118 22.047 17.586 15.151 21.285C14.189 21.6 13.114 21.785 12.02 21.785Z" 
      fill={color}
    />
  </svg>
);
