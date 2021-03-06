export function isValidName(name: string): boolean {
  if (!name) {
    return false;
  }

  //Name should contain only a-z 0-9 and dash as it will be passed in the url
  return /^[a-z0-9-]+$/.test(name);
}

export function assertNameIsValid(name: string): void {
  if (!name) {
    throw new Error('Name is undefined');
  }

  if (!isValidName(name)) {
    throw new Error(
      `"${name}" is not valid name. Use only lowercase latin symbols, digits and dash`,
    );
  }

  return;
}
