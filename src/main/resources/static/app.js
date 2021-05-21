var app = new Vue({
    el: '#app',
    data: {
        stompClient: null, // stomp 实例
        connected:false, // 连接成功的标识

        name:'', // 用户名
        names:[], // 当前在线的所有用户
        content:'', // 消息内容

        recentMsg:[],// 最近消息列表

        historyMsg:[] ,// 历史消息记录
        drawer: false,// 历史记录匣子显示标识

        faceList: [],// 表情包列表
    },
    mounted(){
        for(let i in emojiList){
            this.faceList.push(emojiList[i].char);
        }
    },
    methods:{
        // 连接
        connect() {
            // 用户名不能为空
            if (!this.name)
                return;
            // 建立 SockJS 连接，然后创建 STOMP 实例发起连接请求
            // let socket = new SockJS('/boot-chat/chat'); // 发布用这个，需要加上发布档的名称 boot-chat
            let socket = new SockJS('/chat'); // 本地测试用这个
            stompClient = Stomp.over(socket);
            // 连接成功的回调方法中
            stompClient.connect({}, (frame) => {
                // 设置连接成功标识
                this.connected = true;
                // 将用户加入在线用户组
                this.names.push(this.name)
                // 设置连接成功通知
                this.$notify({
                    title: '新加入',
                    message: `${this.name} 加入了群聊`,
                    type: 'success',
                    // position: 'top-left'
                });
                // 然后调用 subscribe 方法订阅服务器发送回来的消息
                stompClient.subscribe('/topic/greetings', (greeting) => {
                    // 订阅服务端消息通知
                    // 设置连接成功通知
                    this.$notify({
                        title: '新消息',
                        message: `您有新的未读消息，请注意查看`,
                        type: 'warning'
                    });
                    // 桌面端提示，防止浏览器最小化时错过消息
                    if(window.Notification && Notification.permission !== "denied") {
                        Notification.requestPermission(function(status) {
                            new Notification('新消息', { body: '您有新的未读消息，请注意查看！' });
                        });
                    }
                    // 并展示服务端发送来的消息
                    this.showGreeting(JSON.parse(greeting.body));

                })
            });
        },
        // 断开连接
        disconnect() {
            if (stompClient !== null)
                stompClient.disconnect();
            // 设置断开连接标识
            this.connected = false;
            // 设置连接退出通知
            this.$notify({
                title: '离开',
                message: `${this.name} 离开了群聊`,
                type: 'error',
                // position: 'top-left'
            });
            // 将用户移出在线用户组
            const index = this.names.indexOf(this.name)
            if(index > -1)
                this.names.splice(index, 1)
        },
        // 发送消息
        send() {
            stompClient.send('/app/hello', {}, JSON.stringify({'name': this.name, 'content': this.content}))
          /*  stompClient.send('/app/hello', {}, JSON.stringify({'name': this.name, 'content': compileStr(content)}))*/
            // 清空原本的输入框

            this.content = ''
        },
        //加密消息
        compileStr(message){
            var c=String.fromCharCode(message.charCodeAt(0)+message.length);
            for(var i=1;i<code.length;i++){
                c+=String.fromCharCode(message.charCodeAt(i)+message.charCodeAt(i-1));
            }
            return escape(c);
        },
        //解密消息
        uncompileStr(message){
            message = unescape(message);
            var c=String.fromCharCode(message.charCodeAt(0)-code.length);
            for(var i=1;i<code.length;i++){
                c+=String.fromCharCode(message.charCodeAt(i)-c.charCodeAt(i-1));
            }
            return c;
        },
        // 显示消息
        showGreeting(message) {
            console.log(message)
            // 只保留最近 n 条记录，如果超出，则从开始删除
            while(this.recentMsg.length > 8) this.recentMsg.shift()
            // 将新消息加入最近消息
            this.recentMsg.push(message)
            // 将新消息加入历史记录
            this.historyMsg.push(message)
        },
        // 获取对应表情包
        getEmo(index){
            var textArea=document.getElementById('textarea');
            function changeSelectedText(obj, str) {
                if (window.getSelection) {
                    // 非IE浏览器
                    textArea.setRangeText(str);
                    // 在未选中文本的情况下，重新设置光标位置
                    textArea.selectionStart += str.length;
                    textArea.focus()
                } else if (document.selection) {
                    // IE浏览器
                    obj.focus();
                    var sel = document.selection.createRange();
                    sel.text = str;
                }
            }
            changeSelectedText(textArea,this.faceList[index]);
            this.content=textArea.value;// 要同步data中的数据
            return;
        },
    },
})