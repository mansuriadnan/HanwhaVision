export interface IEventlogs {
  id: string;
  createdOn: string; // ISO date string
  eventName: string;
  eventDescription: string;
  floorName: string;
  zoneName: string;
  videoLink: string;
  isAcknowledged: boolean;
}