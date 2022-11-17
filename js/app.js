import { HgAppGetSsidsAckDTO, HgAppMsgId, HgAppHttpResponseDTO, HgAppQueueMsgDTO, WifiApRecord, HgAppHttpRequestDTO, LoginCredentials, EspHttpClientMethod, LoginResultDTO, NetworkStatusDTO, NetworkStatusData } from './dtos.js'
import { Hg, HgErrCode } from './hg.js'
import Environment from '../env/environment.js'

var $ = (id) => document.getElementById(id)
var hg = new Hg()
var env = new Environment()

window.onload = init

async function init() {
    openTab('tab_conn')

    await hg.init()

    $('field_device').textContent = hg.info.hardware
    $('field_firmware').textContent = hg.info.firmware
    $('field_mac').textContent = hg.info.esp_ew_mac

    env = await Environment.getEnv(hg.info.env)
    hg.loadData()

    $('tab').childNodes.forEach(element => {
        if (element.id != undefined) {
            var tabName = element.id.replace('bt_', '')
            element.onclick = () => { openTab(tabName) }
        }
    });

    $('card_sw_wifi').onclick = () => { toggleSwitch('sw_wifi') }
    $('card_sw_enterprise').onclick = () => { toggleSwitch('sw_enterprise') }
    $('card_sw_ip_wifi').onclick = () => { toggleSwitch('sw_ip_wifi') }
    $('card_sw_eth').onclick = () => { toggleSwitch('sw_eth') }
    $('card_sw_ip_eth').onclick = () => { toggleSwitch('sw_ip_eth') }

    $('sw_wifi').onclick = swWifi_onclick
    $('sw_enterprise').onclick = () => { swShowForm_onclick('sw_enterprise', 'form_enterprise') }
    $('sw_ip_wifi').onclick = () => { swShowForm_onclick('sw_ip_wifi', 'form_ip_wifi') }
    $('sw_eth').onclick = () => { swShowForm_onclick('sw_eth', 'form_eth') }
    $('sw_ip_eth').onclick = () => { swShowForm_onclick('sw_ip_eth', 'form_ip_eth') }

    $('cb_wifi_show_pass').onclick = () => { cbShowPass_onclick('cb_wifi_show_pass', 'wifi_pass') }
    $('cb_email_show_pass').onclick = () => { cbShowPass_onclick('cb_email_show_pass', 'login_pass') }

    $('bt_add_network').onclick = btAddNetwork_onclick
    $('bt_back').onclick = btBack_onclick
    $('bt_wifi_connect').onclick = btWifiConnect_onclick
    $('bt_eth_connect').onclick = btEthConnect_onclick
    $('bt_ntp_send').onclick = btNtpSend_onclick
    $('bt_login').onclick = btLogin_onclick
    $('bt_tab_prov').onclick = btTabProv_onclick
    $('bt_prov').onclick = btProv_onclick

    toggleSwitch('sw_wifi')
    $('wifi_ssid').value = hg.settings.wifi.sta.ssid
    $('wifi_pass').value = hg.settings.wifi.sta.password
    if (hg.settings.wifi.enterprise.enabled) toggleSwitch('sw_enterprise')
    $('eap_id').value = hg.settings.wifi.enterprise.identity
    $('netuser').value = hg.settings.wifi.enterprise.username
    if (hg.settings.wifi.ip.enabled) toggleSwitch('sw_ip_wifi')
    $('wifi_ip').value = hg.settings.wifi.ip.ip
    $('wifi_gateway').value = hg.settings.wifi.ip.gw
    $('wifi_mask').value = hg.settings.wifi.ip.netmask
    $('wifi_dns').value = hg.settings.wifi.ip.dns

    $('op_mode').selectedIndex = hg.settings.ntp.op_mode
    $('sync_mode').selectedIndex = hg.settings.ntp.sync_mode
    $('server1').value = hg.settings.ntp.server1
    $('server2').value = hg.settings.ntp.server2
    $('server3').value = hg.settings.ntp.server3

    if (!hg.settings.ethernet.disabled) toggleSwitch('sw_eth')
    if (hg.settings.ethernet.ip.enabled) toggleSwitch('sw_ip_eth')
    $('eth_ip').value = hg.settings.ethernet.ip.ip
    $('eth_gateway').value = hg.settings.ethernet.ip.gw
    $('eth_mask').value = hg.settings.ethernet.ip.netmask
    $('eth_dns').value = hg.settings.ethernet.ip.dns

    await refreshDeviceStatus()

    if (hg.appData.loginSession.logged == true && hg.settings.wifi.sta.ssid != "" || hg.status.ethernet || hg.status.wifi_sta) {
        openTab('tab_prov')
    }
    else {
        if (hg.status.wifi_sta == false && hg.status.ethernet == false) {
            openTab('tab_wifi')
            return
        }
        if (hg.status.ntp == false) {
            openTab('tab_ntp')
            return
        }
        openTab('tab_login')
    }
}

