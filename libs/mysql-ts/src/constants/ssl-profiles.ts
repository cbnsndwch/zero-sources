'use strict';

import awsCaBundle from 'aws-ssl-profiles';

import type { SslProfile } from '../contracts/ssl-options.js';

/**
 * @deprecated
 * Please, use [**aws-ssl-profiles**](https://github.com/mysqljs/aws-ssl-profiles).
 */
const profiles: Record<string, SslProfile> = {
    ['Amazon RDS']: {
        ca: awsCaBundle.ca
    }
};

export default profiles;
