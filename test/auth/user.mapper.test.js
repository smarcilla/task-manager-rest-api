import { mapUser } from '../../src/auth/user.mapper.js';

describe('mapUser', () => {
  it('should map user to userDTO', () => {
    const user = {
      id: '123',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedUserDTO = {
      id: '123',
      password: 'hashedpassword',
      email: 'john.doe@example.com',
    };

    const userDTO = mapUser(user);
    expect(userDTO).toEqual(expectedUserDTO);
  });

  it('should return null if user is null', () => {
    const userDTO = mapUser(null);
    expect(userDTO).toBeNull();
  });

  it('should return undefined if user is undefined', () => {
    const userDTO = mapUser(undefined);
    expect(userDTO).toBeUndefined();
  });

  it('should handle documents with toJSON method', () => {
    const doc = {
      _id: '123',
      email: 'john.doe@example.com',
      toJSON: function () {
        return {
          id: this._id,
          email: this.email,
          password: 'hashedpassword',
        };
      },
    };
    const userDTO = mapUser(doc);
    expect(userDTO).toEqual({
      id: '123',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
    });
  });
});
