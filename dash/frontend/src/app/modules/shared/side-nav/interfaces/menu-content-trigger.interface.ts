export class IMenuContentTrigger {
  name: string;
  title: string;
  icon: string;
  adminsOnly: boolean;
  callback: (parent) => void;
}
