export class HgAppMsgId {
    static HG_APP_MSG_ID_START_HTTP_SERVER = 0
    static HG_APP_MSG_ID_START_ETHERNET = 1
    static HG_APP_MSG_ID_START_NRF_DFU = 2
    static HG_APP_MSG_ID_START_WIFI_AP = 3
    static HG_APP_MSG_ID_START_WIFI_STA = 4
    static HG_APP_MSG_ID_START_NTP = 5
    static HG_APP_MSG_ID_START_MQTT = 6
    static HG_APP_MSG_ID_START_BLE_NETWORK = 7
    static HG_APP_MSG_ID_START_OTA = 8
    static HG_APP_MSG_ID_SET_SETTINGS = 9
    static HG_APP_MSG_ID_RESET_SETTINGS = 10
    static HG_APP_MSG_ID_SAVE_SETTINGS = 11
    static HG_APP_MSG_ID_SOFT_RESET = 12
    static HG_APP_MSG_ID_OTA_ROLLBACK = 13
    static HG_APP_MSG_ID_READ_ADV = 14
    static HG_APP_MSG_ID_SEND_JSON_ARRAY = 15
    static HG_APP_MSG_ID_SEND_HEALTH = 16
    static HG_APP_MSG_ID_SEND_BSC_RQM_ACK = 17
    static HG_APP_MSG_ID_HTTP_REQUEST = 18
    static HG_APP_MSG_ID_WIFI_GET_SSIDS = 19
    static HG_APP_MSG_ID_STOP_BLE_NETWORK = 20
}

export class NtpOpMode {
    static SNTP_OPMODE_POLL = 0
    static SNTP_OPMODE_LISTENONLY = 1
}

export class NtpSyncMode {
    static SNTP_SYNC_MODE_IMMED = 0
    static SNTP_SYNC_MODE_SMOOTH = 1
}

export class EspMqttTransport {
    static MQTT_TRANSPORT_UNKNOWN = 0
    static MQTT_TRANSPORT_OVER_TCP = 1
    static MQTT_TRANSPORT_OVER_SSL = 2
    static MQTT_TRANSPORT_OVER_WS = 3
    static MQTT_TRANSPORT_OVER_WSS = 4
}

export class EspHttpClientTransport {
    static HTTP_TRANSPORT_UNKNOWN = 0
    static HTTP_TRANSPORT_OVER_TCP = 1
    static HTTP_TRANSPORT_OVER_SSL = 2
}

export class EspHttpClientMethod {
    static HTTP_METHOD_GET = 0
    static HTTP_METHOD_POST = 1
    static HTTP_METHOD_PUT = 2
    static HTTP_METHOD_PATCH = 3
    static HTTP_METHOD_DELETE = 4
    static HTTP_METHOD_HEAD = 5
    static HTTP_METHOD_NOTIFY = 6
    static HTTP_METHOD_SUBSCRIBE = 7
    static HTTP_METHOD_UNSUBSCRIBE = 8
    static HTTP_METHOD_OPTIONS = 9
    static HTTP_METHOD_COPY = 10
    static HTTP_METHOD_MOVE = 11
    static HTTP_METHOD_LOCK = 12
    static HTTP_METHOD_UNLOCK = 13
    static HTTP_METHOD_PROPFIND = 14
    static HTTP_METHOD_PROPPATCH = 15
    static HTTP_METHOD_MKCOL = 16
    static HTTP_METHOD_MAX = 17
}

export class WifiAuthMode {
    static WIFI_AUTH_OPEN = 0
    static WIFI_AUTH_WEP = 1
    static WIFI_AUTH_WPA_PSK = 2
    static WIFI_AUTH_WPA2_PSK = 3
    static WIFI_AUTH_WPA_WPA2_PSK = 4
    static WIFI_AUTH_WPA2_ENTERPRISE = 5
    static WIFI_AUTH_WPA3_PSK = 6
    static WIFI_AUTH_WPA2_WPA3_PSK = 7
    static WIFI_AUTH_WAPI_PSK = 8
    static WIFI_AUTH_MAX = 9
}

export class HgAppIpConfig {
    enabled = false
    ip = '0.0.0.0'
    netmask = '0.0.0.0'
    gw = '0.0.0.0'
    dns = '0.0.0.0'
}

export class HgAppWifiStaEnterprise {
    identity = ''
    username = ''
    password = ''
    enabled = false
}

