export default class HttpClient {
    static async request(method, route, data) {
        return new Promise((resolve, reject) => {
            var dataToSend
            const http = new XMLHttpRequest()
            http.onerror = function () {
                return reject(this.status)
            }
            http.onload = function () {
                try {
                    var response = JSON.parse(this.responseText)
                    return resolve(response)
                } catch (err) {
                    console.error(err);
                    console.log(this.responseText)
                    return resolve(this.responseText)
                }
            }
            if(data != null && data != undefined) {
                try {
                    dataToSend = JSON.stringify(data)
                } catch (err) {
                    dataToSend = data
                }
            }
            http.open(method, route, true)
            http.send(dataToSend)
        })
    }
}