import { INegozi } from './Negozi';

export interface IUsers {
  username: string;
  email: string;
  cellulare: string;
  password: string;
  attivo: string;
  flagPrivacy: string;
  ruoli: string[];
  negozi: INegozi[];
}
