import uniqid from 'uniqid';

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function appendPrefix(name: string, prefix: string) {
  if (prefix !== undefined && prefix !== null && prefix !== '') {
    return prefix + (prefix.endsWith('/') ? '' : '/') + name;
  } else {
    return name;
  }
}

export function getRandomId(): string {
  return uniqid();
}
