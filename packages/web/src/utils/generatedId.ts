import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

// URL-friendly entities (appear in routes) use nanoid (short, URL-safe)
// Other entities (not in URLs) use uuid v4 (standard, unambiguous)
type UrlFriendlyEntity = 'recipe' | 'ingredient' | 'planned';
type StandardEntity = 'chat' | 'msg' | 'sl' | 'prod' | 'memory';
type EntityType = UrlFriendlyEntity | StandardEntity;

export function generatedId(entity: EntityType): string {
  switch (entity) {
    case 'recipe':
    case 'ingredient':
    case 'planned':
      return nanoid();
    case 'chat':
    case 'msg':
    case 'sl':
    case 'prod':
    case 'memory':
      return uuidv4();
  }
}
