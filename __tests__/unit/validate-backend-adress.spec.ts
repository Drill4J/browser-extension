import { validateBackendAdress } from '../../src/forms/form-validators';

describe('validateBackendAdress', () => {
  const validator = validateBackendAdress('backendAddress');
  const error = { backendAddress: 'Admin API URL is not correct. Please enter a valid URL matching the "http(s)://host(:port)" format.' };
  it('should return error if backendAddress is invalid', () => {
    expect(validator({ backendAddress: 'http://foo' })).toEqual(error);
    expect(validator({ backendAddress: 'http://localhost:65536' })).toEqual(error);
    expect(validator({ backendAddress: 'http://256.0.0.1' })).toEqual(error);
    expect(validator({ backendAddress: 'http://192.168.1' })).toEqual(error);
    expect(validator({ backendAddress: 'http://192.168.0.0/24' })).toEqual(error);
    expect(validator({ backendAddress: 'http://192.168..1' })).toEqual(error);
    expect(validator({ backendAddress: 'http://my.example.fr:65536' })).toEqual(error);
    expect(validator({ backendAddress: 'http://my.example.fr:-1234' })).toEqual(error);
    expect(validator({ backendAddress: 'http://my.example.fr.' })).toEqual(error);
    expect(validator({ backendAddress: 'http://WWW.exaMple.FR' })).toEqual(error);
    expect(validator({ backendAddress: 'http://what..ever.com' })).toEqual(error);
    expect(validator({ backendAddress: 'http://what.ever.com..' })).toEqual(error);
    expect(validator({ backendAddress: 'http://www.пример.bg' })).toEqual(error);
    expect(validator({ backendAddress: 'http://...' })).toEqual(error);
    expect(validator({ backendAddress: 'http://..' })).toEqual(error);
    expect(validator({ backendAddress: 'http://.' })).toEqual(error);
  });

  it('should return no error if backendAddress is valid', () => {
    expect(validator({ backendAddress: 'http://foo.ru' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://localhost' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://www.localhost.ru' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://localhost.uk' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://0.0.0.0:0' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://255.0.0.0' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://192.168.1.1' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://192.168.1.0:8080' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://my.example.fr:1234' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://my.example.fr:80' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://my.example.fr:0008080' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://1.2.3.4' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://127.0.0.1' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://127.2.3.4' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://10.23.4.89' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://172.23.4.89' })).toBeUndefined();
    expect(validator({ backendAddress: 'http://192.168.169.170' })).toBeUndefined();
  });
});