function toggleSwitch(id) {
    $(id).checked = !$(id).checked
    if ($(id).onclick) $(id).onclick()
}

async function swWifi_onclick() {
    var result = new HgAppGetSsidsAckDTO()
    var status = $('sw_wifi').checked

    $('available_networks').style.display = status ? 'block' : 'none'

    result = await hg.sendMessage(new HgAppQueueMsgDTO(HgAppMsgId.HG_APP_MSG_ID_WIFI_GET_SSIDS))
    if (result.err == HgErrCode.none) {
        ssidListRefresh(result.content)
    }
}

function swShowForm_onclick(swId, formId) {
    var status = $(swId).checked
    $(formId).style.display = status ? 'block' : 'none'
}

function cbShowPass_onclick(cbId, passId) {
    var status = $(cbId).checked
    $(passId).type = status ? 'text' : 'password'
}

function btAddNetwork_onclick() {
    $('ssid_text').innerText = 'Add Network'
    $('field_ssid').style.display = 'block'
    $('card_sw_wifi').style.display = 'none'
    $('wifi_current_network').style.display = 'none'
    $('available_networks').style.display = 'none'
    $('form_wifi').style.display = 'block'
}

function btBack_onclick() {
    $('card_sw_wifi').style.display = 'block'
    $('available_networks').style.display = 'block'
    $('form_wifi').style.display = 'none'
}

async function btWifiConnect_onclick() {
    var result = new HgAppHttpResponseDTO()

    hg.settings.wifi.sta.ssid = $('wifi_ssid').value
    hg.settings.wifi.sta.password = $('wifi_pass').value
    hg.settings.wifi.enterprise.enabled = $('sw_enterprise').checked
    hg.settings.wifi.enterprise.identity = $('eap_id').value
    hg.settings.wifi.enterprise.username = $('netuser').value
    hg.settings.wifi.enterprise.password = hg.settings.wifi.sta.password
    hg.settings.wifi.ip.enabled = $('sw_ip_wifi').checked
    hg.settings.wifi.ip.ip = $('wifi_ip').value
    hg.settings.wifi.ip.gw = $('wifi_gateway').value
    hg.settings.wifi.ip.netmask = $('wifi_mask').value
    hg.settings.wifi.ip.dns = $('wifi_dns').value

    hg.saveData()
    setBtContent('bt_wifi_connect', 'loader')
    result = await hg.sendMessage(hg.settings.wifi)
    setBtContent('bt_wifi_connect', 'Conectar')
    if (result.err != HgErrCode.none) {
        alert(`Houve um erro ao tentar se conectar com o WiFi! (0x${result.err.toString(16)})`)
    } else {
        alert('Conexão realizada com sucesso!')
        openTab('tab_login')
    }
}

async function btEthConnect_onclick() {
    var result = new HgAppHttpResponseDTO()

    hg.settings.ethernet.disabled = $('sw_eth').checked == false
    hg.settings.ethernet.ip.enabled = $('sw_ip_eth').checked
    hg.settings.ethernet.ip.ip = $('eth_ip').value
    hg.settings.ethernet.ip.gw = $('eth_gateway').value
    hg.settings.ethernet.ip.netmask = $('eth_mask').value
    hg.settings.ethernet.ip.dns = $('eth_dns').value

    hg.saveData()
    setBtContent('bt_eth_connect', 'loader')
    result = await hg.sendMessage(hg.settings.ethernet)
    setBtContent('bt_eth_connect', 'Conectar')
    if (result.err != HgErrCode.none) {
        alert(`Houve um erro ao tentar se conectar através da porta ethernet! (0x${result.err.toString(16)})`)
    } else {
        alert('Conexão realizada com sucesso!')
        var netStatus = await hg.getNetworkStatus()
        if (netStatus.ntp == true) {
            if (hg.appData.loginSession.logged == true) {
                openTab('tab_prov')
            }
            else {
                openTab('tab_login')
            }
        }
        else {
            openTab('tab_ntp')
        }
    }
}

async function btNtpSend_onclick() {
    var result = new HgAppHttpResponseDTO()

    hg.settings.ntp.op_mode = $('op_mode').selectedIndex
    hg.settings.ntp.sync_mode = $('sync_mode').selectedIndex
    hg.settings.ntp.server1 = $('server1').value
    hg.settings.ntp.server2 = $('server2').value
    hg.settings.ntp.server3 = $('server3').value

    hg.saveData()
    setBtContent('bt_ntp_send', 'loader')
    result = await hg.sendMessage(hg.settings.ntp)
    setBtContent('bt_ntp_send', 'Enviar')
    if (result.err != HgErrCode.none) {
        alert(`Houve um erro ao tentar sincronizar com NTP! (0x${result.err.toString(16)})`)
    } else {
        alert('Sincronização realizada com sucesso!')
        openTab('tab_login')
    }
}

