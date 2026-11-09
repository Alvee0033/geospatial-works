export interface MegaMenuItem {
    label: string;
    href: string;
    hasArrow?: boolean;
}
export declare class MegaMenu {
    id: string;
    menuKey: string;
    leadHeading: string;
    leadSubtext: string;
    leadLinkText: string;
    leadLinkHref: string;
    categoryTitle: string;
    items: MegaMenuItem[];
    featuredLabel: string;
    featuredTitle: string;
    featuredDesc: string;
    featuredImage: string;
    featuredHref: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
