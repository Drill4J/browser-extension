const NOT_DOMAIN_NOR_IP_ERROR = 'Please enter a url address with either valid domain name or IP address';
// eslint-disable-next-line max-len
const DOMAIN_NAME_COMMON_ERROR = 'The domain name must have no hyphens at the start or end, and no hyphens or leading digits in the top-level domain';
const DOMAIN_NAME_MAX_LENGTH_ERROR = 'The domain name may not exceed 255 characters limit (including dots)';
const PROTOCOL_NOT_ALLOWED_ERROR = 'Invalid protocol. Allowed protocols are';
const PORT_INVALID_RANGE_ERROR = 'The port number must be a finite integer inside the 1024 - 65535 range';

export default function addressValidator(value: string): void | never {
  // filter edge cases which "new URL()" interprets as valid ones:
  // punycoded domain name with a leading hyphen
  // http://-привет.рф // TODO That does not break new URL() when ran in Node (but does in a browser). Why?
  // port number interpreted as ipv4 address in hex
  // http:8090
  // http:/8090
  // http://8090
  const containsDomain = /^(https?:\/\/)[^\d-].{1,253}(:\d{4,5})?$/.test(value);
  const containsIpV4 = /^(https?:\/\/)(\d{1,3}\.){3}\d{1,3}(:\d{4,5})?$/.test(value);
  if (!containsDomain && !containsIpV4) {
    throw new Error(NOT_DOMAIN_NOR_IP_ERROR);
  }

  const url = new URL(value);
  validateProtocol(url.protocol, ['http:', 'https:']);
  // ipv4 validation is already handled by URL constructor
  if (containsDomain) {
    validateDomain(url.hostname, ['localhost']);
  }
  if (url.port) {
    validatePort(url.port);
  }
}

export function validateProtocol(protocol: string, allowedProtocols: string[]) {
  if (!allowedProtocols.includes(protocol)) {
    throw new Error(`${PROTOCOL_NOT_ALLOWED_ERROR}: ${allowedProtocols.concat(', ')}`);
  }
}

/*
  Validates domain
    Limits
      52 ASCII letters (A-Za-z), no leading or trailing hyphens
      https://tools.ietf.org/html/rfc1035#:~:text=start%20with%20a%20letter,%20end%20with%20a%20letter%20or%20digit

      note: word "character" here is equivalent to a single ASCII character, which is in turn encoded with a single octet (8-bit byte)

      label 63 characters (including dot),
      https://tools.ietf.org/html/rfc1035#:~:text=labels%20%20%20%20%20%20%20%20%20%2063%20octets%20or%20less

      full name - 255 characters (including dots)
      https://tools.ietf.org/html/rfc1035#:~:text=names%20%20%20%20%20%20%20%20%20%20%20255%20octets%20or%20less

      note: Punycode symbols are encoded with multiple characters, thus, less symbols are allowed
            e.g. in "привет.рф" label "привет" is encoded with "xn--b1agh1afp", occupying 13 characters

      top-level domain - no leading digits (it's a draft, but generally, there are no TLDs starting with digits ATM)
    https://tools.ietf.org/id/draft-liman-tld-names-00.html#:~:text=It%20MUST%20consist%20of%20only,DNS%20lookups%20are%20case%2Dinsensitive
*/

export function validateDomain(domain: string, exceptions: string[] = []) {
  if (domain.length > 255) {
    throw new Error(DOMAIN_NAME_MAX_LENGTH_ERROR);
  }

  //                       one/two-letter    | up to 63 letters                            |two-letter TLD   | up to 63 letters TLD
  // eslint-disable-next-line max-len
  const domainRegex = /^(?:[a-zA-Z0-9]{1,2}\.|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)+([a-zA-Z][a-zA-Z\d]|[a-zA-Z][a-zA-Z-](?:[a-zA-Z0-9-]{1,61})?)$/;
  if (!exceptions.includes(domain) && !domainRegex.test(domain)) {
    // TODO make separated checks instead of regex?
    // TODO explain max label length 63 characters?
    // TODO explain Punycode?
    throw new Error(DOMAIN_NAME_COMMON_ERROR);
  }
}

/*
  Validates port
  1024 - 65535
  https://tools.ietf.org/html/rfc1700#:~:text=The%20Registered%20Ports%20are%20in%20the%20range%201024-65535
*/
export function validatePort(rawPort: number | string) {
  const port = typeof rawPort === 'number' ? rawPort : Number(rawPort);
  if (!Number.isFinite(port)
    || !Number.isInteger(port)
    || port < 1024
    || port > 65535) throw new Error(PORT_INVALID_RANGE_ERROR);
}