async function btLogin_onclick() {
    var result = new LoginResultDTO()
    var msg = new HgAppHttpRequestDTO()
    var loginData = new LoginCredentials()

    loginData.email = $('login_email').value
    loginData.password = $('login_pass').value

    msg.config.url = `${env.API_URL}/v1/proteu/signin`
    msg.config.method = EspHttpClientMethod.HTTP_METHOD_POST
    msg.config.transport_type = env.API_TRANSPORT
    msg.config.cert_pem = env.CERT
    msg.auth_token = null
    msg.use_token = false
    msg.content = loginData

    setBtContent('bt_login', 'loader')
    result = await hg.sendMessage(msg)
    setBtContent('bt_login', 'Login')
    if (result.err != HgErrCode.none) {
        alert(`Houve um erro ao realizar o login! (0x${result.err.toString(16)})`)
    } else {
        alert('Login realizado com sucesso!')
        await refreshDeviceStatus()
        openTab('tab_prov')
        hg.appData.loginSession.credentials.email = loginData.email
        hg.appData.loginSession.credentials.password = loginData.password
        hg.appData.loginSession.accessToken = result.content.accessToken
        hg.appData.loginSession.logged = true
        hg.saveData()
    }
}

async function btTabProv_onclick() {
    refreshDeviceStatus()
    openTab('tab_prov')
}

async function refreshDeviceStatus() {
    var netStatus = new NetworkStatusData()
    netStatus = await hg.getNetworkStatus()

    $('field_ethernet').textContent = netStatus.ethernet ? 'conectado' : 'desconectado'
    $('field_wifi').textContent = netStatus.wifi_sta ? 'conectado' : 'desconectado'
    $('field_ntp').textContent = netStatus.ntp ? 'sincronizado' : 'desconectado'
    $('field_cloud').textContent = netStatus.mqtt ? 'conectado' : 'desconectado'
    $('field_ble').textContent = netStatus.bsc ? 'ligado' : 'desligado'

    $('field_ethernet').style.color = netStatus.ethernet ? '#09af1f' : '#ff4f4f'
    $('field_wifi').style.color = netStatus.wifi_sta ? '#09af1f' : '#ff4f4f'
    $('field_ntp').style.color = netStatus.ntp ? '#09af1f' : '#ff4f4f'
    $('field_cloud').style.color = netStatus.mqtt ? '#09af1f' : '#ff4f4f'
    $('field_ble').style.color = netStatus.bsc ? '#09af1f' : '#ff4f4f'
}

async function btProv_onclick() {
    var url = env.API_URL + '/v1/collectorsProv'
    var transport = env.API_TRANSPORT
    var cert = env.CERT

    setBtContent('bt_prov', 'loader')
    var result = await hg.provNetwork(url, transport, cert)
    setBtContent('bt_prov', 'Provisionar')
    alert(result.msg)
    await refreshDeviceStatus()
    setTimeout(async () => {
        await refreshDeviceStatus()
    }, 10000);
}

function ssidListRefresh(data) {
    var ssidList = [new WifiApRecord()]
    var btAddNetwork = $('bt_add_network')

    ssidList = data

    while ($('ssid_list').childNodes.length != 2) {
        $('ssid_list').removeChild($('ssid_list').firstChild)
    }
    $('ssid_list').removeChild(btAddNetwork)

    try {
        ssidList.forEach(element => {
            var li = document.createElement('li')
            li.classList.add('wifi-item')

            var ssidText = document.createTextNode(element.ssid)
            li.appendChild(getImage('icon', '././img/wifi.png'))
            li.appendChild(ssidText)
            $('ssid_list').appendChild(li)

            li.onclick = () => {
                ssidListItem_onclick(element.ssid)
            }
        })
    } catch (error) {
        console.error(error)
    }

    $('ssid_list').appendChild(btAddNetwork)
}

function ssidListItem_onclick(ssidName) {
    $('ssid_text').innerText = ssidName
    $('wifi_ssid').value = ssidName
    $('field_ssid').style.display = 'none'
    $('card_sw_wifi').style.display = 'none'
    $('wifi_current_network').style.display = 'none'
    $('available_networks').style.display = 'none'
    $('form_wifi').style.display = 'block'
}

function openTab(tabName) {
    var i, tabcontent, tablinks
    tabcontent = document.getElementsByClassName("tabcontent")
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"
    }
    tablinks = document.getElementsByClassName("tablinks")
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "")
    }
    document.getElementById(tabName).style.display = "block"
    var bt = document.getElementById('bt_' + tabName)
    if (bt != null)
        bt.className += " active"
}

function getImage(className, src) {
    var img = new Image()
    img.classList.add(className)
    img.src = src
    return img
}

function setBtContent(btId, content) {
    switch (content) {
        case 'loader':
            var _loader = document.createElement('div')
            _loader.classList.add('loader')
            $(btId).textContent = ''
            $(btId).appendChild(_loader)
            break
        case 'sucess':
            $(btId).innerHTML = '&check;'
            $(btId).style.backgroundColor = 'green'
            break
        default:
            $(btId).textContent = content
            $(btId).style.backgroundColor = '#007ACC'
            break
    }
}
