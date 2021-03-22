import validateAddress, { validatePort, validateDomain, validateProtocol } from '../../src/forms/validators/address';

describe('smoke', () => {
  describe('should pass', () => {
    test.each([
      ['http://foo.bar'],
      ['http://127.0.0.1'],
      ['http://localhost'],
      ['https://foo.bar'],
      ['http://foo.bar/path'],
      ['http://foo.bar:8090'],
      ['http://foo-bar.baz'],
      ['http://привет.рф'],
    ])('%s', (a) => {
      expect(() => validateAddress(a)).not.toThrow();
    });
  });

  describe('should fail', () => {
    test.each([
      ['http:8090'],
      ['http:/8090'],
      ['http://foobar'],
      ['http://999.0.0.1'],
      ['ftp://foo.bar'],
      ['http://foo.bar:99999'],
      ['http://foo.bar:-1'],
      ['foobar'],
      ['https://foo..bar'],
      ['http://f.b'],
      ['http://foo-bar'],
      ['http://-привет.рф'],
    ])('%s', (a) => {
      expect(() => validateAddress(a)).toThrow();
    });
  });
});

describe('protocol validator', () => {
  describe('should pass', () => {
    test.each([
      ['http:'],
      ['https:'],
    ])('%s', (a) => {
      expect(() => validateProtocol(a, ['http:', 'https:'])).not.toThrow();
    });
  });
  describe('should fail', () => {
    test.each([
      ['ftp:'],
    ])('%s', (a) => {
      expect(() => validateProtocol(a, ['http:', 'https:'])).toThrow();
    });
  });
});

describe('domain validator', () => {
  const label63Characters = 'f'.repeat(63);
  const domain255Characters = `${label63Characters}.${label63Characters}.${label63Characters}.${label63Characters}`;
  describe('should pass', () => {
    it('one-letter domain', () => {
      expect(() => validateDomain('f.ba')).not.toThrow();
    });
    it('two-letter domain', () => {
      expect(() => validateDomain('fo.ba')).not.toThrow();
    });
    it('label with a hyphen', () => {
      expect(() => validateDomain('fo-oo.bar')).not.toThrow();
    });
    it('label with uppercase / mixed case letters', () => {
      expect(() => validateDomain('FOo.bAr')).not.toThrow();
    });
    it('label length up to 63 characters', () => {
      expect(() => validateDomain(`${label63Characters}.co`)).not.toThrow();
    });
    it('multiple labels', () => {
      expect(() => validateDomain('foo.bar.baz')).not.toThrow();
    });
    it('total length up to 255 characters (including dots)', () => {
      expect(() => validateDomain(domain255Characters)).not.toThrow();
    });
    it('exception word (localhost)', () => {
      expect(() => validateDomain('localhost', ['localhost'])).not.toThrow();
    });
    it('punicode ("привет.рф" to "xn--b1agh1afp.xn--p1ai")', () => {
      expect(() => validateDomain('xn--b1agh1afp.xn--p1ai')).not.toThrow();
    });
  });

  describe('should fail', () => {
    it('single letter top-level domain', () => {
      expect(() => validateDomain('foo.c')).toThrow();
    });
    it('label length exceeds 63 characters', () => {
      expect(() => validateDomain(`${label63Characters}f.co`)).toThrow();
    });
    it('label leading hyphen', () => {
      expect(() => validateDomain('-foo.bar')).toThrow();
    });
    it('label trailing hyphen', () => {
      expect(() => validateDomain('foo-.bar')).toThrow();
    });
    it('top-level domain leading digit', () => {
      expect(() => validateDomain('foo.9bar')).toThrow();
    });
    it('total length exceeds 255 (including dots)', () => {
      // eslint-disable-next-line max-len
      expect(() => validateDomain(`extralength${domain255Characters}`)).toThrow();
    });
  });
});

describe('port validator', () => {
  describe('should pass', () => {
    describe('within 1024-65536 range', () => {
      test.each([
        ['1024'],
        ['8090'],
        ['65535'],
      ])('%s', (port) => {
        expect(() => validatePort(port)).not.toThrow();
      });
    });
  });
  describe('should fail', () => {
    describe('outside 1024-65536 range', () => {
      test.each([
        ['-1'],
        ['1023'],
        ['65536'],
        [Infinity],
        [-Infinity],
      ])('%s', (port) => {
        expect(() => validatePort(port)).toThrow();
      });
    });
    describe('not a finite integer', () => {
      test.each([
        [''],
        ['8090.9'],
        ['foo'],
        [undefined],
        [null],
        [NaN],
      ])('%s', (port) => {
        expect(() => validatePort(port)).toThrow();
      });
    });
  });
});
