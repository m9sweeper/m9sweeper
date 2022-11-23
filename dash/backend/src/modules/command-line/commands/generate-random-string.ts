

export function generateRandomString(stringLen:number): string {

    let randomApiKey = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for ( let i = 0; i < 33; i++ ) {
        randomApiKey += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomApiKey;
}
