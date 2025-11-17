export interface INotification {
  notificationId: string;
  title: string;
  content: string;
  isRead: boolean;
  actionName: string;
  actionParameter: string;
  createdOn: string; 
}

export interface INotificationReadPayload{
notificationId : string;
userId : string;
}

export interface Ipayload{
  deviceEventId :  string
}