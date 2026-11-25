/**
 * Test data for the editors: one `build*()` per kind of item, returning a complete object whose
 * field names are the ones the step dialogs take (`typeData`, `addRoles`, ...). The display name
 * is required - the test names what it creates, so a failure can be traced back to it - and the
 * rest is derived from it unless given: `id` from the display name, `email` from the id.
 *
 *   const name = userItemsBuilder.generateRandomName('user');
 *   const user = userItemsBuilder.buildUser(name, PASSWORD, userItemsBuilder.generateEmail(name), [], PROVIDER);
 *   const user = userItemsBuilder.buildUser({ displayName: name, idProvider: PROVIDER, roles: ['Administrator'] });
 *
 * Positional: buildUser(displayName, password, email, roles, idProvider), buildGroup(displayName,
 * description, members, roles), buildRole(displayName, description, members),
 * buildIdProvider(displayName, description, application, permissions).
 */
const appConst = require('./app_const');

const SYSTEM_ID_PROVIDER = 'system';
const SYSTEM_ID_PROVIDER_DISPLAY_NAME = 'System Id Provider';

function randomNumber() {
  return Math.round(Math.random() * 1000000);
}

function randomName(part) {
  return part + randomNumber();
}

// The 'ID' (principal name) a display name turns into: lower case, spaces to dashes.
function nameOf(displayName) {
  return displayName.trim().toLowerCase().replace(/\s+/g, '-');
}

function emailOf(name) {
  return `${name}@gmail.com`;
}

// Positional arguments → the overrides object; an object as the first argument is taken as is.
function overridesFrom(args, fields) {
  const [first] = args;
  if (first !== undefined && first !== null && typeof first === 'object') {
    return first;
  }
  const overrides = {};
  fields.forEach((field, index) => {
    if (args[index] !== undefined) {
      overrides[field] = args[index];
    }
  });
  return overrides;
}

// displayName (required) → id, derived unless overridden.
function named(kind, overrides) {
  const { displayName } = overrides;
  if (typeof displayName !== 'string' || displayName.trim() === '') {
    throw new Error(
      `build${kind}: displayName is required - e.g. build${kind}(generateRandomName('${kind.toLowerCase()}'), ...)`,
    );
  }
  const id = overrides.id ?? overrides.name ?? nameOf(displayName);
  return { displayName, id };
}

module.exports = {
  SYSTEM_ID_PROVIDER,
  SYSTEM_ID_PROVIDER_DISPLAY_NAME,

  generateRandomName: randomName,
  generateRandomNumber: randomNumber,
  generateEmail: emailOf,
  nameOf,

  // { idProvider, displayName, id, email, password, roles, groups }
  // `idProvider` is the display name shown in the ID provider step's combobox. It has no default:
  // the system ID provider takes service accounts only (buildServiceAccount), so a user needs one
  // the test made or knows.
  buildUser(...args) {
    const overrides = overridesFrom(args, [
      'displayName',
      'password',
      'email',
      'roles',
      'idProvider',
    ]);
    const { displayName, id } = named('User', overrides);
    return {
      idProvider: overrides.idProvider,
      displayName,
      id,
      // `name` is what the old wizard called the id; kept so either reads.
      name: id,
      email: overrides.email ?? emailOf(id),
      password: overrides.password ?? appConst.PASSWORD.MEDIUM,
      roles: overrides.roles ?? [],
      groups: overrides.groups ?? [],
    };
  },

  // A service account is a user of the system ID provider, created without the ID provider step:
  // { displayName, id, email, password, publicKeys, roles, groups }. `publicKeys` is a list of
  // labels, one key generated per label on the Credentials step.
  buildServiceAccount(...args) {
    const overrides = overridesFrom(args, ['displayName', 'password', 'email', 'roles']);
    const { displayName, id } = named('ServiceAccount', overrides);
    return {
      displayName,
      id,
      name: id,
      email: overrides.email ?? emailOf(id),
      password: overrides.password ?? appConst.PASSWORD.MEDIUM,
      publicKeys: overrides.publicKeys ?? [],
      roles: overrides.roles ?? [],
      groups: overrides.groups ?? [],
    };
  },

  // { idProvider, displayName, id, description, members, roles }
  buildGroup(...args) {
    const overrides = overridesFrom(args, ['displayName', 'description', 'members', 'roles']);
    const { displayName, id } = named('Group', overrides);
    return {
      idProvider: overrides.idProvider ?? SYSTEM_ID_PROVIDER_DISPLAY_NAME,
      displayName,
      id,
      name: id,
      description: overrides.description ?? `${displayName} description`,
      members: overrides.members ?? [],
      roles: overrides.roles ?? [],
    };
  },

  // { displayName, id, description, users, groups } - `members` is accepted as the users.
  buildRole(...args) {
    const overrides = overridesFrom(args, ['displayName', 'description', 'members']);
    const { displayName, id } = named('Role', overrides);
    return {
      displayName,
      id,
      name: id,
      description: overrides.description ?? `${displayName} description`,
      users: overrides.users ?? overrides.members ?? [],
      groups: overrides.groups ?? [],
    };
  },

  // { displayName, id, description, application, permissions }
  // `application` is the display name offered in the General step's selector (undefined: none);
  // `permissions` is { '<principal display name>': '<appConst.ID_PROVIDER_ACCESS.*>' }.
  buildIdProvider(...args) {
    const overrides = overridesFrom(args, [
      'displayName',
      'description',
      'authAppName',
      'permissions',
    ]);
    const { displayName, id } = named('IdProvider', overrides);
    return {
      displayName,
      id,
      name: id,
      description: overrides.description ?? `${displayName} description`,
      application: overrides.application ?? overrides.authAppName,
      permissions: overrides.permissions ?? {},
    };
  },
};
