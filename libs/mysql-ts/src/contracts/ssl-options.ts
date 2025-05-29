export interface SslOptions {
    /**
     * A string or buffer holding the PFX or PKCS12 encoded private key, certificate and CA certificates
     */
    pfx?: string;

    /**
     * Either a string/buffer or list of strings/Buffers holding the PEM encoded private key(s) to use
     */
    key?: string | string[] | Buffer | Buffer[];

    /**
     * A string of passphrase for the private key or pfx
     */
    passphrase?: string;

    /**
     * A string/buffer or list of strings/Buffers holding the PEM encoded certificate(s)
     */
    cert?: string | string[] | Buffer | Buffer[];

    /**
     * Either a string/Buffer or list of strings/Buffers of PEM encoded CA certificates to trust.
     */
    ca?: string | string[] | Buffer | Buffer[];

    /**
     * Either a string or list of strings of PEM encoded CRLs (Certificate Revocation List)
     */
    crl?: string | string[];

    /**
     * A string describing the ciphers to use or exclude
     */
    ciphers?: string;

    /**
     * You can also connect to a MySQL server without properly providing the appropriate CA to trust. You should not do this.
     */
    rejectUnauthorized?: boolean;

    /**
     * Configure the minimum supported version of SSL, the default is TLSv1.2.
     */
    minVersion?: string;

    /**
     * Configure the maximum supported version of SSL, the default is TLSv1.3.
     */
    maxVersion?: string;

    /**
     * You can verify the server name identity presented on the server certificate when connecting to a MySQL server.
     * You should enable this but it is disabled by default right now for backwards compatibility.
     */
    verifyIdentity?: boolean;
}

export type SslProfile = {
    ca: string[];
};
