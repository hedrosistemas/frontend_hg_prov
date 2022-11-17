
export default class Environment
{
    API_URL = ''
    API_TRANSPORT = 0
    CERT = ''

    static async getEnv(env)
    {
        var cert = await fetch('./certs/hedro.cert')
        var data = await fetch('./env/' + env + '.json')
        var json = await data.json()
        json.CERT = await cert.text()
        return json
    }
}