export class IMenuItem {
  name: string;
  path: string[];
  icon?: string;
  abbreviation?: {
    backgroundColor: string,
    letters: string,
  };
}
