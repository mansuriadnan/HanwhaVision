export interface ISite {
    id?: string;
    siteName: string;
    hostingAddress: string;
    username: string;
    password: string;
    childSites?: ChildSite[];
    children?: ChildSite[];
    createdOn?: string | null;
    createdBy?: string | null;
    updatedOn?: string | null;
    updatedBy?: string | null;
    parentSiteId?:string;
    isParent?:boolean;
}

export interface ChildSite {
    parentSiteId?: string | null;
    id?: string;
    siteName: string;
    hostingAddress: string;
    username: string;
    password: string;
    isParent?:boolean;
  }
export interface IDeleteSite{
    childID : string,
    hasChildrens : boolean
}

export interface IDeleteSubSite{
    childID : string,
    subChildID : string
}
