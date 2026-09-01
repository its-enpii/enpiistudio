export interface SidebarItem {
  key: string | number
  label: string
  icon?: string
  href?: string
  badge?: string | number
  children?: SidebarItem[]
}

export interface NavLink {
  key?: string | number
  label: string
  href?: string
  active?: boolean
}

export interface FooterLink {
  key?: string | number
  label: string
  href?: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}