export class WifiStaConfig {
    ssid = ''
    password = ''
}

export class EspHttpClientConfig {
    url = ''
    method = EspHttpClientMethod.HTTP_METHOD_GET
    transport_type = EspHttpClientTransport.HTTP_TRANSPORT_UNKNOWN
    cert_pem = ''
}

export class WifiApRecord {
    bssid = ''
    ssid = ''
    rssi = 0
    authmode = WifiAuthMode.WIFI_AUTH_OPEN
}

export class HgAppQueueMsgDTO {
    id = new HgAppMsgId()
    timeout = 15000

    constructor(id) {
        this.id = id
    }
}

export class HgAppHttpResponseDTO {
    err = 0
    msg = 'ESP_OK(0x0)'
}

export class HgAppEthernetConfigDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_START_ETHERNET
    ip = new HgAppIpConfig()
    disabled = false
}

export class HgAppWifiConfigDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_START_WIFI_STA
    ip = new HgAppIpConfig()
    enterprise = new HgAppWifiStaEnterprise()
    sta = new WifiStaConfig()
    disabled = false
}

export class HgAppNtpConfigDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_START_NTP
    op_mode = NtpOpMode.SNTP_OPMODE_POLL
    sync_interval = 0
    sync_mode = NtpSyncMode.SNTP_SYNC_MODE_IMMED
    server1 = 'pool.ntp.org'
    server2 = ''
    server3 = ''
}

export class EspMqttClientConfigDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_START_MQTT
    host = ''
    port = 0
    username = ''
    password = ''
    transport = EspMqttTransport.MQTT_TRANSPORT_UNKNOWN
    lwt_qos = 0
}

export class HgAppBleNetworkDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_START_BLE_NETWORK
    company_id = 0
    hdr_mac = ''
    collector_id = 0
}

export class HgAppSettingsDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_SET_SETTINGS
    ethernet = new HgAppEthernetConfigDTO()
    wifi = new HgAppWifiConfigDTO()
    ntp = new HgAppNtpConfigDTO
    ble_network = new HgAppBleNetworkDTO()
}

export class HgAppHttpRequestDTO extends HgAppQueueMsgDTO {
    id = HgAppMsgId.HG_APP_MSG_ID_HTTP_REQUEST
    config = new EspHttpClientConfig()
    auth_token = ''
    use_token = false
    content
}

export class HgAppGetSsidsAckDTO extends HgAppHttpResponseDTO {
    content = [new WifiApRecord()]
}

export class HgAppLoginResultAckDTO extends HgAppHttpResponseDTO {
    content = new LoginResult()
}

export class HardwareInfoDTO {
    env = ''
    type = ''
    hardware = ''
    firmware = ''
    hdr_protocol_version = ''
    nrf_ble_mac = ''
    esp_ew_mac = ''
    esp_ble_mac = ''
    esp_eth_mac = ''
    wifi_module = ''
    ble_module = ''
    ble = false
    bleDfu = false
    wifi = false
    eth = false
    rs485 = false
    usb_comm = false
    usb_port_A = false
    usb_micro_port_b = false
    flash_size = 0
}

export class LoginCredentials {
    email = ''
    password = ''
}

export class User
{
    id = 0
    guuid = ''
    email = ''
    firstName = ''
    lastName = ''
}

export class Company
{
    id = 0
}

export class Permission
{
    id = 0
    name = ''
    descrition
    system = 0
    createdAt = ''
    updatedAt = ''
    deletedAt = ''
}

export class LoginResultContent {
    user = new User()
    company = new Company()
    permission = new Permission()
    accessToken = ''
}

export class LoginResultDTO extends HgAppHttpRequestDTO {
    content = new LoginResultContent()
}

export class LoginSession {
    accessToken = ''
    credentials = new LoginCredentials()
    logged = false
}

export class ProvRequestData {
    type = ''
    hardware = ''
    version = ''
    bleOriginalMac = ''
    ewMac = ''
    email = ''
    pass = ''
}

export class ProvRequestDTO {
    config = new EspHttpClientConfig()
    data = new ProvRequestData()
    token = ''
}

export class NetworkStatusData {
    ethernet = false
    wifi_sta = false
    ntp = false
    mqtt = false
    bsc = false
}

export class NetworkStatusDTO extends HgAppHttpRequestDTO{
    content = new NetworkStatusData()
}
