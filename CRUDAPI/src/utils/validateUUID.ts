import { validate as isUuid } from 'uuid';

export default function validateUUID(id: string): boolean {
  return isUuid(id);
}
