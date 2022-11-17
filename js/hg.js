import HttpClient from "./http_client.js";
import { EspHttpClientMethod, HardwareInfoDTO, HgAppHttpResponseDTO, HgAppSettingsDTO, LoginSession, NetworkStatusData, NetworkStatusDTO, ProvRequestDTO } from "./dtos.js";

const url = 'https://192.168.4.1'
const currentAppVersion = '2.1'

const routes = {
    queue: `${url}/v1/hg/queue`,
    info: `${url}/v1/hardware/info`,
    netTest: `${url}/v1/net/test`,
    netStatus: `${url}/v1/net/status`,
    netProv: `${url}/v1/net/prov`,
}

export class HgErrCode {
    static none = 0
    static exception = 1
    static provWifiFail = 2
    static provNtpFail = 3
    static provRequestFail = 4
}

class HgAppData {
    version = currentAppVersion
    loginSession = new LoginSession()
}

export class Hg {
    info = new HardwareInfoDTO()
    status = new NetworkStatusData()
    settings = new HgAppSettingsDTO()
    appData = new HgAppData()

    async init() {
        try {
            this.info = await HttpClient.request('GET', routes.info)
        } catch (error) {
            alert('Não foi possível se conectar ao dispositivo. Refaça a conexão com o ponto de acesso e clique em OK.')
            await this.init()
        }
    }

    resetData() {
        this.settings = new HgAppSettingsDTO()
        this.appData = new HgAppData()
        this.saveData()
    }

    saveData() {
        try {
            var json = JSON.stringify(this.settings)
            localStorage.setItem('hgDeviceSettings', json)
            json = JSON.stringify(this.appData)
            localStorage.setItem('hgAppData', json)
        } catch (error) {
            console.error(error)
        }
    }

    loadData() {
        try {
            var json = localStorage.getItem('hgDeviceSettings')
            this.settings = JSON.parse(json)
        } catch (error) {
            this.settings = new HgAppSettingsDTO()
        }
        try {
            var json = localStorage.getItem('hgAppData')
            this.appData = JSON.parse(json)
        } catch (error) {
            this.appData = new HgAppData()
        }
        if (this.settings == null || this.appData == null || this.appData.version != currentAppVersion) {
            this.settings = new HgAppSettingsDTO()
            this.appData = new HgAppData()
        }
    }

    async sendMessage(msg) {
        var result = new HgAppHttpResponseDTO()
        try {
            result = await HttpClient.request('POST', routes.queue, msg)
        } catch (error) {
            result.err = HgErrCode.exception
            result.msg = error
        }
        return result
    }

    async getNetworkStatus() {
        var result = new NetworkStatusDTO()
        try {
            result = await HttpClient.request('GET', routes.netStatus)
        } catch (error) {
            result.err = HgErrCode.exception
            result.msg = error
        }
        this.status = result.content
        return result.content
    }

    async provNetwork(url, transport, cert) {
        var result = new HgAppHttpResponseDTO()
        await this.getNetworkStatus()

        if (this.status.wifi_sta == false && this.settings.wifi.sta.ssid != "") {
            result = await this.sendMessage(this.settings.wifi)
            if (result.err != HgErrCode.none) {
                result.err = HgErrCode.provWifiFail
                result.msg = `A conexão com a rede wifi ${this.settings.wifi.sta.ssid} falhou!`
                return result
            }
        }

        if (this.status.ntp == false) {
            result = await this.sendMessage(this.settings.ntp)
            if (result.err != HgErrCode.none) {
                result.err = HgErrCode.provNtpFail
                result.msg = `A sincronização com o servidor NTP ${this.settings.ntp.server1} falhou!`
                return result
            }
        }

        if (this.status.mqtt == false || this.status.bsc == false) {
            var provRequest = new ProvRequestDTO()

            provRequest.config.url = url
            provRequest.config.method = EspHttpClientMethod.HTTP_METHOD_POST
            provRequest.config.transport_type = transport
            provRequest.config.cert_pem = cert

            provRequest.token = `Bearer ${this.appData.loginSession.accessToken}`

            provRequest.data.bleOriginalMac = this.info.nrf_ble_mac
            provRequest.data.email = this.appData.loginSession.credentials.email
            provRequest.data.ewMac = this.info.esp_ew_mac
            provRequest.data.hardware = this.info.hardware
            provRequest.data.pass = this.appData.loginSession.credentials.password
            provRequest.data.type = this.info.type
            provRequest.data.version = this.info.firmware

            result = await HttpClient.request('POST', routes.netProv, provRequest)
            if (result.err != HgErrCode.none) {
                result.err = HgErrCode.provRequestFail
                result.msg = 'A requisição de provisionamento falhou. Refaça o login e tente novamente.'
                return result
            }
            else {
                result.err = HgErrCode.none
                result.msg = 'Provisionamento concluído!'
                return result
            }
        }
    }
}
