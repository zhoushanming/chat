let stompClient = null;

function setConnected(connected) {
    $('#connect').prop('disabled', connected);
    $('#disconnected').prop('disabled', !connected);
    if (connected) {
        $('#conversation').show();
        $('#chat').show();
    } else {
        $('#conversation').hide();
        $('#chat').hide();
    }
    $('#greetings').html('')
}

/**
 * 建立一个 WebSocket 连接。在建立 WebSocket 连接时，用户必须先输入用户名，然后建立连接
 */
function connect() {
    if (!$('#name').val())
        return;
    // 建立 SockJS 连接，然后创建 STOMP 实例发起连接请求
    let socket = new SockJS('/boot-chat/chat');
    stompClient = Stomp.over(socket);
    // 连接成功的回调方法中
    stompClient.connect({}, (frame) => {
        // 首先调用 setConnected 方法进行页面设置
        setConnected(true);
        // 然后调用 subscribe 方法订阅服务器发送回来的消息
        stompClient.subscribe('/topic/greetings', (greeting) => {
            // 并展示服务端发送来的消息
            showGreeting(JSON.parse(greeting.body));
            // 清空原本的输入框
            $('#content').val('')
        })
    });
}

function disconnect() {
    if (stompClient !== null)
        stompClient.disconnect();
    setConnected(false);
}

function sendName() {
    stompClient.send('/app/hello', {}, JSON.stringify({'name': $('#name').val(), 'content': $('#content').val()}))
}

function showGreeting(message) {
    $('#greetings').append(`<div>${message.name}: ${message.content}</div>`)
}

$(function(){
    $('#connect').click(function (){connect()});
    $('#disconnect').click(function (){disconnect()});
    $('#send').click(function (){sendName()});
})