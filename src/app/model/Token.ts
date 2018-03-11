export class Token {
    static instance: Token = null;

    constructor(private accessToken: string, private refreshToken: string,
        private lastAccessTokenFetchedDate: number, private expiresIn: number){}

    static createInstance( accessToken = null, refreshToken = null,
        lastAccessTokenFetchedDate = 0, expiresIn = 1097 ) {
        const oldInstance = localStorage.getItem('token');
        if( oldInstance == 'undefined' || !oldInstance || oldInstance == null || oldInstance.toString() === '' ) {
            this.instance = new Token(accessToken, refreshToken, lastAccessTokenFetchedDate, expiresIn);
        } else {
            const oldInstanceObject = JSON.parse(oldInstance);

            this.instance = new Token(oldInstanceObject.accessToken, oldInstanceObject.refreshToken,
                oldInstanceObject.lastAccessTokenFetchedDate, oldInstanceObject.expiresIn);
        }
        return this.instance;
    }

    static getInstance(): Token {
        if(this.instance == null) {
          this.createInstance();
        }
        return this.instance;
    }

    public getAccessToken(): string {
        return this.accessToken;
    }

    public updateAccessToken(accessToken: string, lastAccessTokenFetchedDate: number, expiresIn: number ) {
        this.accessToken = accessToken;
        this.lastAccessTokenFetchedDate = lastAccessTokenFetchedDate;
        this.expiresIn = expiresIn;
        this.lastAccessTokenFetchedDate = <number> (new Date().getTime() / 1000);
    }

    public setAccessToken(accessToken: string) {
        this.accessToken = accessToken;
    }

    public getRefreshToken(): string {
        return this.refreshToken;
    }

    public setRefreshToken(refreshToken: string) {
        this.refreshToken = refreshToken;
    }

    public resetLastAccessTokenFetchedDate() {
        this.lastAccessTokenFetchedDate = <number> (new Date().getTime() / 1000);
        localStorage.setItem('api_token', JSON.stringify(Token.getInstance()));
    }

    public isExpired(): boolean {
        const currentTime = <number> new Date().getTime() / 1000;
        return (((currentTime - this.lastAccessTokenFetchedDate) > this.expiresIn));
    }
}